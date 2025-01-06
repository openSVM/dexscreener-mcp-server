export interface TokenProfile {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon?: string;
  header?: string;
  description?: string;
  links?: Array<{
    type: string;
    label: string;
    url: string;
  }>;
}

export interface TokenBoost extends TokenProfile {
  amount: number;
  totalAmount: number;
}

export interface TokenOrder {
  type: 'tokenProfile' | 'communityTakeover' | 'tokenAd' | 'trendingBarAd';
  status: 'processing' | 'cancelled' | 'on-hold' | 'approved' | 'rejected';
  paymentTimestamp: number;
  chainId?: string;
  tokenAddress?: string;
}

export interface Token {
  address: string;
  name: string;
  symbol: string;
}

export interface PairInfo {
  imageUrl?: string;
  websites?: Array<{ url: string }>;
  socials?: Array<{
    platform: string;
    handle: string;
  }>;
}

export interface Pair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels: string[];
  baseToken: Token;
  quoteToken: Token;
  priceNative: string;
  priceUsd: string;
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info?: PairInfo;
  boosts?: {
    active: number;
  };
}

export interface DexResponse {
  schemaVersion: string;
  pairs: Pair[] | null;
  pair?: Pair | null; // Some endpoints return single pair
}

export interface ApiError {
  code: number;
  message: string;
}

export type SearchParams = {
  query: string;
};

export type PairParams = {
  chainId: string;
  pairId: string;
};

export type TokenParams = {
  tokenAddresses: string; // Comma-separated addresses
};

export type OrderParams = {
  chainId: string;
  tokenAddress: string;
};
