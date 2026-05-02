import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { refactorWithWatsonx } from '@/lib/watsonx';

interface AIRefactorRequest {
  repoUrl: string;
  githubToken: string;
  watsonxApiKey?: string;
}

interface FileChange {
  file: string;
  change: string;
}

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content?: string;
  encoding?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 requests per IP per hour (AI calls are expensive)
    const clientIp = getClientIp(request);
    const rateLimitResult = checkRateLimit(clientIp, 3, 60 * 60 * 1000);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          },
        }
      );
    }

    const body: AIRefactorRequest = await request.json();
    const { repoUrl, githubToken, watsonxApiKey } = body;

    // Validate inputs
    if (!repoUrl || !githubToken) {
      return NextResponse.json(
        { error: 'Repository URL and GitHub token are required' },
        { status: 400 }
      );
    }

    // Validate and parse GitHub URL
    // Remove trailing slashes and .git suffix
    const cleanUrl = repoUrl.trim().replace(/\/+$/, '').replace(/\.git$/, '');
    const githubUrlPattern = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)$/;
    const match = cleanUrl.match(githubUrlPattern);

    if (!match) {
      console.error('[Server] Invalid GitHub URL:', repoUrl);
      return NextResponse.json(
        { error: 'Invalid GitHub repository URL. Expected format: https://github.com/owner/repo' },
        { status: 400 }
      );
    }

    const [, owner, repo] = match;
    console.log('[Server] Parsed GitHub URL - Owner:', owner, 'Repo:', repo);

    // Validate watsonx credentials
    const watsonxKey = watsonxApiKey || process.env.WATSONX_API_KEY;
    const watsonxProjectId = process.env.WATSONX_PROJECT_ID;

    if (!watsonxKey || !watsonxProjectId) {
      return NextResponse.json(
        {
          error: 'IBM watsonx.ai service is temporarily unavailable. Please try again later or provide your own API key.',
        },
        { status: 503 }
      );
    }

    // Step 1: Verify repository access first
    console.log(`[Server] Checking access to ${owner}/${repo}`);
    console.log(`[Server] GitHub token present:`, !!githubToken);
    console.log(`[Server] GitHub token length:`, githubToken?.length);
    console.log(`[Server] GitHub token prefix:`, githubToken?.substring(0, 4));
    
    const repoCheckResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SpringBoard-AI-Modernization',
        },
      }
    );

    console.log(`[Server] Repository check response status:`, repoCheckResponse.status);

    if (!repoCheckResponse.ok) {
      const errorBody = await repoCheckResponse.text();
      console.error(`[Server] Repository access failed:`, repoCheckResponse.status, errorBody);
      
      let errorMessage = 'Unable to access repository. ';
      
      if (repoCheckResponse.status === 401) {
        errorMessage += 'GitHub token is invalid or expired. Please create a new token with "repo" scope.';
      } else if (repoCheckResponse.status === 403) {
        errorMessage += 'GitHub token does not have permission to access this repository. Make sure your token has "repo" scope with write access.';
      } else if (repoCheckResponse.status === 404) {
        errorMessage += 'Repository not found or token does not have access. Verify the repository URL and that your token has "repo" scope.';
      } else {
        errorMessage += `GitHub API error (${repoCheckResponse.status}): ${errorBody}`;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: repoCheckResponse.status }
      );
    }
    
    console.log(`[Server] Repository access successful`);

    // Step 3: Fetch repository files from GitHub
    const headers = {
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'SpringBoard-AI-Modernization',
    };

    // Get repository info to determine default branch
    const repoInfoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );

    if (!repoInfoResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch repository information' },
        { status: 500 }
      );
    }

    const repoInfo = await repoInfoResponse.json();
    const defaultBranch = repoInfo.default_branch || 'main';

    // Debug logging
    console.log(`[Server] Fetching pom.xml from ${owner}/${repo}`);
    console.log(`[Server] Parsed owner: ${owner}`);
    console.log(`[Server] Parsed repo: ${repo}`);
    console.log(`[Server] Default branch: ${defaultBranch}`);

    // Try branches in order: defaultBranch, main, master
    const branchesToTry = [defaultBranch];
    if (defaultBranch !== 'main') branchesToTry.push('main');
    if (defaultBranch !== 'master') branchesToTry.push('master');

    let pomData: GitHubFile | null = null;
    let pomContent = '';
    let lastError = '';

    for (const branch of branchesToTry) {
      console.log(`[Server] Trying to fetch pom.xml from branch: ${branch}`);
      
      const pomResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/pom.xml?ref=${branch}`,
        { headers }
      );

      console.log(`[Server] GitHub API response status for branch ${branch}: ${pomResponse.status}`);

      if (pomResponse.ok) {
        const fetchedPomData: GitHubFile = await pomResponse.json();
        pomData = fetchedPomData;
        pomContent = Buffer.from(fetchedPomData.content || '', 'base64').toString('utf-8');
        console.log(`[Server] Successfully fetched pom.xml from branch ${branch}`);
        break;
      } else if (pomResponse.status === 404) {
        lastError = `pom.xml not found in branch ${branch}`;
        console.log(`[Server] ${lastError}, trying next branch...`);
        continue;
      } else {
        const errorText = await pomResponse.text();
        console.error(`[Server] Failed to fetch pom.xml from branch ${branch}: ${pomResponse.status} - ${errorText}`);
        lastError = errorText;
        
        // For non-404 errors, don't try other branches
        let errorMessage = 'Failed to fetch pom.xml. ';
        
        if (pomResponse.status === 401) {
          errorMessage += 'GitHub token authentication failed. Please check your token.';
        } else if (pomResponse.status === 403) {
          errorMessage += 'Access denied. Make sure your GitHub token has "repo" scope with read permissions.';
        } else {
          errorMessage += `GitHub API returned status ${pomResponse.status}. Please try again.`;
        }
        
        return NextResponse.json(
          { error: errorMessage, details: errorText },
          { status: pomResponse.status }
        );
      }
    }

    // If we couldn't fetch pom.xml from any branch
    if (!pomData || !pomContent) {
      console.error(`[Server] Failed to fetch pom.xml from all branches. Last error: ${lastError}`);
      return NextResponse.json(
        {
          error: 'Failed to fetch pom.xml. The pom.xml file was not found in the repository root. Please ensure it exists at the root level.',
          details: lastError
        },
        { status: 404 }
      );
    }

    // Fetch Java files
    const javaFiles: Array<{ path: string; content: string; sha: string }> = [];
    const srcResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/src/main/java`,
      { headers }
    );

    if (srcResponse.ok) {
      const srcData: GitHubFile[] = await srcResponse.json();
      
      // Recursively fetch all Java files
      async function fetchJavaFiles(items: GitHubFile[], basePath: string = '') {
        for (const item of items) {
          if (item.type === 'file' && item.name.endsWith('.java')) {
            const fileResponse = await fetch(item.url, { headers });
            if (fileResponse.ok) {
              const fileData: GitHubFile = await fileResponse.json();
              const content = Buffer.from(fileData.content || '', 'base64').toString('utf-8');
              javaFiles.push({
                path: item.path,
                content,
                sha: fileData.sha,
              });
            }
          } else if (item.type === 'dir') {
            const dirResponse = await fetch(item.url, { headers });
            if (dirResponse.ok) {
              const dirData: GitHubFile[] = await dirResponse.json();
              await fetchJavaFiles(dirData, item.path);
            }
          }
        }
      }

      await fetchJavaFiles(srcData);
    }

    // Fetch Dockerfile (optional)
    let dockerfileContent: string | null = null;
    let dockerfileSha: string | null = null;
    const dockerResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/Dockerfile`,
      { headers }
    );

    if (dockerResponse.ok) {
      const dockerData: GitHubFile = await dockerResponse.json();
      dockerfileContent = Buffer.from(dockerData.content || '', 'base64').toString('utf-8');
      dockerfileSha = dockerData.sha;
    }

    // Fetch application.properties (optional)
    let propertiesContent: string | null = null;
    let propertiesSha: string | null = null;
    const propsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/src/main/resources/application.properties`,
      { headers }
    );

    if (propsResponse.ok) {
      const propsData: GitHubFile = await propsResponse.json();
      propertiesContent = Buffer.from(propsData.content || '', 'base64').toString('utf-8');
      propertiesSha = propsData.sha;
    }

    // Find available branch name (handle conflicts automatically)
    let branchName = 'springboard-modernized';
    let branchExists = true;
    let attemptCount = 0;
    const maxAttempts = 100;

    while (branchExists && attemptCount < maxAttempts) {
      const branchCheckResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branchName}`,
        { headers }
      );

      if (!branchCheckResponse.ok) {
        // Branch doesn't exist, we can use this name
        branchExists = false;
        console.log(`[Server] Using branch name: ${branchName}`);
      } else {
        // Branch exists, try with incremental number
        attemptCount++;
        branchName = `springboard-modernized-${attemptCount}`;
        console.log(`[Server] Branch exists, trying: ${branchName}`);
      }
    }

    if (attemptCount >= maxAttempts) {
      return NextResponse.json(
        {
          error: 'Unable to create a unique branch name after 100 attempts. Please delete some old branches.',
        },
        { status: 500 }
      );
    }

    // Get default branch SHA
    const refResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${defaultBranch}`,
      { headers }
    );

    if (!refResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to get default branch reference' },
        { status: 500 }
      );
    }

    const refData = await refResponse.json();
    const defaultSha = refData.object.sha;

    // Create new branch with the available name
    const createBranchResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs`,
      {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: defaultSha,
        }),
      }
    );

    if (!createBranchResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to create branch' },
        { status: 500 }
      );
    }

    // Step 4: Refactor files using IBM Granite
    const changes: FileChange[] = [];

    // Refactor pom.xml
    const refactoredPom = await refactorWithWatsonx(pomContent, 'pom', watsonxKey);
    
    // Push refactored pom.xml
    await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/pom.xml`,
      {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'chore: upgrade to Spring Boot 3.1.5 and Java 17',
          content: Buffer.from(refactoredPom).toString('base64'),
          sha: pomData.sha,
          branch: branchName,
        }),
      }
    );

    changes.push({
      file: 'pom.xml',
      change: 'Upgraded to Spring Boot 3.1.5 and Java 17',
    });

    // Refactor Java files
    for (const javaFile of javaFiles) {
      const refactoredJava = await refactorWithWatsonx(
        javaFile.content,
        'java',
        watsonxKey
      );

      await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${javaFile.path}`,
        {
          method: 'PUT',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `refactor: migrate ${javaFile.path} to Spring Boot 3`,
            content: Buffer.from(refactoredJava).toString('base64'),
            sha: javaFile.sha,
            branch: branchName,
          }),
        }
      );

      changes.push({
        file: javaFile.path,
        change: 'Migrated javax.* to jakarta.* and updated annotations',
      });
    }

    // Refactor Dockerfile if exists
    if (dockerfileContent && dockerfileSha) {
      const refactoredDocker = await refactorWithWatsonx(
        dockerfileContent,
        'dockerfile',
        watsonxKey
      );

      await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/Dockerfile`,
        {
          method: 'PUT',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'chore: update Dockerfile for Java 17',
            content: Buffer.from(refactoredDocker).toString('base64'),
            sha: dockerfileSha,
            branch: branchName,
          }),
        }
      );

      changes.push({
        file: 'Dockerfile',
        change: 'Updated to Java 17 base image',
      });
    }

    // Refactor application.properties if exists
    if (propertiesContent && propertiesSha) {
      const refactoredProps = await refactorWithWatsonx(
        propertiesContent,
        'properties',
        watsonxKey
      );

      await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/src/main/resources/application.properties`,
        {
          method: 'PUT',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'chore: update application properties for Spring Boot 3',
            content: Buffer.from(refactoredProps).toString('base64'),
            sha: propertiesSha,
            branch: branchName,
          }),
        }
      );

      changes.push({
        file: 'src/main/resources/application.properties',
        change: 'Updated deprecated properties',
      });
    }

    // Step 5: Create Pull Request
    const prTitle = '🚀 Modernize to Spring Boot 3.1.5 and Java 17';
    const prBody = `## 🤖 AI-Powered Modernization by SpringBoard

This pull request contains automated modernization changes generated by IBM watsonx.ai Granite model.

### 📋 Changes Summary
${changes.map(c => `- **${c.file}**: ${c.change}`).join('\n')}

### ✨ What's New
- ✅ Upgraded to Spring Boot 3.1.5
- ✅ Migrated to Java 17
- ✅ Updated javax.* to jakarta.*
- ✅ Fixed deprecated APIs and annotations
- ✅ Updated Dockerfile for Java 17

### 🔍 Review Checklist
- [ ] Review all code changes
- [ ] Run tests locally
- [ ] Verify application starts successfully
- [ ] Check for any breaking changes

### 📚 Resources
- [Spring Boot 3 Migration Guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide)
- [Jakarta EE Migration](https://jakarta.ee/specifications/platform/9/jakarta-platform-spec-9.0.html)

---
*Generated by [SpringBoard](https://github.com/yourusername/springboard) - AI-powered Spring Boot modernization*`;

    const createPrResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: prTitle,
          body: prBody,
          head: branchName,
          base: defaultBranch,
        }),
      }
    );

    let prUrl = `https://github.com/${owner}/${repo}/compare/${branchName}`;
    
    if (createPrResponse.ok) {
      const prData = await createPrResponse.json();
      prUrl = prData.html_url;
      console.log(`[Server] Pull request created successfully: ${prUrl}`);
    } else {
      const prError = await createPrResponse.text();
      console.error(`[Server] Failed to create pull request: ${createPrResponse.status} - ${prError}`);
      // Continue anyway - branch was created successfully
    }

    // Step 6: Return success
    return NextResponse.json(
      {
        success: true,
        filesRefactored: changes.length,
        branch: branchName,
        branchUrl: `https://github.com/${owner}/${repo}/tree/${branchName}`,
        prUrl,
        changes,
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
        },
      }
    );
  } catch (error) {
    console.error('AI Refactor API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred during AI refactoring',
      },
      { status: 500 }
    );
  }
}

// Made with Bob
