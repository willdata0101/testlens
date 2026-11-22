import type { TestResult } from '../../test_result';

export async function requestTestRecommendations(testResults: TestResult[]): Promise<string[]> {
  const response = await fetch('/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testResults),
  });

  const payload: unknown = await response.json();
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('The summary API returned an invalid response.');
  }

  const data = payload as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(
      typeof data.error === 'string' ? data.error : 'Unable to summarize test results.',
    );
  }
  if (
    !Array.isArray(data.recommendations)
    || data.recommendations.length !== testResults.length
    || !data.recommendations.every(item => typeof item === 'string')
  ) {
    throw new Error('The recommendations API returned an invalid result list.');
  }

  return data.recommendations;
}
