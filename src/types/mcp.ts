import type { Request, Response } from '@modelcontextprotocol/sdk';
import type { OrderParams, PairParams, TokenParams, SearchParams } from './index.js';

export interface CallToolRequest extends Request {
  params: {
    name: string;
    arguments: ToolArguments;
  };
}

type ToolArguments = 
  | Record<string, never> // For tools without params
  | OrderParams 
  | PairParams 
  | TokenParams 
  | SearchParams;

export interface ListToolsRequest extends Request {
  params: Record<string, never>;
}

export interface McpToolResponse extends Response {
  content: Array<{
    type: string;
    text: string;
  }>;
}
