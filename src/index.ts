#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ErrorCode, McpError, ListToolsRequestSchema, CallToolRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { DexScreenerService } from './services/dexscreener.js';
import type { ListToolsRequest, CallToolRequest, McpToolResponse } from './types/mcp.js';

class DexScreenerMcpServer {
  private server!: Server;
  private dexService: DexScreenerService;
  private resources: Record<string, any>;

  constructor(dexService: DexScreenerService) {
    this.dexService = dexService;

    // Initialize resources
    const resources = {
      'dexscreener://docs/api': {
        name: 'DexScreener API Documentation',
        description: 'Documentation for the DexScreener API endpoints and usage',
        mimeType: 'text/markdown',
        text: `# DexScreener API Documentation

## Overview
DexScreener provides real-time data for decentralized exchanges across multiple blockchains. The API allows you to:
- Get real-time pair data and price information
- Search for trading pairs
- Monitor token profiles and boosted tokens
- Track token orders and market activity

## Best Practices
1. Rate Limiting: Respect the API rate limits to ensure stable service
2. Caching: Cache responses when possible to reduce API load
3. Error Handling: Implement proper error handling for API responses
4. Pagination: Use pagination parameters when available to manage large datasets

## Chain IDs
Common chain IDs include:
- solana: Solana blockchain
- ethereum: Ethereum mainnet
- bsc: Binance Smart Chain
- polygon: Polygon/Matic
- arbitrum: Arbitrum One
- avalanche: Avalanche C-Chain`
      },
      'dexscreener://docs/memecoin-best-practices': {
        name: 'Memecoin Trading Best Practices',
        description: 'Guidelines and best practices for memecoin trading and analysis',
        mimeType: 'text/markdown',
        text: `# Memecoin Trading Best Practices

## Analysis Guidelines
1. Liquidity Analysis
   - Check liquidity pool size
   - Monitor liquidity distribution
   - Track liquidity lock status and duration

2. Trading Volume
   - Analyze 24h volume trends
   - Compare volume across different pairs
   - Look for unusual volume spikes

3. Market Cap Considerations
   - Calculate fully diluted valuation
   - Compare with similar tokens
   - Check token distribution

4. Risk Management
   - Set strict stop losses
   - Don't invest more than you can afford to lose
   - Be aware of potential scams and rugpulls

5. Technical Analysis
   - Use multiple timeframes
   - Watch for pattern breakouts
   - Monitor momentum indicators

## Common Red Flags
- Extremely low liquidity
- Unlocked liquidity
- Anonymous team
- No clear utility or roadmap
- Suspicious contract code
- Unusual buying/selling patterns`
      }
    };

    this.resources = resources;
    this.server = new Server(
      {
        name: 'dexscreener-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {
            get_latest_token_profiles: {
              description: 'Get the latest token profiles',
              inputSchema: {
                type: 'object',
                properties: {},
                required: [],
              },
            },
            get_latest_boosted_tokens: {
              description: 'Get the latest boosted tokens',
              inputSchema: {
                type: 'object',
                properties: {},
                required: [],
              },
            },
            get_top_boosted_tokens: {
              description: 'Get tokens with most active boosts',
              inputSchema: {
                type: 'object',
                properties: {},
                required: [],
              },
            },
            get_token_orders: {
              description: 'Check orders paid for a specific token',
              inputSchema: {
                type: 'object',
                properties: {
                  chainId: {
                    type: 'string',
                    description: 'Chain ID (e.g., "solana")',
                  },
                  tokenAddress: {
                    type: 'string',
                    description: 'Token address',
                  },
                },
                required: ['chainId', 'tokenAddress'],
              },
            },
            get_pairs_by_chain_and_address: {
              description: 'Get one or multiple pairs by chain and pair address',
              inputSchema: {
                type: 'object',
                properties: {
                  chainId: {
                    type: 'string',
                    description: 'Chain ID (e.g., "solana")',
                  },
                  pairId: {
                    type: 'string',
                    description: 'Pair address',
                  },
                },
                required: ['chainId', 'pairId'],
              },
            },
            get_pairs_by_token_addresses: {
              description: 'Get one or multiple pairs by token address (max 30)',
              inputSchema: {
                type: 'object',
                properties: {
                  tokenAddresses: {
                    type: 'string',
                    description: 'Comma-separated token addresses',
                  },
                },
                required: ['tokenAddresses'],
              },
            },
            search_pairs: {
              description: 'Search for pairs matching query',
              inputSchema: {
                type: 'object',
                properties: {
                  query: {
                    type: 'string',
                    description: 'Search query',
                  },
                },
                required: ['query'],
              },
            },
          },
          resources: resources
        }
      }
    );

    this.dexService = dexService;
    this.setupToolHandlers();
    this.setupResourceHandlers();
    
    // Error handling
    this.server.onerror = (error: Error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    // List Tools Handler
    this.server.setRequestHandler(
      ListToolsRequestSchema,
      async () => ({
        tools: [
                {
                  name: 'get_latest_token_profiles',
                  description: 'Get the latest token profiles',
                  inputSchema: {
                    type: 'object',
                    properties: {},
                    required: [],
                  },
                },
                {
                  name: 'get_latest_boosted_tokens',
                  description: 'Get the latest boosted tokens',
                  inputSchema: {
                    type: 'object',
                    properties: {},
                    required: [],
                  },
                },
                {
                  name: 'get_top_boosted_tokens',
                  description: 'Get tokens with most active boosts',
                  inputSchema: {
                    type: 'object',
                    properties: {},
                    required: [],
                  },
                },
                {
                  name: 'get_token_orders',
                  description: 'Check orders paid for a specific token',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      chainId: {
                        type: 'string',
                        description: 'Chain ID (e.g., "solana")',
                      },
                      tokenAddress: {
                        type: 'string',
                        description: 'Token address',
                      },
                    },
                    required: ['chainId', 'tokenAddress'],
                  },
                },
                {
                  name: 'get_pairs_by_chain_and_address',
                  description: 'Get one or multiple pairs by chain and pair address',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      chainId: {
                        type: 'string',
                        description: 'Chain ID (e.g., "solana")',
                      },
                      pairId: {
                        type: 'string',
                        description: 'Pair address',
                      },
                    },
                    required: ['chainId', 'pairId'],
                  },
                },
                {
                  name: 'get_pairs_by_token_addresses',
                  description: 'Get one or multiple pairs by token address (max 30)',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      tokenAddresses: {
                        type: 'string',
                        description: 'Comma-separated token addresses',
                      },
                    },
                    required: ['tokenAddresses'],
                  },
                },
                {
                  name: 'search_pairs',
                  description: 'Search for pairs matching query',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      query: {
                        type: 'string',
                        description: 'Search query',
                      },
                    },
                    required: ['query'],
                  },
                },
        ]
      })
    );

    // Call Tool Handler
    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request: { params: { name: string; arguments?: Record<string, unknown> }; method: "tools/call" }) => {
        try {
          let result;
          switch (request.params.name) {
            case 'get_latest_token_profiles':
              result = await this.dexService.getLatestTokenProfiles();
              break;

            case 'get_latest_boosted_tokens':
              result = await this.dexService.getLatestBoostedTokens();
              break;

            case 'get_top_boosted_tokens':
              result = await this.dexService.getTopBoostedTokens();
              break;

            case 'get_token_orders': {
              const args = request.params.arguments as { chainId: string; tokenAddress: string };
              result = await this.dexService.getTokenOrders(args);
              break;
            }

            case 'get_pairs_by_chain_and_address': {
              const args = request.params.arguments as { chainId: string; pairId: string };
              result = await this.dexService.getPairsByChainAndAddress(args);
              break;
            }

            case 'get_pairs_by_token_addresses': {
              const args = request.params.arguments as { tokenAddresses: string };
              result = await this.dexService.getPairsByTokenAddresses(args);
              break;
            }

            case 'search_pairs': {
              const args = request.params.arguments as { query: string };
              result = await this.dexService.searchPairs(args);
              break;
            }

            default:
              throw new McpError(
                ErrorCode.MethodNotFound,
                `Unknown tool: ${request.params.name}`
              );
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        } catch (error) {
          if (error instanceof McpError) {
            throw error;
          }
          throw new McpError(
            ErrorCode.InternalError,
            `DexScreener API error: ${(error as Error).message}`
          );
        }
      }
    );
  }

  private setupResourceHandlers() {
    // List Resources Handler
    this.server.setRequestHandler(
      ListResourcesRequestSchema,
      async () => ({
        resources: [
          {
            uri: 'dexscreener://docs/api',
            name: 'DexScreener API Documentation',
            description: 'Documentation for the DexScreener API endpoints and usage',
            mimeType: 'text/markdown'
          },
          {
            uri: 'dexscreener://docs/memecoin-best-practices',
            name: 'Memecoin Trading Best Practices',
            description: 'Guidelines and best practices for memecoin trading and analysis',
            mimeType: 'text/markdown'
          }
        ]
      })
    );

    // Read Resource Handler
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request: { method: "resources/read"; params: { uri: string } }) => {
        const uri = request.params.uri;
        const resource = this.resources[uri];
        
        if (!resource) {
          throw new McpError(
            ErrorCode.MethodNotFound, // Using MethodNotFound as ResourceNotFound isn't available
            `Resource not found: ${uri}`
          );
        }

        return {
          contents: [{
            uri,
            mimeType: resource.mimeType,
            text: resource.text
          }]
        };
      }
    );
  }

  public async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('DexScreener MCP server running on stdio');
  }
}

async function main() {
  const { DexScreenerService } = await import('./services/dexscreener.js');
  const dexService = new DexScreenerService();
  const server = new DexScreenerMcpServer(dexService);
  await server.run().catch(console.error);
}

main().catch(console.error);
