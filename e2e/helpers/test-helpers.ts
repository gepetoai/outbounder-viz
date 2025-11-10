import { Page, expect } from '@playwright/test';

/**
 * Create or select a job posting for testing
 * This function handles the case where no job postings exist yet
 */
export async function selectJobPosting(page: Page) {
  console.log('[Helper] Selecting/creating job posting...');

  // Find the job posting combobox - it may have different text states
  const jobPostingCombobox = page.getByRole('combobox')
    .filter({ hasText: /Select job posting|Senior Software Engineer|Product Manager/ })
    .first();

  // Check if a job posting is already selected
  const currentText = await jobPostingCombobox.textContent();
  console.log('[Helper] Current combobox text:', currentText);

  if (currentText && !currentText.includes('Select job posting')) {
    console.log('[Helper] Job posting already selected, skipping selection');
    return;
  }

  // Click to open the combobox
  await jobPostingCombobox.click();
  console.log('[Helper] Clicked job posting combobox');

  // Wait for either the dropdown or dialog to appear
  await page.waitForTimeout(1000);

  // Check if the create dialog opened (means no job postings available)
  const createDialogHeading = page.getByRole('heading', { name: 'Create Job Posting' });
  const isCreateDialogOpen = await createDialogHeading.isVisible().catch(() => false);

  if (isCreateDialogOpen) {
    console.log('[Helper] No job postings found, creating one via dialog...');

    // Fill in the create job posting form
    await page.getByLabel('Job Title').fill('Test Software Engineer Position');
    await page.getByLabel('Application URL').fill('https://example.com/jobs/test-engineer');
    // Target candidates field should have a default value, we'll leave it

    // Wait for the create button to be enabled (it's disabled until URL is filled)
    const createButton = page.getByRole('button', { name: 'Create Job Posting' });
    await expect(createButton).toBeEnabled({ timeout: 3000 });

    // Click the create button
    await createButton.click();
    console.log('[Helper] Clicked Create Job Posting button');

    // Wait for the dialog to close and job posting to be created
    await expect(createDialogHeading).not.toBeVisible({ timeout: 5000 });

    console.log('[Helper] Job posting created successfully');
  } else {
    console.log('[Helper] Looking for dropdown options...');

    // Check if dropdown options are visible
    const options = page.getByRole('option');
    const optionCount = await options.count();
    console.log('[Helper] Found', optionCount, 'options in dropdown');

    if (optionCount === 0) {
      console.warn('[Helper] No options found in dropdown, this may indicate an issue');
      await page.screenshot({ path: 'test-results/no-job-posting-options.png', fullPage: true });
      throw new Error('No job posting options found in dropdown');
    }

    // Find an actual job posting option (skip "Create Job Posting", "Clear selection", etc.)
    let selectedOption = null;
    let selectedText = '';

    for (let i = 0; i < optionCount; i++) {
      const option = options.nth(i);
      const optionText = await option.textContent();

      console.log(`[Helper] Examining option ${i}: "${optionText}"`);

      // Skip non-job-posting options
      if (optionText?.includes('Create Job Posting')) {
        console.log('[Helper] Skipping "Create Job Posting" option');
        continue;
      }
      if (optionText?.includes('Clear selection')) {
        console.log('[Helper] Skipping "Clear selection" option');
        continue;
      }
      if (optionText?.includes('No job postings available')) {
        console.log('[Helper] Skipping "No job postings available" option');
        continue;
      }

      // This must be an actual job posting
      selectedOption = option;
      selectedText = optionText || '';
      console.log(`[Helper] Found actual job posting option: "${selectedText}"`);
      break;
    }

    if (!selectedOption) {
      console.error('[Helper] No actual job posting found in dropdown!');
      await page.screenshot({ path: 'test-results/no-actual-job-posting.png', fullPage: true });
      throw new Error('No actual job posting option found in dropdown (only found Create/Clear options)');
    }

    // Wait for the selected option to be visible
    await expect(selectedOption).toBeVisible({ timeout: 5000 });

    // Click the job posting option
    console.log(`[Helper] Clicking job posting: "${selectedText}"`);
    await selectedOption.click();
    console.log('[Helper] Clicked job posting option');

    // Wait for the dropdown to close
    await page.waitForTimeout(1500);

    // Re-query the combobox to get fresh reference (old one might be stale)
    const freshCombobox = page.getByRole('combobox')
      .filter({ hasText: /Select job posting|Senior Software Engineer|Product Manager|All Candidates/ })
      .first();

    // Verify the selection took effect
    const updatedText = await freshCombobox.textContent({ timeout: 10000 }).catch(() => 'Unknown');
    console.log('[Helper] Updated combobox text:', updatedText);

    if (updatedText?.includes('Select job posting')) {
      console.error('[Helper] Selection did not register - combobox still shows placeholder!');
      await page.screenshot({ path: 'test-results/job-posting-not-selected.png', fullPage: true });

      // Try alternative approach: Use keyboard navigation
      console.log('[Helper] Retrying with keyboard navigation...');
      await freshCombobox.click();
      await page.waitForTimeout(500);

      // Press down arrow multiple times to skip "Create Job Posting" and "Clear selection"
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1500);

      // Re-query again after keyboard selection
      const finalCombobox = page.getByRole('combobox')
        .filter({ hasText: /Select job posting|Senior Software Engineer|Product Manager|All Candidates/ })
        .first();
      const finalText = await finalCombobox.textContent({ timeout: 10000 }).catch(() => 'Unknown');
      console.log('[Helper] Final combobox text after keyboard selection:', finalText);
    } else {
      console.log('[Helper] Job posting selected successfully');
    }
  }

  // Wait a moment for the selection to fully register and propagate
  await page.waitForTimeout(1000);
}
