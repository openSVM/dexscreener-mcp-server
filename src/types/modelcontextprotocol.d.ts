declare module '@modelcontextprotocol/sdk' {
  export interface Request {
    params: Record<string, any>;
  }

  export interface Response {
    [key: string]: any;
  }

  export interface Tool {
    name: string;
    description: string;
    inputSchema: {
      type: string;
      properties: Record<string, any>;
      required: string[];
    };
  }

  export class Server {
    constructor(
      info: { name: string; version: string },
      config: { capabilities: { tools: Record<string, never> } }
    );

    setRequestHandler<T extends Request>(
      method: string,
      handler: (request: T) => Promise<Response>
    ): void;

    connect(transport: any): Promise<void>;
    close(): Promise<void>;
    onerror: (error: Error) => void;
  }

  export class StdioServerTransport {
    constructor();
  }

  export enum ErrorCode {
    ParseError = -32700,
    InvalidRequest = -32600,
    MethodNotFound = -32601,
    InvalidParams = -32602,
    InternalError = -32603
  }

  export class McpError extends Error {
    constructor(code: ErrorCode, message: string);
    code: ErrorCode;
  }
}
