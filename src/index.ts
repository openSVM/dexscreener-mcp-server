#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import type { DexScreenerService } from './services/dexscreener.js';
import type { ListToolsRequest, CallToolRequest, McpToolResponse } from './types/mcp.js';

class DexScreenerMcpServer {
  private server: Server;
  private dexService: DexScreenerService;

  constructor(dexService: DexScreenerService) {
    this.server = new Server(
      {
        name: 'dexscreener-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.dexService = dexService;
    this.setupToolHandlers();
    
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
      { method: 'list_tools' },
      async () => ({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
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
              ],
            }, null, 2),
          },
        ],
      })
    );

    // Call Tool Handler
    this.server.setRequestHandler(
      { method: 'call_tool' },
      async (request) => {
        const typedRequest = request as CallToolRequest;
        try {
          let result;
          switch (typedRequest.params.name) {
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
              const args = typedRequest.params.arguments as { chainId: string; tokenAddress: string };
              result = await this.dexService.getTokenOrders(args);
              break;
            }

            case 'get_pairs_by_chain_and_address': {
              const args = typedRequest.params.arguments as { chainId: string; pairId: string };
              result = await this.dexService.getPairsByChainAndAddress(args);
              break;
            }

            case 'get_pairs_by_token_addresses': {
              const args = typedRequest.params.arguments as { tokenAddresses: string };
              result = await this.dexService.getPairsByTokenAddresses(args);
              break;
            }

            case 'search_pairs': {
              const args = typedRequest.params.arguments as { query: string };
              result = await this.dexService.searchPairs(args);
              break;
            }

            default:
              throw new McpError(
                ErrorCode.MethodNotFound,
                `Unknown tool: ${typedRequest.params.name}`
              );
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
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

  async run() {
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
