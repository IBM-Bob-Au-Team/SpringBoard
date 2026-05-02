import { NextRequest, NextResponse } from 'next/server';
import type { RefactorRequest, RefactorResponse } from '@/lib/types';
import { parseGitHubUrl, checkRepoAccess } from '@/lib/github';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body: RefactorRequest = await request.json();
    const { repoUrl, token } = body;

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' } as RefactorResponse,
        { status: 400, headers: corsHeaders }
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: 'GitHub token is required for refactoring' } as RefactorResponse,
        { status: 400, headers: corsHeaders }
      );
    }

    // Parse GitHub URL
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed.isValid) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL format' } as RefactorResponse,
        { status: 400, headers: corsHeaders }
      );
    }

    const { owner, repo } = parsed;

    // Check repo access with the provided token
    const accessResult = await checkRepoAccess(owner, repo, token);

    if (!accessResult.accessible) {
      const statusCode = accessResult.error?.includes('rate limit') ? 429 :
                        accessResult.error?.includes('not found') ? 404 : 401;
      
      return NextResponse.json({
        success: false,
        message: '',
        error: accessResult.error || 'Failed to access repository',
      } as RefactorResponse, { status: statusCode, headers: corsHeaders });
    }

    const repoData = accessResult.repoData!;

    // Check if user has push/write permissions
    const hasWriteAccess = repoData.permissions?.push || repoData.permissions?.admin;

    if (!hasWriteAccess) {
      return NextResponse.json({
        success: false,
        message: '',
        error: 'Token does not have write access to this repository. Please ensure your token has "repo" scope.',
      } as RefactorResponse, { status: 403, headers: corsHeaders });
    }

    // Mock response - refactoring initiated successfully
    const response: RefactorResponse = {
      success: true,
      message: 'Refactoring initiated successfully. IBM Bob will analyze your code and create a modernized version.',
      branch: 'springboard-modernized',
      prUrl: null,
      status: 'processing',
    };

    return NextResponse.json(response, { headers: corsHeaders });

  } catch (error) {
    console.error('Refactor error:', error);
    return NextResponse.json({
      success: false,
      message: '',
      error: error instanceof Error ? error.message : 'Internal server error',
    } as RefactorResponse, { status: 500, headers: corsHeaders });
  }
}

// Made with Bob