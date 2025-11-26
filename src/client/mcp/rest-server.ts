import Anthropic from "@anthropic-ai/sdk";
import { BASE_URL } from "../../shared/constants";
import { REST_TOOLS } from "./rest-tools";
import { McpServer, ToolResult } from "./interface";

export class RestMcpServer implements McpServer {
  name = "REST API Server";

  async listTools(): Promise<Anthropic.Tool[]> {
    return REST_TOOLS;
  }

  async callTool(name: string, args: unknown): Promise<ToolResult> {
    const toolInput = args as Record<string, string>;
    let url: string;
    let method = "GET";
    let body: Record<string, string> | undefined;

    switch (name) {
      case "get_user":
        url = `${BASE_URL}/rest/users/${toolInput.id}`;
        break;
      case "get_user_posts":
        url = `${BASE_URL}/rest/users/${toolInput.userId}/posts`;
        break;
      case "get_post":
        url = `${BASE_URL}/rest/posts/${toolInput.id}`;
        break;
      case "get_post_author":
        url = `${BASE_URL}/rest/posts/${toolInput.postId}/author`;
        break;
      case "get_post_comments":
        url = `${BASE_URL}/rest/posts/${toolInput.postId}/comments`;
        break;
      case "get_comment_author":
        url = `${BASE_URL}/rest/comments/${toolInput.commentId}/author`;
        break;
      case "create_comment":
        url = `${BASE_URL}/rest/comments`;
        method = "POST";
        body = toolInput;
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      content: JSON.stringify(data),
      metadata: {
        url: `${method} ${url.replace(BASE_URL, "")}`
      }
    };
  }
}

