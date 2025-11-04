import { runRestAgent } from "./rest-agent";
import { runGraphQLAgent } from "./graphql-agent";

interface ApiCall {
  tool?: string;
  query?: string;
  response: unknown;
}

interface AgentResult {
  result: string;
  tokenUsage: { input: number; output: number };
  apiCalls: number;
  latencyMs: number;
  apiResponses: ApiCall[];
}

function printResults(restResult: AgentResult, graphqlResult: AgentResult) {
  console.log("\n" + "=".repeat(80));
  console.log("📊 COMPARISON RESULTS: GraphQL vs REST for LLMs");
  console.log("=".repeat(80) + "\n");

  console.log("🔴 REST API Approach");
  console.log("-".repeat(80));
  console.log(`Result: ${restResult.result}`);
  console.log(`\n📡 API Calls Made (${restResult.apiCalls} total):`);
  restResult.apiResponses.forEach((call: ApiCall, idx: number) => {
    const toolToUrl: Record<string, string> = {
      get_user: "GET /rest/users/{id}",
      get_user_posts: "GET /rest/users/{id}/posts",
      get_post: "GET /rest/posts/{id}",
      get_post_author: "GET /rest/posts/{id}/author",
      get_post_comments: "GET /rest/posts/{id}/comments",
      get_comment_author: "GET /rest/comments/{id}/author",
      create_comment: "POST /rest/comments",
    };
    const url = toolToUrl[call.tool || ""] || call.tool;
    console.log(`  ${idx + 1}. ${url}`);
  });

  console.log("\n🟢 GraphQL API Approach");
  console.log("-".repeat(80));
  console.log(`Result: ${graphqlResult.result}`);
  console.log(`\n📡 GraphQL Queries Made (${graphqlResult.apiCalls} total):`);
  graphqlResult.apiResponses.forEach((call: ApiCall, idx: number) => {
    console.log(`  ${idx + 1}. Query:`);
    const formattedQuery = call.query?.trim().replace(/\n/g, "\n     ");
    console.log(`     ${formattedQuery}`);
  });

  console.log("\n📊 Metrics Comparison Table");
  console.log("-".repeat(80));
  
  const restTotal = restResult.tokenUsage.input + restResult.tokenUsage.output;
  const graphqlTotal = graphqlResult.tokenUsage.input + graphqlResult.tokenUsage.output;
  
  const metrics = [
    ["Metric", "REST", "GraphQL", "Difference"],
    ["─".repeat(20), "─".repeat(15), "─".repeat(15), "─".repeat(20)],
    ["API Calls", restResult.apiCalls.toString(), graphqlResult.apiCalls.toString(), `${restResult.apiCalls - graphqlResult.apiCalls} fewer`],
    ["Latency", `${restResult.latencyMs.toFixed(0)}ms`, `${graphqlResult.latencyMs.toFixed(0)}ms`, `${(restResult.latencyMs - graphqlResult.latencyMs).toFixed(0)}ms faster`],
    ["Input Tokens", restResult.tokenUsage.input.toLocaleString(), graphqlResult.tokenUsage.input.toLocaleString(), `${(restResult.tokenUsage.input - graphqlResult.tokenUsage.input).toLocaleString()}`],
    ["Output Tokens", restResult.tokenUsage.output.toLocaleString(), graphqlResult.tokenUsage.output.toLocaleString(), `${(restResult.tokenUsage.output - graphqlResult.tokenUsage.output).toLocaleString()}`],
    ["Total Tokens", restTotal.toLocaleString(), graphqlTotal.toLocaleString(), `${(restTotal - graphqlTotal).toLocaleString()}`],
  ];
  
  const colWidths = [22, 17, 17, 22];
  metrics.forEach((row) => {
    const formattedRow = row.map((cell, idx) => cell.padEnd(colWidths[idx])).join(" │ ");
    console.log(`  ${formattedRow}`);
  });

  console.log("\n💡 Analysis");
  console.log("-".repeat(80));

  const tokenSavings = restTotal - graphqlTotal;
  const tokenSavingsPercent = restTotal > 0 ? ((tokenSavings / restTotal) * 100).toFixed(1) : "0.0";

  const apiCallReduction = restResult.apiCalls - graphqlResult.apiCalls;
  const apiCallReductionPercent = restResult.apiCalls > 0 ? ((apiCallReduction / restResult.apiCalls) * 100).toFixed(1) : "0.0";

  const latencySavings = restResult.latencyMs - graphqlResult.latencyMs;
  const latencySavingsPercent = restResult.latencyMs > 0 ? ((latencySavings / restResult.latencyMs) * 100).toFixed(1) : "0.0";

  console.log(`  • Token Savings: ${tokenSavings.toLocaleString()} tokens (${tokenSavingsPercent}% reduction)`);
  console.log(`  • API Call Reduction: ${apiCallReduction} fewer calls (${apiCallReductionPercent}% reduction)`);
  console.log(`  • Latency Improvement: ${latencySavings.toFixed(0)}ms faster (${latencySavingsPercent}% faster)`);

  if (tokenSavings > 0) {
    console.log(`  • GraphQL was more efficient ✅`);
  } else if (tokenSavings < 0) {
    console.log(`  • REST was more efficient ✅`);
  } else {
    console.log(`  • Both approaches were equally efficient 🤝`);
  }

  console.log("\n📝 Key Takeaways");
  console.log("-".repeat(80));
  console.log("  1. GraphQL reduces API roundtrips by fetching hierarchical data in one query");
  console.log("  2. Schema descriptions improve tool calling precision for LLMs");
  console.log("  3. For non-hierarchical data, the difference may be minimal");
  console.log("  4. Token efficiency matters for cost and latency in LLM applications");
  console.log("\n" + "=".repeat(80) + "\n");
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ Error: ANTHROPIC_API_KEY environment variable is not set");
    console.error("Please set it by running: export ANTHROPIC_API_KEY=your_api_key");
    process.exit(1);
  }

  const testTasks = [
    {
      name: "Simple User Query",
      task: "Get information about user with ID 1. Fetch the user's id, name, and email.",
    },
    {
      name: "Hierarchical Data Query",
      task: "Get all posts by user with ID 1. For each post, fetch: id, title, content, likes. For each post, also fetch all comments. For each comment, fetch: id, content, createdAt, and the author's name.",
    },
    {
      name: "Deep Nested Query",
      task: "Get the post with ID 5. Fetch: id, title, content, likes. Also fetch the post author's id, name, and email. Also fetch all comments on that post - for each comment fetch: id, content, createdAt, and the comment author's id and name.",
    },
  ];

  for (const testTask of testTasks) {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`🧪 Running Test: ${testTask.name}`);
    console.log(`${"=".repeat(80)}`);
    console.log(`Task: ${testTask.task}\n`);

    console.log("⏳ Running REST agent...");
    const restResult = await runRestAgent(testTask.task);

    console.log("⏳ Running GraphQL agent...");
    const graphqlResult = await runGraphQLAgent(testTask.task);

    printResults(restResult, graphqlResult);
  }

  console.log("\n✅ All tests completed!\n");
}

main().catch(console.error);

