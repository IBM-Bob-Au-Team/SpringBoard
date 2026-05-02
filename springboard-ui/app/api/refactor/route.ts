import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

interface RefactorRequest {
  repoUrl: string;
  token: string;
}

interface GitHubRepo {
  owner: {
    login: string;
  };
  name: string;
  default_branch: string;
  permissions?: {
    push: boolean;
  };
}

interface GitHubRef {
  ref: string;
  object: {
    sha: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests per IP per minute
    const clientIp = getClientIp(request);
    const rateLimitResult = checkRateLimit(clientIp, 5, 60 * 1000);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          }
        }
      );
    }

    const body: RefactorRequest = await request.json();
    const { repoUrl, token } = body;

    // Validate inputs
    if (!repoUrl || !token) {
      return NextResponse.json(
        { error: 'Repository URL and token are required' },
        { status: 400 }
      );
    }

    // Validate GitHub URL
    const githubUrlPattern = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/;
    const match = repoUrl.match(githubUrlPattern);

    if (!match) {
      return NextResponse.json(
        { error: 'Invalid GitHub repository URL. Expected format: https://github.com/owner/repo' },
        { status: 400 }
      );
    }

    const [, owner, repo] = match;

    // Validate token format
    if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
      return NextResponse.json(
        { error: 'Invalid token format. GitHub tokens should start with "ghp_" or "github_pat_"' },
        { status: 400 }
      );
    }

    // Verify token has write access
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SpringBoard-Modernization',
      },
    });

    if (!repoResponse.ok) {
      if (repoResponse.status === 401) {
        return NextResponse.json(
          { error: 'Invalid token. Please check your GitHub token and try again.' },
          { status: 401 }
        );
      }
      if (repoResponse.status === 404) {
        return NextResponse.json(
          { error: 'Repository not found or token does not have access to this repository.' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to verify repository access' },
        { status: repoResponse.status }
      );
    }

    const repoData: GitHubRepo = await repoResponse.json();

    // Check if token has push permission
    if (!repoData.permissions?.push) {
      return NextResponse.json(
        { 
          error: 'Token does not have write access to this repository. Make sure you selected the "repo" scope when creating the token.' 
        },
        { status: 403 }
      );
    }

    const defaultBranch = repoData.default_branch || 'main';
    const branchName = 'springboard-modernized';

    // Check if branch already exists
    const branchCheckResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branchName}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SpringBoard-Modernization',
        },
      }
    );

    if (branchCheckResponse.ok) {
      return NextResponse.json(
        { 
          error: `Branch "${branchName}" already exists in your repository. Please delete it first or use a different repository.`,
          branchExists: true,
        },
        { status: 409 }
      );
    }

    // Get the default branch SHA
    const defaultBranchResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${defaultBranch}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SpringBoard-Modernization',
        },
      }
    );

    if (!defaultBranchResponse.ok) {
      return NextResponse.json(
        { error: `Failed to get ${defaultBranch} branch information` },
        { status: defaultBranchResponse.status }
      );
    }

    const defaultBranchData: GitHubRef = await defaultBranchResponse.json();
    const defaultSha = defaultBranchData.object.sha;

    // Create new branch
    const createBranchResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'SpringBoard-Modernization',
        },
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: defaultSha,
        }),
      }
    );

    if (!createBranchResponse.ok) {
      const errorData = await createBranchResponse.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to create branch' },
        { status: createBranchResponse.status }
      );
    }

    // Success response
    return NextResponse.json(
      {
        success: true,
        branch: branchName,
        branchUrl: `https://github.com/${owner}/${repo}/tree/${branchName}`,
        prUrl: `https://github.com/${owner}/${repo}/compare/${branchName}`,
        message: 'Branch created successfully',
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
        }
      }
    );

  } catch (error) {
    console.error('Refactor API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

// Made with Bob
