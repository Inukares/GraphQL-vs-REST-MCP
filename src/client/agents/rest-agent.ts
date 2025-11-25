import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, BASE_URL } from "../../shared/constants";
import { REST_TOOLS } from "../definitions/rest-tools";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function callRestApi(toolName: string, toolInput: Record<string, string>): Promise<{ result: string; url: string }> {
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
  return { result: JSON.stringify(data), url: `${method} ${url.replace(BASE_URL, "")}` };
}

export async function runRestAgent(task: string): Promise<{
  result: string;
  tokenUsage: { input: number; output: number };
  apiCalls: number;
  latencyMs: number;
  apiResponses: Array<{ tool: string; response: unknown; url: string }>;
}> {
  const startTime = performance.now();
  
  let apiCallCount = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  const apiResponses: Array<{ tool: string; response: unknown; url: string }> = [];

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
      tools: REST_TOOLS,
      messages,
    });

    totalInputTokens += response.usage.input_tokens;
    totalOutputTokens += response.usage.output_tokens;

    if (response.stop_reason === "tool_use") {
      const toolResults: Anthropic.MessageParam = {
        role: "user",
        content: [],
      };

      const toolUseBlocks = response.content.filter(
        (block) => block.type === "tool_use"
      );

      const results = await Promise.all(
        toolUseBlocks.map(async (block) => {
          if (block.type !== "tool_use") return null;
          apiCallCount++;
          const { result, url } = await callRestApi(
            block.name,
            block.input as Record<string, string>
          );
          return { block, result, url };
        })
      );

      for (const res of results) {
        if (!res) continue;
        const { block, result, url } = res;

        apiResponses.push({
          tool: block.name,
          response: JSON.parse(result),
          url,
        });
        (toolResults.content as Anthropic.ToolResultBlockParam[]).push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
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
