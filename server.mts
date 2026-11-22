import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { recommendTestResults } from "./claude_api_init.mts";
import type { TestResult } from "./test_result.ts";

const port = Number(process.env["API_PORT"] ?? 3001);
const maxBodyBytes = 1_000_000;

class RequestError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
  }
}

async function readTestResults(request: IncomingMessage): Promise<TestResult[]> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.length;
    if (totalBytes > maxBodyBytes) {
      throw new RequestError("Request body is too large.", 413);
    }
    chunks.push(buffer);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
  } catch {
    throw new RequestError("Request body must be valid JSON.", 400);
  }

  if (!Array.isArray(payload) || payload.length === 0 || !payload.every(isTestResult)) {
    throw new RequestError("Request body must be a non-empty array of test results.", 400);
  }

  return payload;
}

function isTestResult(value: unknown): value is TestResult {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const result = value as Record<string, unknown>;
  return typeof result.name === "string"
    && typeof result.browser === "string"
    && typeof result.status === "string"
    && (result.error === null || typeof result.error === "string");
}

function sendJson(response: ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/api/recommendations") {
    sendJson(response, 404, { error: "Not found." });
    return;
  }

  try {
    const testResults = await readTestResults(request);
    const recommendations = await recommendTestResults(testResults);
    sendJson(response, 200, { recommendations });
  } catch (error) {
    const statusCode = error instanceof RequestError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : "Unable to summarize test results.";
    sendJson(response, statusCode, { error: message });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`TestLens API listening on http://127.0.0.1:${port}`);
});
