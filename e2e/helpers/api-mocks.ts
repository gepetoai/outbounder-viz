import { Page } from '@playwright/test';

/**
 * Mock API responses for search operations
 * Note: We match by URL pattern instead of exact URL to work across different environments
 */
export async function mockSearchAPIs(page: Page) {
  // Mock: Get job postings
  await page.route(url => url.pathname.includes('/api/v1/job-description/'), async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            title: 'Senior Software Engineer',
            url: 'https://example.com/jobs/senior-software-engineer',
            raw_text: 'We are looking for a Senior Software Engineer...',
            target_candidates_count: 50,
            fk_organization_id: 1,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: 'Product Manager',
            url: 'https://example.com/jobs/product-manager',
            raw_text: 'We are seeking a Product Manager...',
            target_candidates_count: 30,
            fk_organization_id: 1,
            created_at: new Date().toISOString()
          }
        ])
      });
    } else if (route.request().method() === 'POST') {
      // Mock: Create job posting
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 999,
          title: body.title,
          url: body.url,
          raw_text: body.raw_text || '',
          target_candidates_count: body.target_candidates_count || 500,
          fk_organization_id: body.fk_organization_id || 1,
          created_at: new Date().toISOString()
        })
      });
    } else {
      await route.continue();
    }
  });
  // Mock: Create search
  await page.route(url => url.pathname.includes('/api/v1/job-description-searches/form-builder/create'), async (route) => {
    const request = route.request();
    const body = request.postDataJSON();

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        total_results: 1247,
        total_results_from_search: 1247,
        search_id: 123,
        query_json: body
      })
    });
  });

  // Mock: Update search
  await page.route(url => url.pathname.includes('/api/v1/job-description-searches/form-builder/update'), async (route) => {
    const request = route.request();
    const body = request.postDataJSON();

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        total_results: 1500,
        total_results_from_search: 1500,
        search_id: 123,
        query_json: body
      })
    });
  });

  // Mock: Update search name
  await page.route(url => /\/api\/v1\/job-description-searches\/.*\/name/.test(url.pathname), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true })
    });
  });

  // Mock: Enrich candidates
  await page.route(url => /\/api\/v1\/candidate-generation\/job-description-searches\/.*\/limit\/.*/.test(url.pathname), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        candidates: [
          {
            id: 1,
            first_name: 'John',
            last_name: 'Doe',
            linkedin_shorthand_slug: 'johndoe',
            linkedin_canonical_slug: 'john-doe-12345',
            company_name: 'Tech Corp',
            city: 'San Francisco',
            state: 'CA',
            job_title: 'Software Engineer',
            raw_data: {
              picture_url: 'https://example.com/avatar.jpg',
              websites_linkedin: 'https://linkedin.com/in/johndoe',
              headline: 'Senior Software Engineer at Tech Corp',
              skills: ['JavaScript', 'React', 'Node.js']
            },
            fk_job_description_search_id: 123,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            first_name: 'Jane',
            last_name: 'Smith',
            linkedin_shorthand_slug: 'janesmith',
            linkedin_canonical_slug: 'jane-smith-67890',
            company_name: 'Innovation Inc',
            city: 'Austin',
            state: 'TX',
            job_title: 'Backend Engineer',
            raw_data: {
              picture_url: 'https://example.com/avatar2.jpg',
              websites_linkedin: 'https://linkedin.com/in/janesmith',
              headline: 'Backend Engineer at Innovation Inc',
              skills: ['Python', 'Django', 'PostgreSQL']
            },
            fk_job_description_search_id: 123,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ],
        excluded_count: 5
      })
    });
  });
}

/**
 * Remove all API mocks
 */
export async function removeMocks(page: Page) {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
}
