interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  backoffMs?: number;
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private backoffUntil: Map<string, number> = new Map();
  
  constructor(private config: RateLimitConfig) {}
  
  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    
    // Check if in backoff period
    const backoffTime = this.backoffUntil.get(key);
    if (backoffTime && now < backoffTime) {
      const waitTime = backoffTime - now;
      console.warn(`Rate limit backoff for ${key}: waiting ${waitTime}ms`);
      return false;
    }
    
    // Get request timestamps for this key
    const timestamps = this.requests.get(key) || [];
    
    // Remove old timestamps outside the window
    const validTimestamps = timestamps.filter(
      timestamp => now - timestamp < this.config.windowMs
    );
    
    // Check if limit exceeded
    if (validTimestamps.length >= this.config.maxRequests) {
      // Set backoff period
      const backoffMs = this.config.backoffMs || this.config.windowMs;
      this.backoffUntil.set(key, now + backoffMs);
      console.warn(`Rate limit exceeded for ${key}: ${validTimestamps.length}/${this.config.maxRequests} requests`);
      return false;
    }
    
    // Add current timestamp and update
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    
    return true;
  }
  
  reset(key: string) {
    this.requests.delete(key);
    this.backoffUntil.delete(key);
  }
  
  resetAll() {
    this.requests.clear();
    this.backoffUntil.clear();
  }
}

// Create rate limiter for ElevenLabs API
// Conservative limits to avoid 429 errors
export const elevenLabsRateLimiter = new RateLimiter({
  maxRequests: 10, // 10 requests
  windowMs: 60000, // per minute
  backoffMs: 30000 // 30 second backoff when limit hit
});

// Wrapper for fetch with rate limiting
export async function rateLimitedFetch(
  url: string,
  options: RequestInit,
  rateLimiter: RateLimiter,
  key: string = 'default'
): Promise<Response> {
  // Check rate limit
  const canProceed = await rateLimiter.checkLimit(key);
  if (!canProceed) {
    throw new Error('Rate limit exceeded - please try again later');
  }
  
  try {
    const response = await fetch(url, options);
    
    // Check for rate limit response
    if (response.status === 429) {
      console.error('429 Rate Limit Response from server');
      // Trigger backoff
      rateLimiter.reset(key);
      const backoffMs = 60000; // 1 minute backoff for 429s
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      throw new Error('Server rate limit (429) - backing off');
    }
    
    return response;
  } catch (error) {
    // On network errors, don't count against rate limit
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      rateLimiter.reset(key);
    }
    throw error;
  }
}