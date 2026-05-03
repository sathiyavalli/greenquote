import { test, expect } from '@playwright/test';

test('sign-in to quote creation to results view flow', async ({ page, request }) => {
  const unique = Date.now();
  const email = `e2e.user.${unique}@example.com`;
  const password = 'TestPass123';

  // Create a fresh user directly through API for deterministic sign-in.
  const registerResponse = await request.post('/api/auth/register', {
    data: {
      fullName: 'E2E User',
      email,
      password,
    },
  });
  expect(registerResponse.ok()).toBeTruthy();

  // Sign in through UI.
  await page.goto('/login');
  
  // Check for any error messages initially
  const initialErrors = await page.locator('[role="alert"]').all();
  if (initialErrors.length > 0) {
    const errorText = await initialErrors[0].textContent();
    console.log('Login page initial errors:', errorText);
  }
  
  await page.getByPlaceholder('jane@example.com').fill(email);
  await page.getByPlaceholder('Your password').fill(password);
  
  // Click sign in and wait for token to be stored in localStorage
  const signInPromise = page.waitForFunction(
    () => localStorage.getItem('auth-token') !== null,
    { timeout: 10000 }
  );
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  try {
    await signInPromise;
  } catch (err) {
    // Check for error message on page if token wasn't stored
    const errors = await page.locator('[role="alert"]').all();
    let errorText = 'No error message found';
    if (errors.length > 0) {
      errorText = await errors[0].textContent() || 'Empty error message';
    }
    console.log('Sign in failed. Error on page:', errorText);
    throw new Error(`Login failed: ${errorText}`);
  }
  
  // Now wait for navigation to quotes page
  await page.waitForURL(/\/quotes(\/create)?$/, { timeout: 15000 });
  await expect(page.getByRole('heading', { name: 'My Solar Quotes' })).toBeVisible();

  // Start quote request flow.
  await page.getByRole('button', { name: 'Request New Quote' }).click();
  await page.waitForURL('**/quotes/create');

  await page.getByPlaceholder('John Doe').fill('E2E User');
  await page.getByPlaceholder('123 Main St, San Francisco, CA').fill('123 Test Street, Berlin');
  await page.getByPlaceholder('1200').fill('450');
  await page.getByPlaceholder('5.5').fill('5');
  await page.locator('input[placeholder="0"]').first().fill('1000');

  await page.getByRole('button', { name: 'Get Your Quote' }).click();

  // Verify quote results page.
  await page.waitForURL(/\/quotes\/[A-Za-z0-9_-]+$/);
  await expect(page.getByText('Loading quote...')).toBeHidden({ timeout: 15000 });
  await expect(page.getByRole('heading', { name: 'Your Solar Quote' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Your Financing Options')).toBeVisible();
});
