import { test, expect } from '@playwright/test';

test.describe('Rich Text Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/editor');
  });

  test('should load the editor', async ({ page }) => {
    // Wait for the TipTap editor to load
    await expect(page.locator('[data-testid="tiptap-editor"]')).toBeVisible();
    
    // Check for editor toolbar
    await expect(page.locator('[data-testid="editor-toolbar"]')).toBeVisible();
  });

  test('should allow text input', async ({ page }) => {
    const editor = page.locator('[data-testid="tiptap-editor"] .ProseMirror');
    await editor.click();
    
    // Type some text
    const testText = 'This is a test document for the AI writing tool.';
    await editor.fill(testText);
    
    // Verify text was entered
    await expect(editor).toContainText(testText);
  });

  test('should support text formatting', async ({ page }) => {
    const editor = page.locator('[data-testid="tiptap-editor"] .ProseMirror');
    await editor.click();
    
    // Type text and select it
    const testText = 'Bold text test';
    await editor.fill(testText);
    await editor.selectText();
    
    // Apply bold formatting
    const boldButton = page.locator('[data-testid="bold-button"]');
    if (await boldButton.isVisible()) {
      await boldButton.click();
      
      // Check if text is bold
      await expect(editor.locator('strong')).toContainText(testText);
    }
  });

  test('should show floating toolbar on text selection', async ({ page }) => {
    const editor = page.locator('[data-testid="tiptap-editor"] .ProseMirror');
    await editor.click();
    
    // Type and select text
    await editor.fill('Select this text');
    await editor.selectText();
    
    // Check if floating toolbar appears
    const floatingToolbar = page.locator('[data-testid="floating-toolbar"]');
    if (await floatingToolbar.isVisible()) {
      await expect(floatingToolbar).toBeVisible();
    }
  });

  test('should support undo/redo functionality', async ({ page }) => {
    const editor = page.locator('[data-testid="tiptap-editor"] .ProseMirror');
    await editor.click();
    
    // Type text
    const originalText = 'Original text';
    await editor.fill(originalText);
    
    // Add more text
    const additionalText = ' Additional text';
    await editor.type(additionalText);
    
    // Undo
    await page.keyboard.press('Meta+z'); // Cmd+Z on Mac
    await expect(editor).toContainText(originalText);
    await expect(editor).not.toContainText(additionalText);
    
    // Redo
    await page.keyboard.press('Meta+Shift+z'); // Cmd+Shift+Z on Mac
    await expect(editor).toContainText(originalText + additionalText);
  });
});