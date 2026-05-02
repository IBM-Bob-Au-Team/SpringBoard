import { NextRequest, NextResponse } from 'next/server';
import type { RefactorRequest, RefactorResponse } from '@/lib/types';
import { sanitizeRepoUrl, parseGitHubUrl, fetchWithAuth } from '@/lib/github';
import { checkRateLimit, getRemainingRequests, getResetTime } from '@/lib/rateLimit';

// SECURITY: CORS headers - only allow own domain
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'https://springboard.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// SECURITY: Request size limit (1KB)
const MAX_BODY_SIZE = 1024; // 1KB

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * SECURITY: Secure refactoring API route
 * - Server-side only, token never touches browser after submission
 * - Verifies GitHub token write access before any operations
 * - Rate limited: max 5 requests per IP per minute
 * - Strict input validation
 * - Security event logging (never logs actual tokens)
 * - Request size limit: 1KB max
 * - CORS restricted to own domain
 */
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // SECURITY: Rate limit check - max 5 requests per IP per minute
    if (!checkRateLimit(ip)) {
      const resetTime = getResetTime(ip);
      console.log(`[Server] Rate limit exceeded for IP: ${ip}`);
      
      return NextResponse.json(
        { 
          error: `Rate limit exceeded. Please try again in ${resetTime} seconds.`,
          success: false 
        } as RefactorResponse,
        { 
          status: 429,
          headers: {
            ...corsHeaders,
            'Retry-After': resetTime.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetTime.toString(),
          }
        }
      );
    }

    // SECURITY: Check request size (max 1KB)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
      console.log(`[Server] Request too large: ${contentLength} bytes`);
      return NextResponse.json(
        { error: 'Request too large', success: false } as RefactorResponse,
        { status: 413, headers: corsHeaders }
      );
    }

    const body: RefactorRequest = await request.json();
    const { repoUrl, token } = body;

    // SECURITY: Validate repoUrl is provided
    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required', success: false } as RefactorResponse,
        { status: 400, headers: corsHeaders }
      );
    }

    // SECURITY: Validate token is provided
    if (!token) {
      return NextResponse.json(
        { error: 'GitHub token is required for refactoring', success: false } as RefactorResponse,
        { status: 400, headers: corsHeaders }
      );
    }

    // SECURITY: Validate token format (ghp_ or github_pat_)
    if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
      console.log('[Server] Invalid token format provided');
      return NextResponse.json(
        { 
          error: 'Token validation failed. Please check your token has the correct permissions.',
          success: false 
        } as RefactorResponse,
        { status: 401, headers: corsHeaders }
      );
    }

    // SECURITY: Sanitize and validate URL
    const sanitized = sanitizeRepoUrl(repoUrl);
    
    // SECURITY: Must be a valid github.com URL
    if (!sanitized.startsWith('https://github.com/')) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL', success: false } as RefactorResponse,
        { status: 400, headers: corsHeaders }
      );
    }

    // SECURITY: Parse and validate URL structure
    const parsed = parseGitHubUrl(sanitized);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL format', success: false } as RefactorResponse,
        { status: 400, headers: corsHeaders }
      );
    }

    const { owner, repo } = parsed;

    // SECURITY: Log refactor request (never log token)
    console.log(`[Server] Refactor requested for repo: ${owner}/${repo}`);

    // SECURITY: Verify token has write access using read-only test call first
    try {
      const repoResponse = await fetchWithAuth(
        `https://api.github.com/repos/${owner}/${repo}`,
        token
      );

      if (!repoResponse.ok) {
        // SECURITY: Generic error - don't reveal if token or repo was wrong
        console.log(`[Server] Token validation: failed (status ${repoResponse.status})`);
        return NextResponse.json(
          {
            error: 'Token validation failed. Please check your token has the correct permissions.',
            success: false
          } as RefactorResponse,
          { status: 401, headers: corsHeaders }
        );
      }

      const repoData = await repoResponse.json();

      // SECURITY: Check if token has write (push) access
      const hasWriteAccess = repoData.permissions?.push || repoData.permissions?.admin;

      if (!hasWriteAccess) {
        // SECURITY: Generic error - don't reveal specific permission issue
        console.log('[Server] Token validation: failed (no write access)');
        return NextResponse.json(
          {
            error: 'Token validation failed. Please check your token has the correct permissions.',
            success: false
          } as RefactorResponse,
          { status: 403, headers: corsHeaders }
        );
      }

      console.log('[Server] Token validation: passed');

    } catch (error) {
      // SECURITY: Generic error for any validation failure
      console.error('[Server] Token validation error:', error instanceof Error ? error.message : 'Unknown');
      return NextResponse.json(
        {
          error: 'Token validation failed. Please check your token has the correct permissions.',
          success: false
        } as RefactorResponse,
        { status: 401, headers: corsHeaders }
      );
    }

    // Get default branch
    const repoInfoResponse = await fetchWithAuth(
      `https://api.github.com/repos/${owner}/${repo}`,
      token
    );
    const repoInfo = await repoInfoResponse.json();
    const defaultBranch = repoInfo.default_branch || 'main';

    // Get the SHA of the default branch
    const refResponse = await fetchWithAuth(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${defaultBranch}`,
      token
    );

    if (!refResponse.ok) {
      console.error('[Server] Failed to get default branch ref');
      return NextResponse.json(
        {
          error: 'Failed to access repository branch information',
          success: false
        } as RefactorResponse,
        { status: 500, headers: corsHeaders }
      );
    }

    const refData = await refResponse.json();
    const sha = refData.object.sha;

    // Check if springboard-modernized branch already exists
    const branchCheckResponse = await fetchWithAuth(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/springboard-modernized`,
      token
    );

    if (branchCheckResponse.ok) {
      // Branch already exists
      return NextResponse.json(
        {
          error: 'Branch springboard-modernized already exists in this repo.',
          success: false
        } as RefactorResponse,
        { status: 409, headers: corsHeaders }
      );
    }

    // Create new branch: springboard-modernized
    const createBranchResponse = await fetchWithAuth(
      `https://api.github.com/repos/${owner}/${repo}/git/refs`,
      token
    );

    // Use fetch directly for POST with body
    const createResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'SpringBoard-Refactor',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'refs/heads/springboard-modernized',
          sha: sha,
        }),
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('[Server] Failed to create branch:', errorData);
      return NextResponse.json(
        {
          error: 'Failed to create modernization branch',
          success: false
        } as RefactorResponse,
        { status: 500, headers: corsHeaders }
      );
    }

    // Success!
    console.log(`[Server] Branch created successfully: ${owner}/${repo}/springboard-modernized`);

    const response: RefactorResponse = {
      success: true,
      branch: 'springboard-modernized',
      message: 'Branch created. Modernization ready to run.',
      repoUrl: sanitized,
    };

    return NextResponse.json(response, { 
      headers: {
        ...corsHeaders,
        'X-RateLimit-Remaining': getRemainingRequests(ip).toString(),
      }
    });

  } catch (error) {
    // SECURITY: Log detailed error server-side only
    console.error('[Server] Refactor error:', error instanceof Error ? error.message : 'Unknown error');

    // SECURITY: Return generic error to client
    return NextResponse.json(
      {
        error: 'An error occurred while processing your request. Please try again.',
        success: false
      } as RefactorResponse,
      { status: 500, headers: corsHeaders }
    );
  }
}

// Made with Bob