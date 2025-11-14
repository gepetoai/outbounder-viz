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
    const recruiterButton = page.locator('[data-testid="recruiter-nav-button"]');
    const isRecruiterVisible = await recruiterButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (isRecruiterVisible) {
      console.log('Clicking Recruiter icon (4th button)');
      await recruiterButton.click();
      await page.waitForLoadState('domcontentloaded');
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
    
    // Step 4: Add multiple US cities
    await page.locator('button:has-text("City/State (US)")').click();
    const cityInput = page.locator('input[placeholder="Enter city or state..."]');
    await cityInput.fill('New York, NY');
    await page.locator('button:has-text("Add")').click();
    await cityInput.fill('San Francisco, CA');
    await page.locator('button:has-text("Add")').click();
    
    // Verify cities were added
    await expect(page.locator('text=New York, NY')).toBeVisible();
    await expect(page.locator('text=San Francisco, CA')).toBeVisible();
    
    // Step 5: Add multiple countries
    await page.locator('button:has-text("Country (Non-US)")').click();
    const countryInput = page.locator('input[placeholder="Enter country..."]');
    await countryInput.fill('Canada');
    await page.locator('button:has-text("Add")').click();
    await countryInput.fill('Germany');
    await page.locator('button:has-text("Add")').click();
    
    // Verify countries were added
    await expect(page.locator('text=Canada')).toBeVisible();
    await expect(page.locator('text=Germany')).toBeVisible();
    
    // Step 6: Remove some locations
    await page.locator('text=New York, NY').locator('xpath=..').locator('button[aria-label="Remove"]').click();
    await page.locator('text=Canada').locator('xpath=..').locator('button[aria-label="Remove"]').click();
    
    // Verify locations were removed
    await expect(page.locator('text=New York, NY')).not.toBeVisible();
    await expect(page.locator('text=Canada')).not.toBeVisible();
    
    // Verify remaining locations are still visible
    await expect(page.locator('text=San Francisco, CA')).toBeVisible();
    await expect(page.locator('text=Germany')).toBeVisible();
  });

});
