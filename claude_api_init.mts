import Anthropic from "@anthropic-ai/sdk";
import { cleanError } from "./error_format.ts";
import type { TestResult } from "./test_result.ts";

type Recommendation = {
  index: number;
  recommendation: string;
};

type RecommendationOutput = {
  recommendations: Recommendation[];
};

function isRecommendation(value: unknown): value is Recommendation {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const recommendation = value as Record<string, unknown>;
  return typeof recommendation.index === "number"
    && Number.isInteger(recommendation.index)
    && typeof recommendation.recommendation === "string"
    && recommendation.recommendation.trim().length > 0;
}

function isRecommendationOutput(value: unknown): value is RecommendationOutput {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const output = value as Record<string, unknown>;
  return Array.isArray(output.recommendations)
    && output.recommendations.every(isRecommendation);
}

export async function recommendTestResults(testResults: TestResult[]): Promise<string[]> {
  if (testResults.length === 0) {
    throw new Error("Cannot generate recommendations for an empty list of test results.");
  }

  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }

  const client = new Anthropic({ apiKey });
  const cleanedResults = testResults.map(result => ({
    ...result,
    error: result.error === null ? null : cleanError(result.error),
  }));
  const indexedResults = testResults.map((result, index) => ({
    index,
    ...result,
    error: result.error === null ? null : cleanError(result.error),
  }));
  const message = await client.messages.create({
    max_tokens: 2048,
    messages: [{
      role: "user",
      content: `Provide one concise, actionable recommendation for each test result. \
      For passed tests, say that no corrective action is needed. \
      For failed or timed-out tests, use the error details to suggest what to investigate. \
      For tests without a result, say that the report contains no result. \
      Preserve every supplied index exactly once. Test results: ${JSON.stringify(indexedResults)}`,
    }],
    model: "claude-haiku-5-5",
    tools: [{
      name: "provide_recommendations",
      description: "Return one recommendation for each test result, matched by its index.",
      input_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                index: { type: "integer" },
                recommendation: { type: "string" },
              },
              required: ["index", "recommendation"],
              additionalProperties: false,
            },
          },
        },
        required: ["recommendations"],
        additionalProperties: false,
      },
    }],
    tool_choice: {
      type: "tool",
      name: "provide_recommendations",
      disable_parallel_tool_use: true,
    },
  });

  const toolUse = message.content.find(block => block.type === "tool_use");
  if (
    !toolUse
    || toolUse.name !== "provide_recommendations"
    || !isRecommendationOutput(toolUse.input)
  ) {
    throw new Error("Anthropic returned recommendations in an unexpected format.");
  }

  const recommendations = new Array<string | undefined>(testResults.length);
  for (const item of toolUse.input.recommendations) {
    if (item.index < 0 || item.index >= recommendations.length || recommendations[item.index] !== undefined) {
      throw new Error("Anthropic returned an invalid recommendation index.");
    }
    recommendations[item.index] = item.recommendation;
  }

  return recommendations.map((recommendation, index) => {
    if (recommendation === undefined) {
      throw new Error(`Anthropic did not return a recommendation for test result ${index}.`);
    }
    return recommendation;
  });
}