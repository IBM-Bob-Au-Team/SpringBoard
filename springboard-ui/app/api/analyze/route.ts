import { NextRequest, NextResponse } from 'next/server';
import type { AnalyzeRequest, AnalysisResult } from '@/lib/types';
import {
  sanitizeRepoUrl,
  parseGitHubUrl,
  checkRepoAccess,
  fetchPomXml,
  parsePomXml,
  detectMigrationIssues,
} from '@/lib/github';

// SECURITY: CORS headers for controlled access
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * SECURITY: This is a SERVER-SIDE ONLY API route
 * - GitHub tokens are NEVER logged
 * - GitHub tokens are NEVER returned in responses
 * - GitHub tokens are NEVER in error messages
 * - All GitHub API calls use Authorization Bearer header
 * - Input is sanitized and validated
 * - Timeouts are enforced (10 seconds)
 * - Generic error messages to client, detailed logs server-side only
 */
export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { repoUrl, token } = body;

    // SECURITY: Validate repoUrl is provided
    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // SECURITY: Sanitize and validate URL
    const sanitized = sanitizeRepoUrl(repoUrl);
    
    // SECURITY: Must start with https://github.com/
    if (!sanitized.startsWith('https://github.com/')) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL. Must start with https://github.com/' },
        { status: 400, headers: corsHeaders }
      );
    }

    // SECURITY: Parse and validate URL structure
    const parsed = parseGitHubUrl(sanitized);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL format. Expected: https://github.com/owner/repo' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { owner, repo } = parsed;

    // SECURITY: Use server env token as fallback ONLY if user didn't provide one
    // User token takes precedence for their private repos
    const authToken = token || process.env.GITHUB_TOKEN;

    // SECURITY: Log server-side only (never log tokens)
    console.log(`[Server] Analyzing repository: ${owner}/${repo}`);

    // Check repository access
    const accessResult = await checkRepoAccess(owner, repo, authToken);

    if (!accessResult.accessible) {
      // SECURITY: Return safe error message (no token info)
      return NextResponse.json(
        {
          accessible: false,
          repoName: repo,
          repoUrl: sanitized,
          isPrivate: false,
          needsMigration: false,
          issues: [],
          recommendation: '',
          error: accessResult.error || 'Unable to access repository',
        } as AnalysisResult,
        { headers: corsHeaders }
      );
    }

    const repoData = accessResult.repoData!;

    // Fetch pom.xml
    const pomResult = await fetchPomXml(
      owner,
      repo,
      repoData.default_branch,
      authToken
    );

    if (!pomResult.content) {
      return NextResponse.json(
        {
          accessible: true,
          repoName: repoData.name,
          repoUrl: repoData.html_url,
          repoDescription: repoData.description,
          isPrivate: accessResult.isPrivate,
          needsMigration: false,
          issues: ['No pom.xml found in repository root'],
          recommendation:
            'This does not appear to be a Maven/Spring Boot project. SpringBoard only supports Maven-based Spring Boot projects.',
          error: pomResult.error || 'No pom.xml found. SpringBoard only supports Maven Spring Boot projects.',
        } as AnalysisResult,
        { headers: corsHeaders }
      );
    }

    // Parse pom.xml
    const pomData = parsePomXml(pomResult.content);

    // Detect migration issues
    const issues = detectMigrationIssues(pomData);

    // Determine if migration is needed
    const needsMigration = issues.length > 0;

    // Generate recommendation
    let recommendation = '';
    if (needsMigration) {
      recommendation =
        `This Spring Boot ${pomData.springBootVersion} project requires modernization. ` +
        `SpringBoard can automatically upgrade it to Spring Boot 3.1.5 with Java 17, ` +
        `migrate javax.* to jakarta.*, update dependencies, and generate comprehensive documentation.`;
    } else {
      recommendation =
        `This project appears to be running Spring Boot ${pomData.springBootVersion} with Java ${pomData.javaVersion}. ` +
        `No immediate migration is required, but SpringBoard can still help optimize and document your codebase.`;
    }

    // SECURITY: Build safe response (NO token data included)
    const result: AnalysisResult = {
      accessible: true,
      repoName: repoData.name,
      repoUrl: repoData.html_url,
      repoDescription: repoData.description,
      isPrivate: accessResult.isPrivate,
      springBootVersion: pomData.springBootVersion,
      javaVersion: pomData.javaVersion,
      dependencies: pomData.dependencies.slice(0, 20), // Limit to first 20
      needsMigration,
      issues,
      recommendation,
    };

    // SECURITY: Log success server-side only
    console.log(`[Server] Analysis complete for ${owner}/${repo}: ${needsMigration ? 'Migration needed' : 'Up to date'}`);

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    // SECURITY: Log detailed error server-side only
    console.error('[Server] Analysis error:', error instanceof Error ? error.message : 'Unknown error');

    // SECURITY: Return generic error to client (no sensitive details)
    return NextResponse.json(
      { error: 'An error occurred while analyzing the repository. Please try again.' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Made with Bob
