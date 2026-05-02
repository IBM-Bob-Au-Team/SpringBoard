import { NextRequest, NextResponse } from 'next/server';
import type { AnalyzeRequest, AnalysisResult, GitHubRepo, GitHubTree, GitHubTreeItem } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { repoUrl, token } = body;

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      );
    }

    // Parse GitHub URL to extract owner and repo name
    const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!urlMatch) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL format. Expected: https://github.com/owner/repo' },
        { status: 400 }
      );
    }

    const [, owner, repoName] = urlMatch;
    const cleanRepoName = repoName.replace(/\.git$/, '');

    // Set up headers for GitHub API
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'SpringBoard-Analyzer',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Check if repo is accessible
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${cleanRepoName}`,
      { headers }
    );

    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        return NextResponse.json({
          accessible: false,
          repoName: cleanRepoName,
          repoUrl,
          needsMigration: false,
          issues: [],
          recommendation: '',
          error: token 
            ? 'Repository not found or you do not have access to it'
            : 'Private repo - GitHub token required',
        } as AnalysisResult);
      }
      
      return NextResponse.json(
        { error: `GitHub API error: ${repoResponse.statusText}` },
        { status: repoResponse.status }
      );
    }

    const repoData: GitHubRepo = await repoResponse.json();

    // Get the file tree
    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${cleanRepoName}/git/trees/${repoData.default_branch}?recursive=1`,
      { headers }
    );

    if (!treeResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch repository file tree' },
        { status: treeResponse.status }
      );
    }

    const treeData: GitHubTree = await treeResponse.json();

    // Look for pom.xml
    const pomFile = treeData.tree.find((item: GitHubTreeItem) => 
      item.path === 'pom.xml' && item.type === 'blob'
    );

    if (!pomFile) {
      return NextResponse.json({
        accessible: true,
        repoName: repoData.name,
        repoUrl: repoData.html_url,
        repoDescription: repoData.description,
        needsMigration: false,
        issues: ['No pom.xml found in repository root'],
        recommendation: 'This does not appear to be a Maven/Spring Boot project. SpringBoard only supports Maven-based Spring Boot projects.',
        error: 'No pom.xml found - not a Maven/Spring Boot project',
      } as AnalysisResult);
    }

    // Fetch pom.xml content
    const pomResponse = await fetch(
      `https://raw.githubusercontent.com/${owner}/${cleanRepoName}/${repoData.default_branch}/pom.xml`,
      { headers }
    );

    if (!pomResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch pom.xml content' },
        { status: pomResponse.status }
      );
    }

    const pomContent = await pomResponse.text();

    // Parse pom.xml for Spring Boot version and Java version
    const springBootVersionMatch = pomContent.match(/<spring-boot\.version>([\d.]+)<\/spring-boot\.version>/) ||
                                   pomContent.match(/<version>(2\.\d+\.\d+)<\/version>[\s\S]*?<artifactId>spring-boot-starter-parent<\/artifactId>/) ||
                                   pomContent.match(/<artifactId>spring-boot-starter-parent<\/artifactId>[\s\S]*?<version>([\d.]+)<\/version>/);
    
    const javaVersionMatch = pomContent.match(/<java\.version>([\d.]+)<\/java\.version>/) ||
                            pomContent.match(/<maven\.compiler\.source>([\d.]+)<\/maven\.compiler\.source>/) ||
                            pomContent.match(/<maven\.compiler\.target>([\d.]+)<\/maven\.compiler\.target>/);

    const springBootVersion = springBootVersionMatch ? springBootVersionMatch[1] : 'Unknown';
    const javaVersion = javaVersionMatch ? javaVersionMatch[1] : 'Unknown';

    // Extract dependencies
    const dependencies: string[] = [];
    const dependencyMatches = pomContent.matchAll(/<artifactId>(.*?)<\/artifactId>/g);
    for (const match of dependencyMatches) {
      if (match[1] && !dependencies.includes(match[1])) {
        dependencies.push(match[1]);
      }
    }

    // Analyze for migration needs
    const issues: string[] = [];
    let needsMigration = false;

    // Check Spring Boot version
    if (springBootVersion.startsWith('2.')) {
      needsMigration = true;
      issues.push(`Spring Boot ${springBootVersion} is outdated (EOL). Upgrade to 3.x is required.`);
    } else if (springBootVersion.startsWith('1.')) {
      needsMigration = true;
      issues.push(`Spring Boot ${springBootVersion} is severely outdated. Immediate upgrade required.`);
    }

    // Check Java version
    const javaVersionNum = parseFloat(javaVersion);
    if (javaVersionNum < 17) {
      needsMigration = true;
      issues.push(`Java ${javaVersion} is below the minimum required version (17) for Spring Boot 3.`);
    }

    // Check for javax.* dependencies (need migration to jakarta.*)
    if (pomContent.includes('javax.')) {
      issues.push('Project uses javax.* packages which need migration to jakarta.* for Spring Boot 3.');
    }

    // Check for deprecated dependencies
    const deprecatedDeps = ['spring-boot-starter-web-services', 'spring-boot-starter-jersey'];
    const foundDeprecated = dependencies.filter(dep => deprecatedDeps.includes(dep));
    if (foundDeprecated.length > 0) {
      issues.push(`Found potentially deprecated dependencies: ${foundDeprecated.join(', ')}`);
    }

    // Generate recommendation
    let recommendation = '';
    if (needsMigration) {
      recommendation = `This Spring Boot ${springBootVersion} project requires modernization. ` +
        `SpringBoard can automatically upgrade it to Spring Boot 3.1.5 with Java 17, ` +
        `migrate javax.* to jakarta.*, update dependencies, and generate comprehensive documentation.`;
    } else {
      recommendation = `This project appears to be running Spring Boot ${springBootVersion} with Java ${javaVersion}. ` +
        `No immediate migration is required, but SpringBoard can still help optimize and document your codebase.`;
    }

    const result: AnalysisResult = {
      accessible: true,
      repoName: repoData.name,
      repoUrl: repoData.html_url,
      repoDescription: repoData.description,
      springBootVersion,
      javaVersion,
      dependencies: dependencies.slice(0, 20), // Limit to first 20 dependencies
      needsMigration,
      issues,
      recommendation,
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Made with Bob
