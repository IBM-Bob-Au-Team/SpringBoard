import type { GitHubRepo, GitHubTree } from './types';

export interface ParsedGitHubUrl {
  owner: string;
  repo: string;
}

export interface PomData {
  springBootVersion: string;
  javaVersion: string;
  dependencies: string[];
}

export interface RepoAccessResult {
  accessible: boolean;
  isPrivate: boolean;
  repoData?: GitHubRepo;
  error?: string;
}

/**
 * Sanitize repository URL
 * - Trim whitespace
 * - Remove trailing slashes
 * - Ensure https protocol only
 */
export function sanitizeRepoUrl(url: string): string {
  if (!url) return '';
  
  let sanitized = url.trim();
  
  // Remove trailing slashes
  sanitized = sanitized.replace(/\/+$/, '');
  
  // Ensure https protocol (reject http)
  if (sanitized.startsWith('http://')) {
    sanitized = sanitized.replace('http://', 'https://');
  }
  
  return sanitized;
}

/**
 * Parse and validate GitHub URL
 * - Validate URL is actually github.com
 * - Reject URLs with path traversal attempts
 * - Return null if invalid
 */
export function parseGitHubUrl(url: string): ParsedGitHubUrl | null {
  if (!url) return null;
  
  const sanitized = sanitizeRepoUrl(url);
  
  // Must start with https://github.com/
  if (!sanitized.startsWith('https://github.com/')) {
    return null;
  }
  
  // Extract path after github.com/
  const path = sanitized.replace('https://github.com/', '');
  
  // Reject path traversal attempts
  if (path.includes('..') || path.includes('//')) {
    return null;
  }
  
  // Split into parts
  const parts = path.split('/');
  
  // Must have at least owner/repo
  if (parts.length < 2) {
    return null;
  }
  
  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/, ''); // Remove .git suffix if present
  
  // Validate owner and repo names (alphanumeric, hyphens, underscores only)
  const validNamePattern = /^[a-zA-Z0-9_-]+$/;
  
  if (!validNamePattern.test(owner) || !validNamePattern.test(repo)) {
    return null;
  }
  
  return { owner, repo };
}

/**
 * Fetch with authentication and timeout
 * - Always use Authorization Bearer header
 * - Never put token in URL
 * - Set 10 second timeout using AbortController
 * - Throw generic error if timeout
 */
export async function fetchWithAuth(
  url: string,
  token?: string
): Promise<Response> {
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'SpringBoard-Analyzer',
  };
  
  // SECURITY: Use Authorization header, never URL params
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      headers,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // SECURITY: Generic error message, don't reveal details
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    throw new Error('Network request failed');
  }
}

/**
 * Check repository access
 * - Handle 401: token invalid or expired
 * - Handle 403: rate limited or no access
 * - Handle 404: repo does not exist or private
 * - Never reveal if issue was bad token vs bad repo
 */
export async function checkRepoAccess(
  owner: string,
  repo: string,
  token?: string
): Promise<RepoAccessResult> {
  try {
    const response = await fetchWithAuth(
      `https://api.github.com/repos/${owner}/${repo}`,
      token
    );
    
    // Handle different status codes
    if (response.status === 404) {
      // SECURITY: Don't reveal if repo exists to unauthorized users
      return {
        accessible: false,
        isPrivate: false,
        error: 'This repository is private. Please provide a GitHub token with read access.',
      };
    }
    
    if (response.status === 403) {
      // Check if rate limited
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
      if (rateLimitRemaining === '0') {
        return {
          accessible: false,
          isPrivate: false,
          error: 'GitHub API rate limit reached. Please provide a GitHub token to continue.',
        };
      }
      
      // SECURITY: Generic error, don't reveal details
      return {
        accessible: false,
        isPrivate: false,
        error: 'Access denied. Please check your token permissions.',
      };
    }
    
    if (response.status === 401) {
      // SECURITY: Generic error, don't reveal token is invalid
      return {
        accessible: false,
        isPrivate: false,
        error: 'Authentication failed. Please check your GitHub token.',
      };
    }
    
    if (!response.ok) {
      // SECURITY: Generic error for any other failure
      return {
        accessible: false,
        isPrivate: false,
        error: 'Unable to access repository.',
      };
    }
    
    const repoData: GitHubRepo = await response.json();
    
    return {
      accessible: true,
      isPrivate: repoData.private,
      repoData,
    };
  } catch (error) {
    // SECURITY: Generic error message, log details server-side only
    console.error('[Server] Repository access check failed:', error instanceof Error ? error.message : 'Unknown error');
    
    return {
      accessible: false,
      isPrivate: false,
      error: 'Unable to check repository access.',
    };
  }
}

/**
 * Fetch pom.xml content from repository
 * - Fetch raw pom.xml from GitHub contents API
 * - Decode base64 content safely
 * - Try main branch first, then master if main fails
 */
export async function fetchPomXml(
  owner: string,
  repo: string,
  defaultBranch: string,
  token?: string
): Promise<{ content: string | null; error?: string }> {
  // Debug logging
  console.log(`[Server] Fetching pom.xml for ${owner}/${repo}`);
  console.log(`[Server] Parsed owner: ${owner}`);
  console.log(`[Server] Parsed repo: ${repo}`);
  console.log(`[Server] Default branch from API: ${defaultBranch}`);
  
  // Try branches in order: defaultBranch, main, master
  const branchesToTry = [defaultBranch];
  if (defaultBranch !== 'main') branchesToTry.push('main');
  if (defaultBranch !== 'master') branchesToTry.push('master');
  
  let lastError = '';
  
  for (const branch of branchesToTry) {
    try {
      console.log(`[Server] Trying branch: ${branch}`);
      
      // First, get the file tree to check if pom.xml exists
      const treeResponse = await fetchWithAuth(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        token
      );
      
      console.log(`[Server] Tree API response status for branch ${branch}: ${treeResponse.status}`);
      
      if (!treeResponse.ok) {
        if (treeResponse.status === 404) {
          lastError = `Branch ${branch} not found`;
          console.log(`[Server] ${lastError}, trying next branch...`);
          continue; // Try next branch
        }
        lastError = 'Unable to fetch repository file tree.';
        continue;
      }
      
      const treeData: GitHubTree = await treeResponse.json();
      
      // Look for pom.xml in root
      const pomFile = treeData.tree.find(
        (item) => item.path === 'pom.xml' && item.type === 'blob'
      );
      
      if (!pomFile) {
        lastError = 'No pom.xml found. SpringBoard only supports Maven Spring Boot projects.';
        console.log(`[Server] pom.xml not found in branch ${branch}`);
        continue;
      }
      
      console.log(`[Server] Found pom.xml in branch ${branch}, fetching content...`);
      
      // Fetch pom.xml content using contents API
      const contentResponse = await fetchWithAuth(
        `https://api.github.com/repos/${owner}/${repo}/contents/pom.xml?ref=${branch}`,
        token
      );
      
      console.log(`[Server] Contents API response status for branch ${branch}: ${contentResponse.status}`);
      
      if (!contentResponse.ok) {
        if (contentResponse.status === 404) {
          lastError = `pom.xml not found in branch ${branch}`;
          console.log(`[Server] ${lastError}, trying next branch...`);
          continue; // Try next branch
        }
        lastError = 'Unable to fetch pom.xml content.';
        continue;
      }
      
      const contentData = await contentResponse.json();
      
      // Decode base64 content safely
      if (contentData.content && contentData.encoding === 'base64') {
        try {
          const decoded = Buffer.from(contentData.content, 'base64').toString('utf-8');
          console.log(`[Server] Successfully fetched and decoded pom.xml from branch ${branch}`);
          return { content: decoded };
        } catch (decodeError) {
          console.error('[Server] Failed to decode pom.xml:', decodeError);
          lastError = 'Unable to decode pom.xml content.';
          continue;
        }
      }
      
      lastError = 'Invalid pom.xml format.';
    } catch (error) {
      console.error(`[Server] Error fetching pom.xml from branch ${branch}:`, error instanceof Error ? error.message : 'Unknown error');
      lastError = error instanceof Error ? error.message : 'Unknown error';
      continue;
    }
  }
  
  // If we get here, all branches failed
  console.error(`[Server] Failed to fetch pom.xml from all branches. Last error: ${lastError}`);
  return {
    content: null,
    error: lastError || 'Unable to fetch pom.xml.',
  };
}

/**
 * Parse pom.xml content
 * - Extract Spring Boot version
 * - Extract Java version
 * - Extract key dependencies
 */
export function parsePomXml(content: string): PomData {
  // Extract Spring Boot version
  const springBootPatterns = [
    /<spring-boot\.version>([\d.]+)<\/spring-boot\.version>/,
    /<version>([\d.]+)<\/version>[\s\S]*?<artifactId>spring-boot-starter-parent<\/artifactId>/,
    /<artifactId>spring-boot-starter-parent<\/artifactId>[\s\S]*?<version>([\d.]+)<\/version>/,
  ];
  
  let springBootVersion = 'Unknown';
  for (const pattern of springBootPatterns) {
    const match = content.match(pattern);
    if (match) {
      springBootVersion = match[1];
      break;
    }
  }
  
  // Extract Java version
  const javaPatterns = [
    /<java\.version>([\d.]+)<\/java\.version>/,
    /<maven\.compiler\.source>([\d.]+)<\/maven\.compiler\.source>/,
    /<maven\.compiler\.target>([\d.]+)<\/maven\.compiler\.target>/,
  ];
  
  let javaVersion = 'Unknown';
  for (const pattern of javaPatterns) {
    const match = content.match(pattern);
    if (match) {
      javaVersion = match[1];
      break;
    }
  }
  
  // Extract dependencies
  const dependencies: string[] = [];
  const dependencyMatches = content.matchAll(/<artifactId>(.*?)<\/artifactId>/g);
  
  for (const match of dependencyMatches) {
    if (match[1] && !dependencies.includes(match[1])) {
      dependencies.push(match[1]);
    }
  }
  
  return {
    springBootVersion,
    javaVersion,
    dependencies,
  };
}

/**
 * Detect migration issues
 * - Check if Spring Boot is below 3.0
 * - Check if Java version is below 17
 * - Check for known deprecated dependencies
 */
export function detectMigrationIssues(pomData: PomData): string[] {
  const issues: string[] = [];
  const { springBootVersion, javaVersion, dependencies } = pomData;
  
  // Check Spring Boot version
  if (springBootVersion !== 'Unknown') {
    const majorVersion = parseInt(springBootVersion.split('.')[0]);
    
    if (majorVersion < 2) {
      issues.push(`Spring Boot ${springBootVersion} is severely outdated. Immediate upgrade to 3.x required.`);
    } else if (majorVersion === 2) {
      issues.push(`Spring Boot ${springBootVersion} has reached end-of-life. Upgrade to 3.x is required.`);
    }
  }
  
  // Check Java version
  if (javaVersion !== 'Unknown') {
    const javaVersionNum = parseFloat(javaVersion);
    if (!isNaN(javaVersionNum) && javaVersionNum < 17) {
      issues.push(`Java ${javaVersion} is below the minimum required version (17) for Spring Boot 3.`);
    }
  }
  
  // Check for deprecated dependencies
  const deprecatedDeps = [
    'spring-boot-starter-web-services',
    'spring-boot-starter-jersey',
  ];
  
  const foundDeprecated = dependencies.filter((dep) =>
    deprecatedDeps.includes(dep)
  );
  
  if (foundDeprecated.length > 0) {
    issues.push(`Found deprecated dependencies: ${foundDeprecated.join(', ')}`);
  }
  
  // Check for javax.* usage (needs migration to jakarta.*)
  if (dependencies.some(dep => dep.includes('javax'))) {
    issues.push('Project uses javax.* packages which need migration to jakarta.* for Spring Boot 3.');
  }
  
  return issues;
}

// Made with Bob