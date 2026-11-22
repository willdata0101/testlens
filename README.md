### TestLens

An AI-assisted software testing dashboard built with Playwright, TypeScript, React, and the Anthropic Claude API.

TestLens transforms automated test results into an interactive dashboard, combining execution metrics with AI-generated recommendations to help investigate failures and improve test coverage.

#### Features

* Cross-browser testing: Execute automated tests using Playwright across Chromium, Firefox, and WebKit.
* Test execution dashboard: View total executions, passed and failed tests, and overall pass rate.
* Detailed results: Inspect test cases, browser environments, and execution statuses.
* AI-powered recommendations: Generate individual test analysis and improvement suggestions using Claude.
* JSON report integration: Parse Playwright test results and display them in React.
* CI/CD integration: Run automated tests through GitHub Actions.

#### Tech Stack

Category	Technologies
Test automation	Playwright, TypeScript
Frontend	React, Vite, CSS
Backend	Node.js, TypeScript
AI integration	Anthropic Claude API
CI/CD	GitHub Actions
Reporting	Playwright JSON Reporter

#### How It Works

1. Playwright executes automated browser tests.
2. Test results are exported to JSON.
3. The React dashboard processes the report and calculates execution metrics.
4. A Node.js backend connects to the Claude API.
5. Users can request AI-generated recommendations for individual test results.

#### Running Locally

1. Clone this repo into an appropriate location on your machine (PC or Mac).
   
3. Install dependencies and configure an Anthropic API key in a local `.env` file containing: `ANTHROPIC_API_KEY=` followed by your API key, without quotation marks or any other formatting around it.

   Use the following commands for installation:

   `npm install`
   
   `npm --prefix test-lens install`
   
5. Open a new terminal and `cd` into the cloned repo directory. Then, start the API server:

   `npm run api`

6. Open another new terminal, then start the React dashboard:

   `npm --prefix test-lens run dev`

Security: Keep API keys in environment variables. Never commit .env files or credentials to GitHub.

#### Project Goals

TestLens was developed as a hands-on QA engineering portfolio project to explore test automation, report processing, frontend development, CI/CD, and practical AI integration.

The project demonstrates how automated test results can become actionable information rather than static reports.

#### Author

William Daugherty
QA Engineer | Test Automation | Playwright | TypeScript | Python
