import { runRestAgent } from "./rest-agent";
import { runGraphQLAgent } from "./graphql-agent";

interface AgentResult {
  result: string;
  tokenUsage: { input: number; output: number };
  apiCalls: number;
  latencyMs: number;
}

function printResults(restResult: AgentResult, graphqlResult: AgentResult) {
  console.log("\n" + "=".repeat(80));
  console.log("📊 COMPARISON RESULTS: GraphQL vs REST for LLMs");
  console.log("=".repeat(80) + "\n");

  console.log("🔴 REST API Approach");
  console.log("-".repeat(80));
  console.log(`Result: ${restResult.result}`);
  console.log(`\n📈 Metrics:`);
  console.log(`  • API Calls: ${restResult.apiCalls}`);
  console.log(`  • Latency: ${restResult.latencyMs.toFixed(0)}ms`);
  console.log(`  • Input Tokens: ${restResult.tokenUsage.input.toLocaleString()}`);
  console.log(`  • Output Tokens: ${restResult.tokenUsage.output.toLocaleString()}`);
  console.log(`  • Total Tokens: ${(restResult.tokenUsage.input + restResult.tokenUsage.output).toLocaleString()}`);

  console.log("\n🟢 GraphQL API Approach");
  console.log("-".repeat(80));
  console.log(`Result: ${graphqlResult.result}`);
  console.log(`\n📈 Metrics:`);
  console.log(`  • API Calls: ${graphqlResult.apiCalls}`);
  console.log(`  • Latency: ${graphqlResult.latencyMs.toFixed(0)}ms`);
  console.log(`  • Input Tokens: ${graphqlResult.tokenUsage.input.toLocaleString()}`);
  console.log(`  • Output Tokens: ${graphqlResult.tokenUsage.output.toLocaleString()}`);
  console.log(`  • Total Tokens: ${(graphqlResult.tokenUsage.input + graphqlResult.tokenUsage.output).toLocaleString()}`);

  console.log("\n💡 Analysis");
  console.log("-".repeat(80));

  const restTotal = restResult.tokenUsage.input + restResult.tokenUsage.output;
  const graphqlTotal = graphqlResult.tokenUsage.input + graphqlResult.tokenUsage.output;
  const tokenSavings = restTotal - graphqlTotal;
  const tokenSavingsPercent = ((tokenSavings / restTotal) * 100).toFixed(1);

  const apiCallReduction = restResult.apiCalls - graphqlResult.apiCalls;
  const apiCallReductionPercent = ((apiCallReduction / restResult.apiCalls) * 100).toFixed(1);

  const latencySavings = restResult.latencyMs - graphqlResult.latencyMs;
  const latencySavingsPercent = ((latencySavings / restResult.latencyMs) * 100).toFixed(1);

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

