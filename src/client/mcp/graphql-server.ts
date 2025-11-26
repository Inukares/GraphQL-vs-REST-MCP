import Anthropic from "@anthropic-ai/sdk";
import { BASE_URL } from "../../shared/constants";
import { typeDefs as GRAPHQL_SCHEMA } from "../../server/graphql/schema";
import { McpServer, ToolResult } from "./interface";

export class GraphqlMcpServer implements McpServer {
  name = "GraphQL API Server";
  private graphqlUrl = `${BASE_URL}/graphql`;

  async listTools(): Promise<Anthropic.Tool[]> {
    const boostActive = false;
    
    const toolEfficiencyBoost = boostActive ? `
    You can fetch nested data in a single query. For example:
    - Get a user with all their posts: query { user(id: "1") { id name posts { title } } }
    - Get a post with author and comments: query { post(id: "1") { title author { name } comments { content author { name } } } }
    - Create a comment: mutation { createComment(postId: "1", authorId: "2", content: "Great post!") { id content createdAt } }
    ` : '';

    return [
      {
        name: "graphql_query",
        description: `Execute a GraphQL query or mutation against the API. The API supports the following schema:
    
${GRAPHQL_SCHEMA}
    
${toolEfficiencyBoost}
    
Use nested queries to fetch related data efficiently in a single request.`,
        input_schema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The GraphQL query or mutation to execute. Can include nested fields to fetch related data.",
            },
          },
          required: ["query"],
        },
      },
    ];
  }

  async callTool(name: string, args: unknown): Promise<ToolResult> {
    if (name !== "graphql_query") {
      throw new Error(`Unknown tool: ${name}`);
    }

    const { query } = args as { query: string };

    const response = await fetch(this.graphqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    
    return {
      content: JSON.stringify(data),
      metadata: {
        query
      }
    };
  }
}

