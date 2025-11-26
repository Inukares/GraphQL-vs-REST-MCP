import Anthropic from "@anthropic-ai/sdk";

export interface ToolResult {
  content: string;
  metadata?: Record<string, unknown>;
}

export interface McpServer {
  name: string;
  listTools(): Promise<Anthropic.Tool[]>;
  callTool(name: string, args: unknown): Promise<ToolResult>;
}
