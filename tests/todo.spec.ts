import { test, expect} from '@playwright/test';

// test('todo appears in list', async ({ page }) => {
//     await page.goto('https://demo.playwright.dev/todomvc/#/');

//     const locator = page.getByPlaceholder('What needs to be done?')
//     await locator.fill("Learn Playwright")
//     await locator.press("Enter")

//     await expect(page.getByTestId('todo-title')).toHaveText("Learn Playwright")
// })

// test('no new todo created if field left empty', async ({ page }) => {
//     await page.goto('https://demo.playwright.dev/todomvc/#/');
//     const locator = page.getByPlaceholder('What needs to be done?')
//     await locator.focus()
//     await locator.press("Enter")

//     await expect(page.getByTestId('todo-title')).toHaveCount(0)
// })

// test('no new todo created if whitespace-only input', async ({ page }) => {
//     await page.goto('https://demo.playwright.dev/todomvc/#/');
//     const locator = page.getByPlaceholder('What needs to be done?')
//     await locator.fill("   ")
//     await locator.press("Enter")

//     await expect(page.getByTestId('todo-title')).toHaveCount(0)
// })

// test('leading/trailing whitespace trimmed in todo', async ({ page }) => {
//     await page.goto('https://demo.playwright.dev/todomvc/#/');

//     const locator = page.getByPlaceholder('What needs to be done?')
//     await locator.fill("   Learn Playwright   ")
//     await locator.press("Enter")

//     await expect(page.getByTestId('todo-title')).toHaveText("Learn Playwright")
// })

// test('checking todo marks it as completed', async ({ page }) => {
//     await page.goto('https://demo.playwright.dev/todomvc/#/');

//     const locator = page.getByPlaceholder('What needs to be done?');
//     await locator.fill("Finish Playwright Project");
//     await locator.press("Enter");

//     const todo = page.getByTestId("todo-item").filter({ hasText: "Finish Playwright Project"});
//     const checkbox = todo.getByLabel("Toggle Todo");
    
//     await checkbox.check()
//     await expect(checkbox).toBeChecked();
//     await expect(todo).toHaveClass(/completed/)
//     await expect(todo).toBeVisible()

// })

test('verify completed filter displays only completed todos', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/#/');

    const locator = page.getByPlaceholder('What needs to be done?')
    await locator.fill("Finish Playwright Project")
    await locator.press("Enter")
    await locator.fill("Write README")
    await locator.press("Enter")
    
    const todo1 = page.getByTestId("todo-item").filter({ hasText: "Finish Playwright Project" })
    const todo2 = page.getByTestId("todo-item").filter({ hasText: "Write README" })
    const checkbox1 = todo1.getByLabel('Toggle Todo')
    const checkbox2 = todo2.getByLabel('Toggle Todo')
    await checkbox1.check()
    await expect(checkbox1).toBeChecked()
    await expect(checkbox2).not.toBeChecked()

    const completedFilter = page.getByRole('link', { name: 'Completed' })
    await completedFilter.click()

    await expect(todo1).toHaveClass(/completed/)
    await expect(todo1).toBeVisible()
    await expect(todo2).toBeHidden()
    await expect(todo2).toHaveCount(0)

    await expect(page.getByTestId('todo-title')).toHaveCount(1)

})