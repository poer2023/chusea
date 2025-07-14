import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads successfully
    await expect(page).toHaveTitle(/AI Writing Tool/);
    
    // Check for main navigation elements
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should have responsive layout', async ({ page }) => {
    await page.goto('/');
    
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('[data-testid="app-shell"]')).toBeVisible();
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="app-shell"]')).toBeVisible();
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="app-shell"]')).toBeVisible();
  });

  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation to chat page
    const chatLink = page.locator('a[href="/chat"]');
    if (await chatLink.isVisible()) {
      await chatLink.click();
      await expect(page).toHaveURL(/.*chat/);
    }
    
    // Test navigation to demo page
    await page.goto('/');
    const demoLink = page.locator('a[href="/demo"]');
    if (await demoLink.isVisible()) {
      await demoLink.click();
      await expect(page).toHaveURL(/.*demo/);
    }
  });
});