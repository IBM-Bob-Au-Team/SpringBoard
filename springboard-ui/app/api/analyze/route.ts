import { NextRequest, NextResponse } from 'next/server';
import type { AnalyzeRequest, AnalysisResult } from '@/lib/types';
import {
  parseGitHubUrl,
  checkRepoAccess,
  fetchPomXml,
  parsePomXml,
  detectIssues,
} from '@/lib/github';

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
    const body: AnalyzeRequest = await request.json();
    const { repoUrl, token } = body;

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Parse GitHub URL
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed.isValid) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL format. Expected: https://github.com/owner/repo' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { owner, repo } = parsed;

    // Use provided token or fallback to environment token
    const authToken = token || process.env.GITHUB_TOKEN;

    // Check if repo is accessible
    const accessResult = await checkRepoAccess(owner, repo, authToken);

    if (!accessResult.accessible) {
      // Handle rate limiting specifically
      if (accessResult.isRateLimited) {
        return NextResponse.json(
          {
            accessible: false,
            repoName: repo,
            repoUrl,
            needsMigration: false,
            issues: ['GitHub API rate limit reached'],
            recommendation: 'Please provide a GitHub personal access token to continue analysis.',
            error: accessResult.error,
          } as AnalysisResult,
          { headers: corsHeaders }
        );
      }

      return NextResponse.json(
        {
          accessible: false,
          repoName: repo,
          repoUrl,
          needsMigration: false,
          issues: [],
          recommendation: '',
          error: accessResult.error,
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
          needsMigration: false,
          issues: ['No pom.xml found in repository root'],
          recommendation:
            'This does not appear to be a Maven/Spring Boot project. SpringBoard only supports Maven-based Spring Boot projects.',
          error: 'No pom.xml found - not a Maven/Spring Boot project',
        } as AnalysisResult,
        { headers: corsHeaders }
      );
    }

    // Parse pom.xml
    const pomData = parsePomXml(pomResult.content);

    // Detect issues
    const issueDetection = detectIssues(pomData, pomResult.content);

    // Build analysis result
    const result: AnalysisResult = {
      accessible: true,
      repoName: repoData.name,
      repoUrl: repoData.html_url,
      repoDescription: repoData.description,
      springBootVersion: pomData.springBootVersion,
      javaVersion: pomData.javaVersion,
      dependencies: pomData.dependencies.slice(0, 20), // Limit to first 20 dependencies
      needsMigration: issueDetection.needsMigration,
      issues: issueDetection.issues,
      recommendation: issueDetection.recommendation,
    };

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Made with Bob
