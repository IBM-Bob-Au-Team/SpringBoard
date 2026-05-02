import { NextRequest, NextResponse } from 'next/server';
import type { RefactorRequest, RefactorResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: RefactorRequest = await request.json();
    const { repoUrl, token } = body;

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' } as RefactorResponse,
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: 'GitHub token is required for refactoring' } as RefactorResponse,
        { status: 400 }
      );
    }

    // Parse GitHub URL to extract owner and repo name
    const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!urlMatch) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL format' } as RefactorResponse,
        { status: 400 }
      );
    }

    const [, owner, repoName] = urlMatch;
    const cleanRepoName = repoName.replace(/\.git$/, '');

    // Verify token has write access by checking permissions
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'SpringBoard-Refactor',
    };

    // Check repo access and permissions
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${cleanRepoName}`,
      { headers }
    );

    if (!repoResponse.ok) {
      if (repoResponse.status === 401) {
        return NextResponse.json({
          success: false,
          message: '',
          error: 'Invalid GitHub token',
        } as RefactorResponse, { status: 401 });
      }
      if (repoResponse.status === 404) {
        return NextResponse.json({
          success: false,
          message: '',
          error: 'Repository not found or token does not have access',
        } as RefactorResponse, { status: 404 });
      }
      return NextResponse.json({
        success: false,
        message: '',
        error: `GitHub API error: ${repoResponse.statusText}`,
      } as RefactorResponse, { status: repoResponse.status });
    }

    const repoData = await repoResponse.json();

    // Check if user has push/write permissions
    const hasWriteAccess = repoData.permissions?.push || repoData.permissions?.admin;

    if (!hasWriteAccess) {
      return NextResponse.json({
        success: false,
        message: '',
        error: 'Token does not have write access to this repository. Please ensure your token has "repo" scope.',
      } as RefactorResponse, { status: 403 });
    }

    // Mock response - refactoring initiated successfully
    const response: RefactorResponse = {
      success: true,
      message: 'Refactoring initiated successfully. IBM Bob will analyze your code and create a modernized version.',
      branch: 'springboard-modernized',
      prUrl: null,
      status: 'processing',
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Refactor error:', error);
    return NextResponse.json({
      success: false,
      message: '',
      error: error instanceof Error ? error.message : 'Internal server error',
    } as RefactorResponse, { status: 500 });
  }
}

// Made with Bob