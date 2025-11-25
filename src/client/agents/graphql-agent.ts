import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, BASE_URL } from "../../shared/constants";
import { typeDefs as GRAPHQL_SCHEMA } from "../../server/graphql/schema";

const GRAPHQL_URL = `${BASE_URL}/graphql`;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const boostActive = false

const toolEfficiencyBoost = boostActive ? `
You can fetch nested data in a single query. For example:
- Get a user with all their posts: query { user(id: "1") { id name posts { title } } }
- Get a post with author and comments: query { post(id: "1") { title author { name } comments { content author { name } } } }
- Create a comment: mutation { createComment(postId: "1", authorId: "2", content: "Great post!") { id content createdAt } }
` : ''

const tools: Anthropic.Tool[] = [
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

async function callGraphQLApi(query: string): Promise<string> {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  return JSON.stringify(data);
}

export async function runGraphQLAgent(task: string): Promise<{
  result: string;
  tokenUsage: { input: number; output: number };
  apiCalls: number;
  latencyMs: number;
  apiResponses: Array<{ query: string; response: unknown }>;
}> {
  const startTime = performance.now();
  
  let apiCallCount = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  const apiResponses: Array<{ query: string; response: unknown }> = [];

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
          const input = block.input as { query: string };
          const result = await callGraphQLApi(input.query);
          apiResponses.push({
            query: input.query,
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

