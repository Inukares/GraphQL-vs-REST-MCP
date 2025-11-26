import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL } from "../../shared/constants";
import { RestMcpServer } from "../mcp/rest-server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function runRestAgent(task: string): Promise<{
  result: string;
  tokenUsage: { input: number; output: number };
  apiCalls: number;
  latencyMs: number;
  apiResponses: Array<{ tool: string; response: unknown; url: string }>;
}> {
  const server = new RestMcpServer();
  const tools = await server.listTools();

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

      const toolUseBlocks = response.content.filter(
        (block) => block.type === "tool_use"
      );

      const results = await Promise.all(
        toolUseBlocks.map(async (block) => {
          if (block.type !== "tool_use") return null;
          apiCallCount++;
          const { content, metadata } = await server.callTool(
            block.name,
            block.input
          );
          return { block, result: content, url: metadata?.url as string };
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
