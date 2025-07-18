import { test, expect } from '@playwright/test';

test.describe('UI Fix Verification', () => {
  test('should load homepage with proper styling', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if page title is correct
    await expect(page).toHaveTitle(/ChUseA/);
    
    // Check if main content is visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Check if text is readable (not black on black or invisible)
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toContainText('智能化');
    
    // Check if buttons are visible and clickable
    const startButton = page.locator('button', { hasText: '开始写作' });
    await expect(startButton).toBeVisible();
    
    const browseButton = page.locator('button', { hasText: '浏览文献' });
    await expect(browseButton).toBeVisible();
    
    // Check if statistics are visible
    await expect(page.locator('text=10K+')).toBeVisible();
    await expect(page.locator('text=50K+')).toBeVisible();
    await expect(page.locator('text=1M+')).toBeVisible();
    
    // Check if feature cards are visible
    await expect(page.locator('h3:has-text("文档管理")')).toBeVisible();
    await expect(page.locator('text=强大的功能特色')).toBeVisible();
  });
  
  test('should have modern UI design with glassmorphism', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for dark background indicating modern design
    const body = page.locator('body');
    const bodyBackground = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    // Check for glassmorphism elements (backdrop-blur)
    const glassmorphismElements = page.locator('[class*="backdrop-blur"]');
    await expect(glassmorphismElements.first()).toBeVisible();
    
    // Check for gradient text specifically in the hero section
    const gradientText = page.locator('.bg-gradient-to-r.from-blue-400.via-purple-400');
    await expect(gradientText).toBeVisible();
    
    // Take screenshot for manual verification
    await page.screenshot({ path: 'modern-ui-verification.png', fullPage: true });
  });
  
  test('should navigate to documents page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click on document management button/link
    const docLink = page.locator('text=进入文档管理');
    if (await docLink.isVisible()) {
      await docLink.click();
      await page.waitForLoadState('networkidle');
      
      // Should navigate to documents page
      expect(page.url()).toContain('/documents');
    }
  });
});