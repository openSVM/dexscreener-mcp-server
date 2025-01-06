# DexScreener API Reference

## Base URL
```
https://api.dexscreener.com
```

## Rate Limits
- Token Profile/Boost endpoints: 60 requests per minute
- DEX/Pairs endpoints: 300 requests per minute

## Endpoints

### 1. Token Profiles

#### Get Latest Token Profiles
```
GET /token-profiles/latest/v1
```
Returns the latest token profiles.

**Response Schema:**
```typescript
{
  url: string;          // URI
  chainId: string;
  tokenAddress: string;
  icon?: string;        // URI
  header?: string;      // URI
  description?: string;
  links?: Array<{
    type: string;
    label: string;
    url: string;
  }>;
}
```

### 2. Token Boosts

#### Get Latest Boosted Tokens
```
GET /token-boosts/latest/v1
```
Returns the latest boosted tokens.

#### Get Top Boosted Tokens
```
GET /token-boosts/top/v1
```
Returns tokens with most active boosts.

**Response Schema (for both boost endpoints):**
```typescript
{
  url: string;          // URI
  chainId: string;
  tokenAddress: string;
  amount: number;
  totalAmount: number;
  icon?: string;        // URI
  header?: string;      // URI
  description?: string;
  links?: Array<{
    type: string;
    label: string;
    url: string;
  }>;
}
```

### 3. Orders

#### Check Token Orders
```
GET /orders/v1/{chainId}/{tokenAddress}
```
Check orders paid for a specific token.

**Parameters:**
- chainId: string (e.g. "solana")
- tokenAddress: string (e.g. "A55XjvzRU4KtR3Lrys8PpLZQvPojPqvnv5bJVHMYy3Jv")

**Response Schema:**
```typescript
Array<{
  type: "tokenProfile" | "communityTakeover" | "tokenAd" | "trendingBarAd";
  status: "processing" | "cancelled" | "on-hold" | "approved" | "rejected";
  paymentTimestamp: number;
}>
```

### 4. DEX Pairs

#### Get Pairs by Chain and Address
```
GET /latest/dex/pairs/{chainId}/{pairId}
```
Get one or multiple pairs by chain and pair address.

**Parameters:**
- chainId: string (e.g. "solana")
- pairId: string (e.g. "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN")

#### Get Pairs by Token Addresses
```
GET /latest/dex/tokens/{tokenAddresses}
```
Get one or multiple pairs by token address.

**Parameters:**
- tokenAddresses: comma-separated string of addresses (max 30)
Example: "addr1,addr2,addr3"

#### Search Pairs
```
GET /latest/dex/search?q={query}
```
Search for pairs matching query.

**Common Response Schema for DEX Endpoints:**
```typescript
{
  schemaVersion: string;
  pairs: Array<{
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    labels: string[];
    baseToken: {
      address: string;
      name: string;
      symbol: string;
    };
    quoteToken: {
      address: string;
      name: string;
      symbol: string;
    };
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
    info?: {
      imageUrl?: string;
      websites?: Array<{ url: string }>;
      socials?: Array<{
        platform: string;
        handle: string;
      }>;
    };
    boosts?: {
      active: number;
    };
  }>;
}
```

## Error Handling
The API returns standard HTTP status codes:
- 200: Success
- 429: Rate limit exceeded
- 4xx: Client errors
- 5xx: Server errors
