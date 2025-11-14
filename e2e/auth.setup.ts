import { clerk, clerkSetup, setupClerkTestingToken } from '@clerk/testing/playwright';
import { test as setup } from '@playwright/test';
import { mockSearchAPIs } from './helpers/api-mocks';

const authFile = 'playwright/.clerk/user.json';

// Configure setup tests to run in serial mode (one after another)
setup.describe.configure({ mode: 'serial' });

setup('global setup', async () => {
  // Initialize Clerk testing environment
  // This requires CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY environment variables
  await clerkSetup();
  console.log('Clerk testing environment initialized');
});

setup('authenticate', async ({ page }) => {
  console.log('Starting Clerk authentication...');

  // Setup Clerk testing token to bypass bot detection
  // This is CRITICAL for Vercel preview deployments
  await setupClerkTestingToken({ page });
  console.log('Clerk testing token configured');

  // Set up API mocks before navigation so React Query caches correct data
  await mockSearchAPIs(page);
  console.log('API mocks configured');

  // Navigate to the application
  await page.goto('/');

  // Give the page a moment to initialize
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  console.log('Page loaded, attempting Clerk sign in');

  // Use Clerk's signIn helper to authenticate programmatically
  // This bypasses the UI and directly sets up the authentication session
  const username = process.env.E2E_CLERK_USER_USERNAME;
  const password = process.env.E2E_CLERK_USER_PASSWORD;

  if (!username || !password) {
    throw new Error('Missing required environment variables: E2E_CLERK_USER_USERNAME and E2E_CLERK_USER_PASSWORD');
  }

  await clerk.signIn({
    page,
    signInParams: {
      strategy: 'password',
      identifier: username,
      password: password,
    },
  });

  console.log('Clerk signIn completed');

  // Wait for Clerk session to be established
  await page.waitForSelector('[data-clerk-loaded="true"]', { timeout: 5000 });
  
  // Verify user is authenticated
  await page.waitForFunction(() => {
    return window.Clerk?.user !== null;
  }, { timeout: 5000 });

  // Reload the page to ensure Clerk session is properly loaded
  await page.reload();

  // Wait for the page to fully load
  await page.waitForLoadState('networkidle');

  console.log('Current URL after auth:', page.url());

  // Verify we're not on the landing page anymore
  const onLandingPage = await page.locator('button:has-text("Sign In")').isVisible().catch(() => false);

  if (onLandingPage) {
    console.error('Still on landing page after authentication!');
    await page.screenshot({ path: 'test-results/auth-still-on-landing.png', fullPage: true });
    throw new Error('Authentication failed: still on landing page');
  }

  // Verify main app loaded (should see "248" branding)
  const hasMainApp = await page.locator('h1:has-text("248")').isVisible({ timeout: 5000 }).catch(() => false);
  if (!hasMainApp) {
    console.error('Main app header not found!');
    await page.screenshot({ path: 'test-results/auth-no-main-app.png', fullPage: true });
  }

  // Navigate to Recruiter section (first level navigation)
  // NOTE: The app defaults to "Outbounder", and these buttons are ICON-ONLY (no text!)
  console.log('Looking for Recruiter app icon...');

  const recruiterButton = page.getByTestId('recruiter-app-button');
  const isRecruiterButtonVisible = await recruiterButton.isVisible({ timeout: 5000 }).catch(() => false);

  if (isRecruiterButtonVisible) {
    console.log('Clicking Recruiter app icon...');
    await recruiterButton.click();
    
    // Wait for Recruiter header instead of arbitrary timeout
    const recruiterHeader = page.locator('h1:has-text("Recruiter")');
    const hasRecruiterHeader = await recruiterHeader.waitFor({ timeout: 3000 })
      .then(() => true)
      .catch(() => false);
      
    if (hasRecruiterHeader) {
      console.log('Recruiter sidebar opened successfully');
    } else {
      console.warn('Recruiter header not found after clicking button');
      await page.screenshot({ path: 'test-results/auth-no-recruiter-header.png', fullPage: true });
    }
  } else {
    console.error('Recruiter button not found!');
    await page.screenshot({ path: 'test-results/auth-no-recruiter-button.png', fullPage: true });
  }

  // Navigate to Search tab (second level navigation within Recruiter)
  // NOTE: Recruiter defaults to "Jobs" tab, we need to click "Search"
  console.log('Looking for Search tab...');

  const searchTab = page.locator('button:has-text("Search")').first();
  const isSearchVisible = await searchTab.isVisible({ timeout: 5000 }).catch(() => false);

  if (isSearchVisible) {
    console.log('Clicking Search tab...');
    await searchTab.click();
    await page.waitForTimeout(500);
  } else {
    console.warn('Search tab not found!');
    await page.screenshot({ path: 'test-results/auth-no-search-tab.png', fullPage: true });
  }

  // Wait for search form to be visible (use EXACT placeholder text)
  const jobTitleInput = page.locator('input[placeholder="Add job title (comma-separated for multiple)..."]');
  const hasSearchForm = await jobTitleInput.isVisible({ timeout: 5000 }).catch(() => false);

  if (!hasSearchForm) {
    console.error('Could not find search form input with correct placeholder!');
    await page.screenshot({ path: 'test-results/auth-no-search-form.png', fullPage: true });
  } else {
    console.log('Successfully navigated to Search interface - job title input found');
  }

  // Save the authenticated state to reuse in tests
  await page.context().storageState({ path: authFile });

  console.log('Authentication state saved to:', authFile);
});
