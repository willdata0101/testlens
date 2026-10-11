import { test, expect} from '@playwright/test';

test('todo appears in list', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/#/');

    const locator = page.getByPlaceholder('What needs to be done?')
    await locator.fill("Learn Playwright")
    await locator.press("Enter")

    await expect(page.getByTestId('todo-title')).toHaveText("Learn Playwright")
})