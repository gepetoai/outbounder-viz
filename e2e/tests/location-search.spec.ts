import { test, expect } from '@playwright/test';
import { mockSearchAPIs } from '../helpers/api-mocks';
import { selectJobPosting, setupSearchPage } from '../helpers/test-helpers';

// Note: Authentication is handled by the 'setup' project in playwright.config.ts
// All tests will run with authenticated state from e2e/auth.setup.ts

test.describe('Location Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Set up API mocks
    await mockSearchAPIs(page);

    // Navigate to search page
    await setupSearchPage(page);
  });


  test('should add and remove multiple locations (cities and countries)', async ({ page }) => {
    // Step 1: Select job posting
    await selectJobPosting(page);

    // Step 2: Add job title
    const jobTitleInput = page.locator('input[data-testid="job-title-input"]');
    await jobTitleInput.fill('Software Engineer');
    await jobTitleInput.locator('..').locator('button:has-text("Add")').click();

    // Verify job title was added
    await expect(page.locator('text=Software Engineer').first()).toBeVisible();

    // Step 3: Navigate to location section and verify location UI is present
    await page.locator('h3:has-text("Location")').scrollIntoViewIfNeeded();
    await expect(page.locator('button:has-text("City/State (US)")')).toBeVisible();
    await expect(page.locator('button:has-text("Country (Non-US)")')).toBeVisible();

    // Step 4: Add multiple US cities using SearchableSelect
    await page.locator('button:has-text("City/State (US)")').click();

    // Wait for state input to appear
    const stateInput = page.locator('input[placeholder="Select state..."]');
    await stateInput.waitFor({ state: 'visible', timeout: 5000 });

    // Select New York state
    await stateInput.click();
    await stateInput.fill('New York');
    // Wait for dropdown to appear and click on the option
    await page.waitForTimeout(300);
    await page.locator('div.absolute.top-full').locator('div.px-3.py-2', { hasText: 'New York' }).first().click();

    // Wait for city dropdown to become enabled and select New York city
    await page.waitForTimeout(1000); // Wait for cities to load from API
    const cityInput = page.locator('input[placeholder="Select city..."]');
    await cityInput.click();
    await cityInput.fill('New York');
    // Wait for dropdown and click on the city option
    await page.waitForTimeout(300);
    await page.locator('div.absolute.top-full').locator('div.px-3.py-2', { hasText: 'New York' }).first().click();

    // Add the first location
    await page.locator('button:has-text("Add")').first().click();

    // Verify first city was added
    await expect(page.locator('text=New York, NY')).toBeVisible();

    // Add second city (San Francisco, CA)
    await stateInput.click();
    await stateInput.fill('California');
    await page.waitForTimeout(300);
    await page.locator('div.absolute.top-full').locator('div.px-3.py-2', { hasText: 'California' }).first().click();

    await page.waitForTimeout(1000); // Wait for cities to load
    await cityInput.click();
    await cityInput.fill('San Francisco');
    await page.waitForTimeout(300);
    await page.locator('div.absolute.top-full').locator('div.px-3.py-2', { hasText: 'San Francisco' }).first().click();

    await page.locator('button:has-text("Add")').first().click();

    // Verify second city was added
    await expect(page.locator('text=San Francisco, CA')).toBeVisible();

    // Step 5: Add multiple countries
    await page.locator('button:has-text("Country (Non-US)")').click();

    // Wait for country input to appear
    const countryInput = page.locator('input[placeholder="Select country..."]');
    await countryInput.waitFor({ state: 'visible', timeout: 5000 });

    // Select Canada
    await countryInput.click();
    await countryInput.fill('Canada');
    await page.waitForTimeout(300);
    await page.locator('div.absolute.top-full').locator('div.px-3.py-2', { hasText: 'Canada' }).first().click();
    await page.locator('button:has-text("Add")').first().click();

    // Verify Canada was added
    await expect(page.locator('text=Canada')).toBeVisible();

    // Select Germany
    await countryInput.click();
    await countryInput.fill('Germany');
    await page.waitForTimeout(300);
    await page.locator('div.absolute.top-full').locator('div.px-3.py-2', { hasText: 'Germany' }).first().click();
    await page.locator('button:has-text("Add")').first().click();

    // Verify Germany was added
    await expect(page.locator('text=Germany')).toBeVisible();

    // Step 6: Remove some locations
    // Find the card containing the text and click its remove button
    await page.locator('div').filter({ hasText: /^New York, NY - 25 mile radius$/ }).getByRole('button', { name: 'Remove location' }).click();
    await page.locator('div').filter({ hasText: /^Canada$/ }).getByRole('button', { name: 'Remove location' }).click();

    // Verify locations were removed
    await expect(page.locator('text=New York, NY')).not.toBeVisible();
    await expect(page.locator('text=Canada')).not.toBeVisible();

    // Verify remaining locations are still visible
    await expect(page.locator('text=San Francisco, CA')).toBeVisible();
    await expect(page.locator('text=Germany')).toBeVisible();
  });

});
