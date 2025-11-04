import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, BASE_URL } from "../constants";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const tools: Anthropic.Tool[] = [
  {
    name: "get_user",
    description: "Get a user by their ID. Returns user information including id, name, and email.",
    input_schema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The ID of the user to retrieve",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "get_user_posts",
    description: "Get all posts created by a specific user.",
    input_schema: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "The ID of the user whose posts to retrieve",
        },
      },
      required: ["userId"],
    },
  },
  {
    name: "get_post",
    description: "Get a post by its ID. Returns post information including id, title, content, authorId, and likes.",
    input_schema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The ID of the post to retrieve",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "get_post_author",
    description: "Get the author of a specific post.",
    input_schema: {
      type: "object",
      properties: {
        postId: {
          type: "string",
          description: "The ID of the post whose author to retrieve",
        },
      },
      required: ["postId"],
    },
  },
  {
    name: "get_post_comments",
    description: "Get all comments on a specific post.",
    input_schema: {
      type: "object",
      properties: {
        postId: {
          type: "string",
          description: "The ID of the post whose comments to retrieve",
        },
      },
      required: ["postId"],
    },
  },
  {
    name: "get_comment_author",
    description: "Get the author of a specific comment.",
    input_schema: {
      type: "object",
      properties: {
        commentId: {
          type: "string",
          description: "The ID of the comment whose author to retrieve",
        },
      },
      required: ["commentId"],
    },
  },
  {
    name: "create_comment",
    description: "Create a new comment on a post.",
    input_schema: {
      type: "object",
      properties: {
        postId: {
          type: "string",
          description: "The ID of the post to comment on",
        },
        authorId: {
          type: "string",
          description: "The ID of the user creating the comment",
        },
        content: {
          type: "string",
          description: "The content of the comment",
        },
      },
      required: ["postId", "authorId", "content"],
    },
  },
];

async function callRestApi(toolName: string, toolInput: Record<string, string>): Promise<string> {
  let url: string;
  let method = "GET";
  let body: Record<string, string> | undefined;

  switch (toolName) {
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
      throw new Error(`Unknown tool: ${toolName}`);
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
  return JSON.stringify(data);
}

export async function runRestAgent(task: string): Promise<{
  result: string;
  tokenUsage: { input: number; output: number };
  apiCalls: number;
  latencyMs: number;
  apiResponses: Array<{ tool: string; response: unknown }>;
}> {
  const startTime = performance.now();
  
  let apiCallCount = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  const apiResponses: Array<{ tool: string; response: unknown }> = [];

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: task,
    },
  ];

  let continueLoop = true;

  while (continueLoop) {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 9000,
      tools,
      messages,
    });

    totalInputTokens += response.usage.input_tokens;
    totalOutputTokens += response.usage.output_tokens;

    if (response.stop_reason === "tool_use") {
      const toolResults: Anthropic.MessageParam = {
        role: "user",
        content: [],
      };

      for (const block of response.content) {
        if (block.type === "tool_use") {
          apiCallCount++;
          const result = await callRestApi(block.name, block.input as Record<string, string>);
          apiResponses.push({
            tool: block.name,
            response: JSON.parse(result),
          });
          (toolResults.content as Anthropic.ToolResultBlockParam[]).push({
            type: "tool_result",
            tool_use_id: block.id,
            content: result,
          });
        }
      }

      messages.push({
        role: "assistant",
        content: response.content,
      });
      messages.push(toolResults);
    } else {
      const endTime = performance.now();
      const textBlock = response.content.find((block) => block.type === "text");
      const finalAnswer = textBlock && "text" in textBlock ? textBlock.text : "No response";

      return {
        result: finalAnswer,
        tokenUsage: {
          input: totalInputTokens,
          output: totalOutputTokens,
        },
        apiCalls: apiCallCount,
        latencyMs: endTime - startTime,
        apiResponses,
      };
    }
  }

  throw new Error("Unexpected end of loop");
}

