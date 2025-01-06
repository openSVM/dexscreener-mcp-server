declare module '@modelcontextprotocol/sdk/server/index' {
  export class Server {
    constructor(config: {
      name: string;
      version: string;
      capabilities?: { 
        tools?: Record<string, unknown>;
        resources?: Record<string, unknown>;
      };
    });

    setRequestHandler<T extends Request = Request, R extends Response = Response>(
      method: T | { method: string },
      handler: (request: T) => Promise<R>
    ): void;

    connect(transport: any): Promise<void>;
    close(): Promise<void>;
    onerror: (error: Error) => void;
  }
}

declare module '@modelcontextprotocol/sdk/server/stdio' {
  export class StdioServerTransport {
    constructor();
  }
}

declare module '@modelcontextprotocol/sdk/types' {
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

  export interface Request {
    method: string;
    params: Record<string, any>;
  }

  export interface Response {
    [key: string]: any;
  }
}
