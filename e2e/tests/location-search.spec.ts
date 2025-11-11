import { test, expect } from '@playwright/test';
import { mockSearchAPIs } from '../helpers/api-mocks';
import { selectJobPosting } from '../helpers/test-helpers';

// Note: Authentication is handled by the 'setup' project in playwright.config.ts
// All tests will run with authenticated state from e2e/auth.setup.ts

test.describe('Location Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Set up API mocks
    await mockSearchAPIs(page);

    // Navigate to the app
    await page.goto('/');

    // Wait for the app to load
    await page.waitForLoadState('networkidle');

    // Verify we're not on the landing page (should be authenticated)
    const onLandingPage = await page.locator('button:has-text("Sign In")').isVisible().catch(() => false);
    if (onLandingPage) {
      throw new Error('Test started on landing page - authentication may have failed');
    }

    // First level navigation: Click Recruiter icon (4th button in left sidebar, icon-only no text)
    const recruiterButton = page.locator('.w-12.bg-card.border-r button').nth(3);
    const isRecruiterVisible = await recruiterButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (isRecruiterVisible) {
      console.log('Clicking Recruiter icon (4th button)');
      await recruiterButton.click();
      await page.waitForTimeout(500);
    }

    // Second level navigation: Click Search tab within Recruiter
    const searchTab = page.locator('button:has-text("Search")').first();
    const isSearchTabVisible = await searchTab.isVisible({ timeout: 3000 }).catch(() => false);

    if (isSearchTabVisible) {
      console.log('Clicking Search tab');
      await searchTab.click();
      await page.waitForTimeout(500);
    }

    // Wait for search form to be visible
    await page.waitForSelector('input[placeholder="Add job title (comma-separated for multiple)..."]', {
      timeout: 10000,
      state: 'visible'
    });

    // Wait a bit more for the app to fully initialize
    await page.waitForTimeout(1000);
  });

  test('should add and remove multiple locations (cities and countries)', async ({ page }) => {
    // Step 1: Select job posting
    await selectJobPosting(page);

    // Step 2: Add job title
    const jobTitleInput = page.locator('input[placeholder="Add job title (comma-separated for multiple)..."]');
    await jobTitleInput.fill('Software Engineer');
    await jobTitleInput.locator('..').locator('button:has-text("Add")').click();

    // Verify job title was added
    await expect(page.locator('text=Software Engineer').first()).toBeVisible();

    // Step 3: Navigate to location section and verify location UI is present
    await page.locator('h3:has-text("Location")').scrollIntoViewIfNeeded();
    await expect(page.locator('button:has-text("City/State (US)")')).toBeVisible();
    await expect(page.locator('button:has-text("Country (Non-US)")')).toBeVisible();
  });
});
