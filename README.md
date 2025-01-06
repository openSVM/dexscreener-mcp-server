# DexScreener MCP Server

An MCP server implementation for accessing the DexScreener API, providing real-time access to DEX pair data, token information, and market statistics across multiple blockchains.

One-line install (automatically adds to Claude Desktop):
```bash
curl -L https://raw.githubusercontent.com/opensvm/dexscreener-mcp-server/main/install.sh | bash
```

## Features

- Rate-limited API access (respects DexScreener's rate limits)
- Comprehensive error handling
- Type-safe interfaces
- Support for all DexScreener API endpoints
- Integration tests

## Installation

Manual installation:
```bash
npm install
npm run build
npm run setup
```

## Testing

```bash
npm test
```

## Usage

### Available Tools

1. `get_latest_token_profiles`
   - Get the latest token profiles
   - No parameters required
   ```typescript
   const result = await mcpClient.callTool('dexscreener', 'get_latest_token_profiles');
   ```

2. `get_latest_boosted_tokens`
   - Get the latest boosted tokens
   - No parameters required
   ```typescript
   const result = await mcpClient.callTool('dexscreener', 'get_latest_boosted_tokens');
   ```

3. `get_top_boosted_tokens`
   - Get tokens with most active boosts
   - No parameters required
   ```typescript
   const result = await mcpClient.callTool('dexscreener', 'get_top_boosted_tokens');
   ```

4. `get_token_orders`
   - Check orders paid for a specific token
   ```typescript
   const result = await mcpClient.callTool('dexscreener', 'get_token_orders', {
     chainId: 'solana',
     tokenAddress: 'So11111111111111111111111111111111111111112'
   });
   ```

5. `get_pairs_by_chain_and_address`
   - Get one or multiple pairs by chain and pair address
   ```typescript
   const result = await mcpClient.callTool('dexscreener', 'get_pairs_by_chain_and_address', {
     chainId: 'solana',
     pairId: 'HxFLKUAmAMLz1jtT3hbvCMELwH5H9tpM2QugP8sKyfhc'
   });
   ```

6. `get_pairs_by_token_addresses`
   - Get one or multiple pairs by token address (max 30)
   ```typescript
   const result = await mcpClient.callTool('dexscreener', 'get_pairs_by_token_addresses', {
     tokenAddresses: 'So11111111111111111111111111111111111111112'
   });
   ```

7. `search_pairs`
   - Search for pairs matching query
   ```typescript
   const result = await mcpClient.callTool('dexscreener', 'search_pairs', {
     query: 'SOL'
   });
   ```

## Rate Limits

The server implements rate limiting to comply with DexScreener's API limits:
- Token Profile/Boost endpoints: 60 requests per minute
- DEX/Pairs endpoints: 300 requests per minute

## Error Handling

The server handles various error scenarios:
- Rate limit exceeded
- Invalid parameters
- Network errors
- API errors

Errors are returned in a standardized format with appropriate error codes and messages.

## API Documentation

For detailed API documentation, see [docs/api-reference.md](docs/api-reference.md).

## Development

### Project Structure

```
.
├── src/
│   ├── types/           # TypeScript interfaces and types
│   ├── services/        # API service implementations
│   ├── tests/           # Integration tests
│   └── index.ts         # Main server implementation
├── scripts/            # Setup and utility scripts
├── docs/              # Documentation
└── README.md          # This file
```

### Adding New Features

1. Define types in `src/types/`
2. Implement service methods in `src/services/`
3. Add tool handlers in `src/index.ts`
4. Update documentation
5. Add tests

## License

MIT
