/**
 * SERVER SIDE ONLY - Never import in client components
 * 
 * This file validates and exports environment variables
 * for server-side use only (API routes, server components)
 * 
 * SECURITY: These values must NEVER be exposed to the browser
 * Only variables with NEXT_PUBLIC_ prefix are safe for client-side
 */

interface ServerEnv {
  githubToken?: string;
  watsonxApiKey?: string;
  watsonxProjectId?: string;
  watsonxUrl?: string;
  appUrl: string;
  rateLimitMax: number;
  rateLimitWindowMs: number;
}

/**
 * Validate environment variables at startup
 * Throws clear errors if required vars are missing
 * Logs warnings for optional vars
 */
export function validateEnv(): void {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required: App URL (public)
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    errors.push('NEXT_PUBLIC_APP_URL is required');
  }

  // Optional but recommended: GitHub token (server-side)
  if (!process.env.GITHUB_TOKEN) {
    warnings.push(
      'GITHUB_TOKEN is not set. API rate limiting may occur for public repo analysis. ' +
      'Set this to avoid rate limits.'
    );
  }

  // Optional: watsonx configuration (server-side)
  if (!process.env.WATSONX_API_KEY) {
    warnings.push(
      'WATSONX_API_KEY is not set. Full auto-modernization pipeline will not be available.'
    );
  }

  if (!process.env.WATSONX_PROJECT_ID) {
    warnings.push(
      'WATSONX_PROJECT_ID is not set. Full auto-modernization pipeline will not be available.'
    );
  }

  if (!process.env.WATSONX_URL) {
    warnings.push(
      'WATSONX_URL is not set. Full auto-modernization pipeline will not be available.'
    );
  }

  // Log errors and warnings
  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Missing required environment variables. Check .env.local file.');
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  console.log('✓ Environment variables validated');
}

/**
 * Typed environment variables for server-side use
 * 
 * SECURITY: Only use in server components or API routes
 * Never import this in client components
 */
export const env: ServerEnv = {
  // Server-side only: GitHub token
  githubToken: process.env.GITHUB_TOKEN,

  // Server-side only: watsonx configuration
  watsonxApiKey: process.env.WATSONX_API_KEY,
  watsonxProjectId: process.env.WATSONX_PROJECT_ID,
  watsonxUrl: process.env.WATSONX_URL,

  // Public: App URL (safe for browser)
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // Server-side only: Rate limiting configuration
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '5', 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
};

// Validate on module load (server-side only)
if (typeof window === 'undefined') {
  validateEnv();
}

// Made with Bob