/**
 * Simple in-memory rate limiter
 * - Max 5 requests per IP per 60 seconds
 * - Automatically cleans up expired entries
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 1000; // 60 seconds

/**
 * Clean up expired entries from the rate limit store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const expiredKeys: string[] = [];

  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      expiredKeys.push(ip);
    }
  }

  for (const key of expiredKeys) {
    rateLimitStore.delete(key);
  }
}

/**
 * Check if an IP address has exceeded the rate limit
 * @param ip - The IP address to check
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(ip: string): boolean {
  // Clean up expired entries periodically
  cleanupExpiredEntries();

  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry) {
    // First request from this IP
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return true;
  }

  // Check if the window has expired
  if (now > entry.resetTime) {
    // Reset the counter
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return true;
  }

  // Within the window, check if limit exceeded
  if (entry.count >= MAX_REQUESTS) {
    return false; // Rate limited
  }

  // Increment the counter
  entry.count++;
  rateLimitStore.set(ip, entry);
  return true;
}

/**
 * Get remaining requests for an IP
 * @param ip - The IP address to check
 * @returns number of remaining requests
 */
export function getRemainingRequests(ip: string): number {
  const entry = rateLimitStore.get(ip);
  if (!entry) return MAX_REQUESTS;

  const now = Date.now();
  if (now > entry.resetTime) return MAX_REQUESTS;

  return Math.max(0, MAX_REQUESTS - entry.count);
}

/**
 * Get time until rate limit reset for an IP
 * @param ip - The IP address to check
 * @returns seconds until reset, or 0 if not rate limited
 */
export function getResetTime(ip: string): number {
  const entry = rateLimitStore.get(ip);
  if (!entry) return 0;

  const now = Date.now();
  if (now > entry.resetTime) return 0;

  return Math.ceil((entry.resetTime - now) / 1000);
}

// Made with Bob