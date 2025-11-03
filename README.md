# GraphQL vs REST for LLMs: A Comparison

This project demonstrates the differences between GraphQL and REST APIs when used with Large Language Models (LLMs), specifically Claude by Anthropic. It showcases how GraphQL can reduce token usage and API roundtrips for hierarchical data queries.

## 🎯 Project Overview

This demo includes:
- **Single Elysia server** serving both REST and GraphQL endpoints
- **Mock data** (Users, Posts, Comments) with no database
- **Two AI agents**:
  - REST Agent: Uses multiple REST endpoints with tool calling
  - GraphQL Agent: Uses a single GraphQL endpoint with nested queries
- **Comparison script**: Runs both agents and measures token usage, API calls, and efficiency

## 📁 Project Structure

```
src/
├── data/
│   └── mock-data.ts          # Shared mock data
├── rest/
│   └── handlers.ts            # REST endpoint handlers
├── graphql/
│   └── schema.ts              # GraphQL schema and resolvers
├── agents/
│   ├── rest-agent.ts          # Agent using REST API
│   ├── graphql-agent.ts       # Agent using GraphQL API
│   └── comparison.ts          # Comparison script
└── index.ts                   # Main server file
```

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) runtime installed
- Anthropic API key (get one at https://console.anthropic.com/)

### Installation

1. Install dependencies:
```bash
bun install
```

2. Set up your environment variables by creating a `.env.local` file:
```bash
echo "ANTHROPIC_API_KEY=your_api_key_here" > .env.local
```

Or manually create `.env.local`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

Note: The `.env.local` file is gitignored for security.

## 🏃 Running the Project

### Start the Server

```bash
bun run dev
# or
bun run start
```

The server will start on http://localhost:3000 with:
- GraphQL endpoint: http://localhost:3000/graphql
- REST endpoints: http://localhost:3000/rest/*

### Run the Comparison

In a separate terminal (with the server running):

```bash
bun run compare
```

This will run both agents through several test scenarios and display detailed metrics comparing:
- Token usage (input, output, total)
- Number of API calls
- Efficiency improvements

## 📊 API Endpoints

### GraphQL Endpoint

**URL:** `http://localhost:3000/graphql`

**Example Query:**
```graphql
query {
  user(id: "1") {
    name
    email
    posts {
      title
      likes
      comments {
        content
        author {
          name
        }
      }
    }
  }
}
```

### REST Endpoints

- `GET /rest/users/:id` - Get user by ID
- `GET /rest/users/:id/posts` - Get user's posts
- `GET /rest/posts/:id` - Get post by ID
- `GET /rest/posts/:id/author` - Get post's author
- `GET /rest/posts/:id/comments` - Get post's comments
- `GET /rest/comments/:id` - Get comment by ID
- `GET /rest/comments/:id/author` - Get comment's author
- `POST /rest/comments` - Create a new comment

## 💡 Key Insights

### When GraphQL Shines

1. **Hierarchical Data Queries**: Fetching nested relationships (e.g., user → posts → comments → authors)
2. **Reduced Roundtrips**: Single query instead of multiple REST calls
3. **Token Efficiency**: Less token usage due to fewer tool calls and responses
4. **Flexible Data Fetching**: Request exactly what you need

### When REST May Be Sufficient

1. **Simple, flat data queries**
2. **Single resource lookups**
3. **Non-hierarchical operations**

### LLM-Specific Considerations

- **Schema Descriptions**: GraphQL's type system with descriptions helps LLMs understand available operations
- **Tool Calling Efficiency**: Fewer tools with flexible parameters vs. many specific tools
- **Cost Optimization**: Token savings translate to cost savings with LLM APIs
- **Latency**: Fewer roundtrips mean faster response times

## 🧪 Test Scenarios

The comparison script includes three test scenarios:

1. **Simple User Query**: Basic single-resource lookup
2. **Hierarchical Data Query**: Multiple levels of nested data
3. **Deep Nested Query**: Complex relationships with multiple joins

Each scenario runs through both REST and GraphQL agents to demonstrate the differences in approach and efficiency.

## 🛠️ Technologies Used

- [Bun](https://bun.sh) - JavaScript runtime
- [Elysia](https://elysiajs.com) - Web framework
- [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server) - GraphQL server
- [Anthropic Claude](https://www.anthropic.com/claude) - LLM (Claude Sonnet 4)
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## 📝 Notes for Presentation

- This is a demo for educational purposes
- Mock data is used (no real database)
- Focuses on token efficiency and API design patterns
- Shows practical differences in tool calling strategies for LLMs

## 📄 License

This is a demo project for presentation purposes.