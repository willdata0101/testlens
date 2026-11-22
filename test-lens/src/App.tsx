import { useState } from 'react';
import { useEffect } from 'react';
import { cleanError } from '../../error_format';
import type { TestResult } from '../../test_result';
import { requestTestRecommendations } from './summaryApi';
// import heroImg from './assets/hero.png'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
import './App.css'

type TestSpec = {
  title: string,
  tests: Array<{
    projectName: string,
    results: Array<{ 
      status: string;
      error?: {message?: string} }>
  }>
}

function App() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [recommendationSet, setRecommendationSet] = useState<{
    resultsKey: string;
    recommendations: string[];
  } | null>(null);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const resultsKey = JSON.stringify(testResults);
  const currentRecommendations = recommendationSet?.resultsKey === resultsKey
    ? recommendationSet.recommendations
    : null;

  const passedCount = testResults.filter(test => test.status === "passed").length
  const totalExecutions = testResults.length
  const failedCount = testResults.filter(test => test.status === "failed" || test.status === "timedOut").length
  const passRate = (totalExecutions > 0 ? passedCount / totalExecutions * 100 : 0)

  function toggleAiRecommendations(enabled: boolean) {
    setAiEnabled(enabled);
    if (!enabled) {
      setRecommendationSet(null);
      setRecommendationError(null);
    }
  }

  async function generateRecommendations() {
    setIsGeneratingRecommendations(true);
    setRecommendationError(null);
    const requestedResultsKey = resultsKey;
    try {
      const recommendations = await requestTestRecommendations(testResults);
      setRecommendationSet({
        resultsKey: requestedResultsKey,
        recommendations,
      });
    } catch (e) {
      setRecommendationError(
        e instanceof Error ? e.message : 'Unable to generate recommendations.',
      );
    } finally {
      setIsGeneratingRecommendations(false);
    }
  }

  useEffect(() => {
    async function loadResults() {

      try {
        const response = await fetch('/results.json', {
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error('Unable to load test results. Please try again.');
        }

        const data: { suites: Array<{ specs: TestSpec[] }> } = await response.json();

        const allSpecs = data.suites.flatMap(suite => suite.specs)

        const testResults = allSpecs.map(spec => {
          const test = spec.tests[0];
          const result = test?.results[0];

          const errorMessage = result?.error?.message;

          return {
            name: spec.title,
            browser: test?.projectName ?? 'unknown',
            status: result?.status ?? 'no-result',
            error: errorMessage == null ? null : cleanError(errorMessage),
          };
        });

        setTestResults(testResults);
        setError(null);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : 'Unable to load test results. Please try again.'
        );
      }
    }

    void loadResults();

    const intervalId = setInterval(loadResults, 5000)

    return () => clearInterval(intervalId)

  }, []);

  return (
    <>
      <section id="center">
      <div className='dashboard-layout'>
        <div className="app-header">
          <h1>TestLens Dashboard</h1>
        </div>
        <h2 className="dashboard-tests-heading">Dashboard Tests</h2>
        <div className='metrics-grid'>
          <div className='metrics-card'>
            <p>Total Executions</p>
            <p><h2>{totalExecutions}</h2></p>
          </div>
          <div className='metrics-card'>
            <p>Passed Count</p>
            <p><h2>{passedCount}</h2></p>
          </div>
          <div className='metrics-card'>
            <p>Failed Count</p>
            <p><h2>{failedCount}</h2></p>
          </div>
          <div className='metrics-card'>
            <p>Pass Rate</p>
            <p><h2>{passRate.toFixed(2)}%</h2></p>
          </div>
        </div>
      
      <section className="test-results">
        <div className="test-summary">
          <label>
            <input
              type="checkbox"
              checked={aiEnabled}
              onChange={event => toggleAiRecommendations(event.currentTarget.checked)}
            />
            Enable AI recommendations
          </label>
          {aiEnabled && (
            <button
              type="button"
              onClick={() => void generateRecommendations()}
              disabled={isGeneratingRecommendations || testResults.length === 0}
            >
              {isGeneratingRecommendations ? 'Generating...' : 'Generate recommendations'}
            </button>
          )}
          {aiEnabled && recommendationError && <p role="alert">{recommendationError}</p>}
        </div>
        <div className="test-table-wrapper">
          <table className={`test-table${aiEnabled ? ' test-table--with-ai' : ''}`}>
            <thead>
              <tr>
                <th scope="col">Feature tested</th>
                <th scope="col">Browser</th>
                <th scope="col">Status</th>
                {aiEnabled && <th scope="col">AI recommendation</th>}
              </tr>
            </thead>
            <tbody>
              {testResults.map((test, index) => (
                <tr key={`${test.name}-${test.browser}-${index}`}>
                  <td>{test.name}</td>
                  <td>{test.browser}</td>
                  <td>
                    <span className={`test-status test-status--${test.status}`}>
                      {test.status.replace('-', ' ')}
                    </span>
                  </td>
                  {aiEnabled && (
                    <td>
                      {isGeneratingRecommendations
                        ? 'Generating...'
                        : currentRecommendations?.[index] ?? 'Not generated'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
    


      </section>

      

      <div>
        {error && <p role="alert">{error}</p>}
      </div>

      
    </>
  )
}

export default App
