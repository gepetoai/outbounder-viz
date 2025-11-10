import { test, expect } from '@playwright/test';
import { mockSearchAPIs } from '../helpers/api-mocks';
import { selectJobPosting } from '../helpers/test-helpers';

// Note: Authentication is handled by the 'setup' project in playwright.config.ts
// All tests will run with authenticated state from e2e/auth.setup.ts

test.describe('Search Query Management', () => {
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

    // Wait for search form to be visible (exact placeholder text)
    await page.waitForSelector('input[placeholder="Add job title (comma-separated for multiple)..."]', {
      timeout: 10000,
      state: 'visible'
    }).catch(() => {
      console.warn('Could not find search form input');
    });

    // Wait a bit more for the app to fully initialize
    await page.waitForTimeout(1000);
  });

  test('should run a search query successfully', async ({ page }) => {
    // Step 1: Select a job posting
    await selectJobPosting(page);

    // Step 2: Add a job title
    const jobTitleInput = page.locator('input[placeholder="Add job title (comma-separated for multiple)..."]');
    await jobTitleInput.fill('Software Engineer');
    await page.locator('button:has-text("Add")').first().click();

    // Verify job title badge appears
    await expect(page.locator('text=Software Engineer').first()).toBeVisible();

    // Step 3: Click "Search Candidates" button
    const searchButton = page.locator('button:has-text("Search Candidates")');
    await searchButton.click();

    // Step 4: Wait for search to complete
    // The button text changes to "Searching..." with a spinner during the search
    await expect(searchButton).toContainText('Searching...', { timeout: 2000 }).catch(() => {});

    // Wait for search to complete (button returns to normal state)
    await expect(searchButton).toContainText('Search Candidates', { timeout: 30000 });

    // Step 5: Verify results are displayed
    // Check for the candidate count number (it's in a span with class text-2xl font-bold)
    const yieldNumber = page.locator('span.text-2xl.font-bold').first();
    await expect(yieldNumber).toBeVisible({ timeout: 10000 });

    // Verify the candidate yield number is greater than 0
    const yieldText = await yieldNumber.textContent();
    const candidateCount = parseInt(yieldText?.replace(/,/g, '') || '0');
    expect(candidateCount).toBeGreaterThan(0);
  });

  test('should save a new search query', async ({ page }) => {
    // Step 1: Select a job posting
    await selectJobPosting(page);

    // Step 2: Fill in search parameters
    const jobTitleInput = page.locator('input[placeholder="Add job title (comma-separated for multiple)..."]');
    await jobTitleInput.fill('Product Manager');
    await page.locator('button:has-text("Add")').first().click();

    // Verify job title was added
    await expect(page.locator('text=Product Manager').first()).toBeVisible();

    // Step 3: Run the search first
    const searchButton = page.locator('button:has-text("Search Candidates")');
    await searchButton.click();

    // Wait for search to complete
    await expect(searchButton).toContainText('Search Candidates', { timeout: 30000 });

    // Verify results appeared - check for the number display
    const yieldNumber = page.locator('span.text-2xl.font-bold').first();
    await expect(yieldNumber).toBeVisible({ timeout: 10000 });

    // Step 3: Click "Save Search" dropdown button
    const saveSearchButton = page.locator('button:has-text("Save Search")');
    await saveSearchButton.click();

    // Step 4: Click "Save New" option in the dropdown
    await page.locator('button:has-text("Save New")').click();

    // Step 5: Fill in the search title in the modal
    const searchTitleInput = page.locator('input#new-search-title');
    const searchTitle = `Test Search ${Date.now()}`;
    await searchTitleInput.fill(searchTitle);

    // Step 6: Click "Create Search" button to save
    const createButton = page.locator('button:has-text("Create Search")');
    await createButton.click();

    // Step 7: Verify success toast appears
    await expect(page.locator('text=New search saved successfully!')).toBeVisible({ timeout: 5000 });

    // Step 8: Verify modal is closed
    await expect(page.locator('text=Save New Search')).not.toBeVisible();
  });

  test('should update an existing search query', async ({ page }) => {
    // This test creates a search first, then updates it

    // Step 1: Select a job posting
    await selectJobPosting(page);

    // Step 2: Create initial search
    const jobTitleInput = page.locator('input[placeholder="Add job title (comma-separated for multiple)..."]');
    await jobTitleInput.fill('Data Scientist');
    await page.locator('button:has-text("Add")').first().click();

    // Step 3: Run search
    let searchButton = page.locator('button:has-text("Search Candidates")');
    await searchButton.click();
    await expect(searchButton).toContainText('Search Candidates', { timeout: 30000 });

    // Save the search
    const saveSearchButton = page.locator('button:has-text("Save Search")');
    await saveSearchButton.click();
    await page.locator('button:has-text("Save New")').click();

    const searchTitle = `Update Test ${Date.now()}`;
    await page.locator('input#new-search-title').fill(searchTitle);
    await page.locator('button:has-text("Create Search")').click();
    await expect(page.locator('text=New search saved successfully!')).toBeVisible({ timeout: 5000 });

    // Step 2: Modify search parameters
    // Add another job title to modify the search
    await page.locator('input[placeholder="Add job title (comma-separated for multiple)..."]').fill('Machine Learning Engineer');
    await page.locator('button:has-text("Add")').first().click();

    // Verify new title was added
    await expect(page.locator('text=Machine Learning Engineer').first()).toBeVisible();

    // Step 3: Click "Save Search" and then "Update Existing"
    await saveSearchButton.click();
    const updateButton = page.locator('button:has-text("Update Existing")');
    await updateButton.click();

    // Step 4: Verify success toast appears
    await expect(page.locator('text=Search updated successfully!')).toBeVisible({ timeout: 5000 });

    // Step 5: Verify the search was updated by checking if both titles are still present
    await expect(page.locator('text=Data Scientist').first()).toBeVisible();
    await expect(page.locator('text=Machine Learning Engineer').first()).toBeVisible();
  });

  test('should handle search without job posting', async ({ page }) => {
    // This test verifies that the app shows a modal when no job posting is selected

    // Fill in search parameters
    const jobTitleInput = page.locator('input[placeholder="Add job title (comma-separated for multiple)..."]');
    await jobTitleInput.fill('Frontend Developer');
    await page.locator('button:has-text("Add")').first().click();

    // Try to search without selecting a job posting
    const searchButton = page.locator('button:has-text("Search Candidates")');
    await searchButton.click();

    // Verify that the job posting required modal appears
    // Look for the specific modal heading to avoid matching multiple elements
    await expect(page.getByRole('heading', { name: 'Job Posting Required' })).toBeVisible({ timeout: 5000 });
  });

  test('should enrich candidates after search', async ({ page }) => {
    // Step 1: Select a job posting
    await selectJobPosting(page);

    // Step 2: Add a job title
    const jobTitleInput = page.locator('input[placeholder="Add job title (comma-separated for multiple)..."]');
    await jobTitleInput.fill('Backend Engineer');
    await page.locator('button:has-text("Add")').first().click();

    // Step 3: Run search
    const searchButton = page.locator('button:has-text("Search Candidates")');
    await searchButton.click();
    await expect(searchButton).toContainText('Search Candidates', { timeout: 30000 });

    // Verify results appeared - check for the number display
    const yieldNumber = page.locator('span.text-2xl.font-bold').first();
    await expect(yieldNumber).toBeVisible({ timeout: 10000 });

    // Step 2: Set enrichment limit
    const limitInput = page.locator('input[placeholder="10"]').last();
    await limitInput.fill('5');

    // Step 3: Click "Enrich Candidates" button
    const enrichButton = page.locator('button:has-text("Enrich Candidates")');
    await enrichButton.click();

    // Step 4: Wait for enrichment to complete
    await expect(enrichButton).toContainText('Enriching...', { timeout: 2000 }).catch(() => {});
    await expect(enrichButton).toContainText('Enrich Candidates', { timeout: 60000 });

    // Step 5: Verify that candidate cards are displayed
    // The CandidateListItem components should be visible after enrichment
    // Check for candidate names from the mock data (John Doe, Jane Smith)
    await expect(page.locator('h4.font-semibold').first()).toBeVisible({ timeout: 10000 });

    // Verify that at least one candidate's company is visible
    await expect(page.locator('text=/Tech Corp|Innovation Inc/').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Search Parameter Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Set up API mocks
    await mockSearchAPIs(page);

    await page.goto('/');
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

    // Wait for search form to be visible (exact placeholder text)
    await page.waitForSelector('input[placeholder="Add job title (comma-separated for multiple)..."]', {
      timeout: 10000,
      state: 'visible'
    }).catch(() => {
      console.warn('Could not find search form input');
    });

    // Wait a bit more for the app to fully initialize
    await page.waitForTimeout(1000);
  });

  test('should add and remove job titles', async ({ page }) => {
    // Add a job title
    const jobTitleInput = page.locator('input[placeholder="Add job title (comma-separated for multiple)..."]');
    await jobTitleInput.fill('DevOps Engineer');
    await page.keyboard.press('Enter');

    // Verify it appears
    const badge = page.locator('[data-slot="badge"]').filter({ hasText: 'DevOps Engineer' });
    await expect(badge).toBeVisible();

    // Remove the job title by clicking the badge (entire badge is clickable)
    // The RemovableBadge component is clickable as a whole
    await badge.click();

    // Wait a moment for removal animation/state update
    await page.waitForTimeout(500);

    // Verify it's removed
    await expect(badge).not.toBeVisible();
  });

  test('should toggle TAM Only switch', async ({ page }) => {
    // Find the TAM Only switch
    const tamSwitch = page.locator('text=TAM Only').locator('..').locator('button');

    // Click to toggle
    await tamSwitch.click();

    // Verify it's checked (you may need to adjust this based on actual implementation)
    await expect(tamSwitch).toHaveAttribute('data-state', 'checked');

    // Click again to uncheck
    await tamSwitch.click();
    await expect(tamSwitch).toHaveAttribute('data-state', 'unchecked');
  });
});
