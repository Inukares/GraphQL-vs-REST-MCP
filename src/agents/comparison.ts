import { runRestAgent } from "./rest-agent";
import { runGraphQLAgent } from "./graphql-agent";

interface ApiCall {
  tool?: string;
  query?: string;
  response: unknown;
  url?: string;
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
    console.log(`  ${idx + 1}. ${call.url}`);
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
  
  const apiCallDiff = restResult.apiCalls - graphqlResult.apiCalls;
  const latencyDiff = restResult.latencyMs - graphqlResult.latencyMs;
  const inputTokenDiff = restResult.tokenUsage.input - graphqlResult.tokenUsage.input;
  const outputTokenDiff = restResult.tokenUsage.output - graphqlResult.tokenUsage.output;
  const totalTokenDiff = restTotal - graphqlTotal;

  const getWinner = (diff: number, lowerBetter: boolean = true): string => {
    if (diff === 0) return "Tie";
    if (lowerBetter) {
      return diff > 0 ? "GraphQL ✅" : "REST ✅";
    }
    return diff > 0 ? "REST ✅" : "GraphQL ✅";
  };

  const formatDiff = (diff: number, unit: string = ""): string => {
    if (diff === 0) return "0" + unit;
    const absValue = Math.abs(diff);
    const sign = diff > 0 ? "-" : "+";
    return `${sign}${absValue.toLocaleString()}${unit}`;
  };

  const metrics = [
    ["Metric", "REST", "GraphQL", "Difference", "Winner"],
    ["─".repeat(18), "─".repeat(13), "─".repeat(13), "─".repeat(13), "─".repeat(13)],
    ["API Calls", restResult.apiCalls.toString(), graphqlResult.apiCalls.toString(), formatDiff(apiCallDiff), getWinner(apiCallDiff, true)],
    ["Latency", `${restResult.latencyMs.toFixed(0)}ms`, `${graphqlResult.latencyMs.toFixed(0)}ms`, formatDiff(latencyDiff, "ms"), getWinner(latencyDiff, true)],
    ["Input Tokens", restResult.tokenUsage.input.toLocaleString(), graphqlResult.tokenUsage.input.toLocaleString(), formatDiff(inputTokenDiff), getWinner(inputTokenDiff, true)],
    ["Output Tokens", restResult.tokenUsage.output.toLocaleString(), graphqlResult.tokenUsage.output.toLocaleString(), formatDiff(outputTokenDiff), getWinner(outputTokenDiff, true)],
    ["Total Tokens", restTotal.toLocaleString(), graphqlTotal.toLocaleString(), formatDiff(totalTokenDiff), getWinner(totalTokenDiff, true)],
  ];
  
  const colWidths = [20, 15, 15, 15, 15];
  metrics.forEach((row) => {
    const formattedRow = row.map((cell, idx) => cell.padEnd(colWidths[idx])).join(" │ ");
    console.log(`  ${formattedRow}`);
  });

  console.log("\n💡 Analysis");
  console.log("-".repeat(80));

  const tokenDiffPercent = restTotal > 0 ? Math.abs((totalTokenDiff / restTotal) * 100).toFixed(1) : "0.0";
  const apiCallDiffPercent = restResult.apiCalls > 0 ? Math.abs((apiCallDiff / restResult.apiCalls) * 100).toFixed(1) : "0.0";
  const latencyDiffPercent = restResult.latencyMs > 0 ? Math.abs((latencyDiff / restResult.latencyMs) * 100).toFixed(1) : "0.0";

  if (totalTokenDiff > 0) {
    console.log(`  • Token Usage: GraphQL used ${totalTokenDiff.toLocaleString()} fewer tokens (${tokenDiffPercent}% reduction)`);
  } else if (totalTokenDiff < 0) {
    console.log(`  • Token Usage: GraphQL used ${Math.abs(totalTokenDiff).toLocaleString()} more tokens (${tokenDiffPercent}% increase)`);
  } else {
    console.log(`  • Token Usage: Both used the same number of tokens`);
  }

  if (apiCallDiff > 0) {
    console.log(`  • API Calls: GraphQL made ${apiCallDiff} fewer calls (${apiCallDiffPercent}% reduction)`);
  } else if (apiCallDiff < 0) {
    console.log(`  • API Calls: GraphQL made ${Math.abs(apiCallDiff)} more calls (${apiCallDiffPercent}% increase)`);
  } else {
    console.log(`  • API Calls: Both made the same number of calls`);
  }

  if (latencyDiff > 0) {
    console.log(`  • Latency: GraphQL was ${latencyDiff.toFixed(0)}ms faster (${latencyDiffPercent}% improvement)`);
  } else if (latencyDiff < 0) {
    console.log(`  • Latency: GraphQL was ${Math.abs(latencyDiff).toFixed(0)}ms slower (${latencyDiffPercent}% slower)`);
  } else {
    console.log(`  • Latency: Both had the same latency`);
  }

  if (totalTokenDiff > 0) {
    console.log(`\n  ✅ Overall: GraphQL was more efficient`);
  } else if (totalTokenDiff < 0) {
    console.log(`\n  ✅ Overall: REST was more efficient`);
  } else {
    console.log(`\n  🤝 Overall: Both approaches were equally efficient`);
  }

  console.log("\n" + "=".repeat(80) + "\n");
}

function printKeyTakeaways() {
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

  printKeyTakeaways();

  console.log("\n✅ All tests completed!\n");
}

main().catch(console.error);

