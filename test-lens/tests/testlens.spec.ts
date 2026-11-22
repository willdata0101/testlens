// TestLens testing suite
import { test, expect } from '@playwright/test';
const mockReport = {
  suites: [
    {
      specs: [
        {
          title: "Sample passing test",
          tests: [
            {
              projectName: "chromium",
              results: [{ status: "passed" }]
            }
          ]
        },
        {
          title: "Sample failing test",
          tests: [
            {
              projectName: "firefox",
              results: [{ status: "failed" }]
            }
          ]
        },
        {
          title: "Sample timeout test",
          tests: [
            {
              projectName: "firefox",
              results: [{ status: "timedOut" }]
            }
          ]
        },
        {
          title: "Sample timeout test",
          tests: [
            {
              projectName: "firefox",
              results: [{ status: "timedOut" }]
            }
          ]
        }
      ]
    }
  ]
};

const updatedReport = {
  suites: [
    {
      specs: [
        ...mockReport.suites[0].specs,
        {
          title: "New passing test",
          tests: [{
            projectName: "chromium",
            results: [{ status: "passed" }]
          }]
        },
        {
          title: "Another failing test",
          tests: [{
            projectName: "webkit",
            results: [{ status: "failed" }]
          }]
        }
      ]
    }
  ]
};


// TC-001: Verify dashboard loads successfully
test('Dashboard loads successfully', async ({ page }) => {
    await page.goto('http://localhost:5173/')

    const heading = page.getByRole("heading", { name: "TestLens Dashboard"})

    await expect(heading).toBeVisible()
})

// TC-002: Verify dashboard metrics
test('Metrics correctly calculated from Playwright report', async ({page}) => {
    await page.route('**/results.json', async route => {
        await route.fulfill({ json: mockReport});
    });

    await page.goto('http://localhost:5173/');

    const totalCard = page.locator('.metrics-card')
        .filter({ hasText: "Total Executions" })
    
    const passedCard = page.locator('.metrics-card')
        .filter({ hasText: "Passed Count" })

    const failedCard = page.locator('.metrics-card')
        .filter({ hasText: "Failed Count" })

    const passRateCard = page.locator('.metrics-card')
        .filter({ hasText: "Pass Rate" })

    await expect(totalCard).toContainText("4")
    await expect(passedCard).toContainText("1")
    await expect(failedCard).toContainText("3")
    await expect(passRateCard).toContainText("25.00%")

})

// TC-003: Verify each test appears with correct name, browser, and status
test('Each test appears with correct name, browser, and status', async ({ page }) => {
    await page.route('**/results.json', async route => {
        await route.fulfill({ json: mockReport});
    });

    await page.goto('http://localhost:5173/')

    const featureColumn = page.locator("th")
        .filter({ hasText: "Feature tested"})

    const browserColumn = page.locator("th")
        .filter({ hasText: "Browser"})

    const statusColumn = page.locator("th")
        .filter({ hasText: "Status"})

    const specs = mockReport.suites[0].specs

    await expect(featureColumn).toBeVisible()
    await expect(browserColumn).toBeVisible()
    await expect(statusColumn).toBeVisible()

    const rows = page.locator("tbody tr")

    await expect(rows).toHaveCount(specs.length)

    for (const [index, spec] of specs.entries()) {
        await expect(rows.nth(index).locator("td").nth(0)).toHaveText(spec.title)
        await expect(rows.nth(index).locator("td").nth(1)).toHaveText(spec.tests[0].projectName)
        await expect(rows.nth(index).locator("td").nth(2)).toHaveText(spec.tests[0].results[0].status)
    }

})

// TC-004: Missing, malformed or unavailable JSON handled gracefully
test('Displays error when report not available', async ({ page }) => {
    await page.route('**/results.json', async route => {
        await route.fulfill({
            status: 503,
            body: "Service unavailable"
        });
    });

    await page.goto('http://localhost:5173/')

    const errorMessage = page.getByRole("alert")

    await expect(errorMessage).toBeVisible()
    

});

// TC-005: Dashboard reflects updated data live
test ('Dashboard reflects updated data', async ({ page }) => {
    let useUpdatedReport = false;

    await page.route('**/results.json', async route => {

        await route.fulfill({
            json: useUpdatedReport ? updatedReport : mockReport
        })
    });

    const totalCard = page.locator('.metrics-card')
        .filter({ hasText: "Total Executions" });

    await page.goto('http://localhost:5173/')

    await expect(totalCard).toContainText("4");

    useUpdatedReport = true;

    await expect(totalCard).toContainText("6", { timeout: 15000 });

});

// TC-006: Dashboard updates report file on new test run
// test('Dashboard updates report file on new test run', async ({ page }) => {
    
// })