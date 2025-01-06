import { 
  TokenProfile, 
  TokenBoost, 
  TokenOrder, 
  DexResponse, 
  ApiError,
  SearchParams,
  PairParams,
  TokenParams,
  OrderParams
} from '../types/index.js';

const BASE_URL = 'https://api.dexscreener.com';

class RateLimiter {
  private timestamps: number[] = [];
  private limit: number;
  private interval: number;

  constructor(limit: number, interval: number = 60000) { // interval in ms (default 1 minute)
    this.limit = limit;
    this.interval = interval;
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < this.interval);
    
    if (this.timestamps.length >= this.limit) {
      const oldestTimestamp = this.timestamps[0];
      const waitTime = this.interval - (now - oldestTimestamp);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.timestamps.push(now);
  }
}

// Rate limiters for different endpoint groups
const tokenRateLimiter = new RateLimiter(60);  // 60 requests per minute
const dexRateLimiter = new RateLimiter(300);   // 300 requests per minute

class DexScreenerError extends Error implements ApiError {
  code: number;
  
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.name = 'DexScreenerError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = 'API request failed';
    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch {
      // Use status text if JSON parsing fails
      message = response.statusText || message;
    }
    throw new DexScreenerError(response.status, message);
  }
  return response.json() as Promise<T>;
}

export class DexScreenerService {
  private async fetch<T>(
    endpoint: string, 
    rateLimiter: RateLimiter,
    params?: Record<string, string>
  ): Promise<T> {
    await rateLimiter.waitForSlot();

    const url = new URL(endpoint, BASE_URL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    try {
      const response = await fetch(url.toString());
      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof DexScreenerError) {
        throw error;
      }
      throw new DexScreenerError(500, `Network error: ${(error as Error).message}`);
    }
  }

  // Token Profile Endpoints
  async getLatestTokenProfiles(): Promise<TokenProfile[]> {
    return this.fetch<TokenProfile[]>('/token-profiles/latest/v1', tokenRateLimiter);
  }

  // Token Boost Endpoints
  async getLatestBoostedTokens(): Promise<TokenBoost[]> {
    return this.fetch<TokenBoost[]>('/token-boosts/latest/v1', tokenRateLimiter);
  }

  async getTopBoostedTokens(): Promise<TokenBoost[]> {
    return this.fetch<TokenBoost[]>('/token-boosts/top/v1', tokenRateLimiter);
  }

  // Orders Endpoint
  async getTokenOrders({ chainId, tokenAddress }: OrderParams): Promise<TokenOrder[]> {
    return this.fetch<TokenOrder[]>(
      `/orders/v1/${chainId}/${tokenAddress}`,
      tokenRateLimiter
    );
  }

  // DEX Pairs Endpoints
  async getPairsByChainAndAddress({ chainId, pairId }: PairParams): Promise<DexResponse> {
    return this.fetch<DexResponse>(
      `/latest/dex/pairs/${chainId}/${pairId}`,
      dexRateLimiter
    );
  }

  async getPairsByTokenAddresses({ tokenAddresses }: TokenParams): Promise<DexResponse> {
    return this.fetch<DexResponse>(
      `/latest/dex/tokens/${tokenAddresses}`,
      dexRateLimiter
    );
  }

  async searchPairs({ query }: SearchParams): Promise<DexResponse> {
    return this.fetch<DexResponse>(
      '/latest/dex/search',
      dexRateLimiter,
      { q: query }
    );
  }
}
