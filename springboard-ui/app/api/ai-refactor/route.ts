import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import {
  getIAMToken,
  refactorPomXml,
  refactorJavaFile,
  refactorDockerfile,
  refactorProperties,
} from '@/lib/watsonx';

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

    // Validate GitHub URL
    const githubUrlPattern = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/;
    const match = repoUrl.match(githubUrlPattern);

    if (!match) {
      return NextResponse.json(
        { error: 'Invalid GitHub repository URL' },
        { status: 400 }
      );
    }

    const [, owner, repo] = match;

    // Get watsonx credentials
    const watsonxKey = watsonxApiKey || process.env.WATSONX_API_KEY;
    const watsonxProjectId = process.env.WATSONX_PROJECT_ID;
    const watsonxUrl = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';

    if (!watsonxKey || !watsonxProjectId) {
      return NextResponse.json(
        {
          error: 'Watsonx.ai is not configured. Please provide your own API key or contact the administrator.',
        },
        { status: 503 }
      );
    }

    // Step 1: Get IAM token for watsonx.ai
    const iamToken = await getIAMToken(watsonxKey);

    // Step 2: Fetch repository files from GitHub
    const headers = {
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'SpringBoard-AI-Modernization',
    };

    // Fetch pom.xml
    const pomResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/pom.xml`,
      { headers }
    );

    if (!pomResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch pom.xml. Make sure the repository has a pom.xml file.' },
        { status: 404 }
      );
    }

    const pomData: GitHubFile = await pomResponse.json();
    const pomContent = Buffer.from(pomData.content || '', 'base64').toString('utf-8');

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

    // Step 3: Get default branch
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );

    if (!repoResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch repository information' },
        { status: 500 }
      );
    }

    const repoData = await repoResponse.json();
    const defaultBranch = repoData.default_branch || 'main';

    // Check if springboard-modernized branch exists
    const branchCheckResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/springboard-modernized`,
      { headers }
    );

    if (branchCheckResponse.ok) {
      return NextResponse.json(
        {
          error: 'Branch "springboard-modernized" already exists. Please delete it first.',
        },
        { status: 409 }
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

    // Create new branch
    const createBranchResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs`,
      {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'refs/heads/springboard-modernized',
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
    const refactoredPom = await refactorPomXml(pomContent, iamToken, watsonxProjectId, watsonxUrl);
    
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
          branch: 'springboard-modernized',
        }),
      }
    );

    changes.push({
      file: 'pom.xml',
      change: 'Upgraded to Spring Boot 3.1.5 and Java 17',
    });

    // Refactor Java files
    for (const javaFile of javaFiles) {
      const refactoredJava = await refactorJavaFile(
        javaFile.content,
        iamToken,
        watsonxProjectId,
        watsonxUrl
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
            branch: 'springboard-modernized',
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
      const refactoredDocker = await refactorDockerfile(
        dockerfileContent,
        iamToken,
        watsonxProjectId,
        watsonxUrl
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
            branch: 'springboard-modernized',
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
      const refactoredProps = await refactorProperties(
        propertiesContent,
        iamToken,
        watsonxProjectId,
        watsonxUrl
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
            branch: 'springboard-modernized',
          }),
        }
      );

      changes.push({
        file: 'src/main/resources/application.properties',
        change: 'Updated deprecated properties',
      });
    }

    // Step 5: Return success
    return NextResponse.json(
      {
        success: true,
        filesRefactored: changes.length,
        branch: 'springboard-modernized',
        branchUrl: `https://github.com/${owner}/${repo}/tree/springboard-modernized`,
        prUrl: `https://github.com/${owner}/${repo}/compare/springboard-modernized`,
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
