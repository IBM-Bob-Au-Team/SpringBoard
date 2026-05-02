import type { GitHubRepo, GitHubTree, PomDependency } from './types';

export interface ParsedGitHubUrl {
  owner: string;
  repo: string;
  isValid: boolean;
}

export interface RepoAccessResult {
  accessible: boolean;
  repoData?: GitHubRepo;
  error?: string;
  isRateLimited?: boolean;
}

export interface PomData {
  springBootVersion: string;
  javaVersion: string;
  dependencies: string[];
}

export interface IssueDetectionResult {
  needsMigration: boolean;
  issues: string[];
  recommendation: string;
}

/**
 * Parse a GitHub URL to extract owner and repository name
 * Supports various GitHub URL formats
 */
export function parseGitHubUrl(url: string): ParsedGitHubUrl {
  if (!url) {
    return { owner: '', repo: '', isValid: false };
  }

  // Remove trailing slashes and .git extension
  const cleanUrl = url.trim().replace(/\.git$/, '').replace(/\/$/, '');

  // Match various GitHub URL formats:
  // - https://github.com/owner/repo
  // - http://github.com/owner/repo
  // - github.com/owner/repo
  // - git@github.com:owner/repo
  const patterns = [
    /github\.com[\/:]([^\/]+)\/([^\/\s]+)/,
    /^([^\/]+)\/([^\/\s]+)$/, // owner/repo format
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match) {
      const [, owner, repo] = match;
      return {
        owner: owner.trim(),
        repo: repo.trim(),
        isValid: true,
      };
    }
  }

  return { owner: '', repo: '', isValid: false };
}

/**
 * Check if a GitHub repository is accessible
 */
export async function checkRepoAccess(
  owner: string,
  repo: string,
  token?: string
): Promise<RepoAccessResult> {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'SpringBoard-Analyzer',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );

    // Check for rate limiting
    if (response.status === 403) {
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
      if (rateLimitRemaining === '0') {
        return {
          accessible: false,
          error: 'GitHub rate limit reached. Please provide a personal access token to continue.',
          isRateLimited: true,
        };
      }
    }

    if (!response.ok) {
      if (response.status === 404) {
        return {
          accessible: false,
          error: token
            ? 'Repository not found or you do not have access to it'
            : 'Private repo - GitHub token required',
        };
      }

      return {
        accessible: false,
        error: `GitHub API error: ${response.statusText}`,
      };
    }

    const repoData: GitHubRepo = await response.json();

    return {
      accessible: true,
      repoData,
    };
  } catch (error) {
    return {
      accessible: false,
      error: error instanceof Error ? error.message : 'Failed to check repository access',
    };
  }
}

/**
 * Fetch pom.xml content from a GitHub repository
 */
export async function fetchPomXml(
  owner: string,
  repo: string,
  defaultBranch: string = 'main',
  token?: string
): Promise<{ content: string | null; error?: string }> {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'SpringBoard-Analyzer',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // First, get the file tree to check if pom.xml exists
    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
      { headers }
    );

    if (!treeResponse.ok) {
      return {
        content: null,
        error: 'Failed to fetch repository file tree',
      };
    }

    const treeData: GitHubTree = await treeResponse.json();

    // Look for pom.xml in the root
    const pomFile = treeData.tree.find(
      (item) => item.path === 'pom.xml' && item.type === 'blob'
    );

    if (!pomFile) {
      return {
        content: null,
        error: 'No pom.xml found in repository root',
      };
    }

    // Fetch pom.xml content
    const pomResponse = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/pom.xml`,
      { headers }
    );

    if (!pomResponse.ok) {
      return {
        content: null,
        error: 'Failed to fetch pom.xml content',
      };
    }

    const content = await pomResponse.text();

    return { content };
  } catch (error) {
    return {
      content: null,
      error: error instanceof Error ? error.message : 'Failed to fetch pom.xml',
    };
  }
}

/**
 * Parse pom.xml content to extract Spring Boot version, Java version, and dependencies
 */
export function parsePomXml(content: string): PomData {
  // Extract Spring Boot version
  const springBootVersionPatterns = [
    /<spring-boot\.version>([\d.]+)<\/spring-boot\.version>/,
    /<version>(2\.\d+\.\d+)<\/version>[\s\S]*?<artifactId>spring-boot-starter-parent<\/artifactId>/,
    /<artifactId>spring-boot-starter-parent<\/artifactId>[\s\S]*?<version>([\d.]+)<\/version>/,
  ];

  let springBootVersion = 'Unknown';
  for (const pattern of springBootVersionPatterns) {
    const match = content.match(pattern);
    if (match) {
      springBootVersion = match[1];
      break;
    }
  }

  // Extract Java version
  const javaVersionPatterns = [
    /<java\.version>([\d.]+)<\/java\.version>/,
    /<maven\.compiler\.source>([\d.]+)<\/maven\.compiler\.source>/,
    /<maven\.compiler\.target>([\d.]+)<\/maven\.compiler\.target>/,
  ];

  let javaVersion = 'Unknown';
  for (const pattern of javaVersionPatterns) {
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
 * Detect migration issues based on parsed pom.xml data
 */
export function detectIssues(pomData: PomData, pomContent: string): IssueDetectionResult {
  const issues: string[] = [];
  let needsMigration = false;

  const { springBootVersion, javaVersion, dependencies } = pomData;

  // Check Spring Boot version
  if (springBootVersion.startsWith('2.')) {
    needsMigration = true;
    issues.push(
      `Spring Boot ${springBootVersion} is outdated (EOL). Upgrade to 3.x is required.`
    );
  } else if (springBootVersion.startsWith('1.')) {
    needsMigration = true;
    issues.push(
      `Spring Boot ${springBootVersion} is severely outdated. Immediate upgrade required.`
    );
  }

  // Check Java version
  const javaVersionNum = parseFloat(javaVersion);
  if (!isNaN(javaVersionNum) && javaVersionNum < 17) {
    needsMigration = true;
    issues.push(
      `Java ${javaVersion} is below the minimum required version (17) for Spring Boot 3.`
    );
  }

  // Check for javax.* dependencies (need migration to jakarta.*)
  if (pomContent.includes('javax.')) {
    issues.push(
      'Project uses javax.* packages which need migration to jakarta.* for Spring Boot 3.'
    );
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
    issues.push(
      `Found potentially deprecated dependencies: ${foundDeprecated.join(', ')}`
    );
  }

  // Check for security-related dependencies
  if (dependencies.includes('spring-boot-starter-security')) {
    issues.push(
      'Spring Security configuration may need updates for Spring Boot 3 compatibility.'
    );
  }

  // Generate recommendation
  let recommendation = '';
  if (needsMigration) {
    recommendation =
      `This Spring Boot ${springBootVersion} project requires modernization. ` +
      `SpringBoard can automatically upgrade it to Spring Boot 3.1.5 with Java 17, ` +
      `migrate javax.* to jakarta.*, update dependencies, and generate comprehensive documentation.`;
  } else {
    recommendation =
      `This project appears to be running Spring Boot ${springBootVersion} with Java ${javaVersion}. ` +
      `No immediate migration is required, but SpringBoard can still help optimize and document your codebase.`;
  }

  return {
    needsMigration,
    issues,
    recommendation,
  };
}

// Made with Bob