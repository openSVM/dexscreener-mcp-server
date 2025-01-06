import type { Request, Response } from '@modelcontextprotocol/sdk';

export interface ListToolsRequest extends Request {
  method: 'tools/list';
  params: Record<string, never>;
}

export interface CallToolRequest extends Request {
  method: 'tools/call';
  params: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

export interface McpToolResponse extends Response {
  content: Array<{
    type: string;
    text: string;
  }>;
}
