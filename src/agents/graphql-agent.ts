import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, BASE_URL } from "../constants";

const GRAPHQL_URL = `${BASE_URL}/graphql`;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const GRAPHQL_SCHEMA = `
type Query {
  """Get a user by ID"""
  user(id: ID!): User
  
  """Get a post by ID"""
  post(id: ID!): Post
  
  """Get all users"""
  users: [User!]!
  
  """Get all posts"""
  posts: [Post!]!
}

type Mutation {
  """Create a new comment on a post"""
  createComment(postId: ID!, authorId: ID!, content: String!): Comment
}

"""A user in the system"""
type User {
  """Unique identifier for the user"""
  id: ID!
  
  """User's full name"""
  name: String!
  
  """User's email address"""
  email: String!
  
  """All posts created by this user"""
  posts: [Post!]!
}

"""A blog post"""
type Post {
  """Unique identifier for the post"""
  id: ID!
  
  """Title of the post"""
  title: String!
  
  """Content/body of the post"""
  content: String!
  
  """The user who created this post"""
  author: User!
  
  """All comments on this post"""
  comments: [Comment!]!
  
  """Number of likes on this post"""
  likes: Int!
}

"""A comment on a post"""
type Comment {
  """Unique identifier for the comment"""
  id: ID!
  
  """Content of the comment"""
  content: String!
  
  """The user who created this comment"""
  author: User!
  
  """The post this comment belongs to"""
  post: Post!
  
  """When the comment was created"""
  createdAt: String!
}
`;

const boostActive = true

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
}> {
  const startTime = performance.now();
  
  let apiCallCount = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

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
      };
    }
  }

  throw new Error("Unexpected end of loop");
}

