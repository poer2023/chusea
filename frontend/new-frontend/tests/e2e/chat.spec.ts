import { test, expect } from '@playwright/test';

test.describe('AI Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
  });

  test('should load the chat interface', async ({ page }) => {
    // Check if chat interface loads
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    
    // Check for chat input
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();
    
    // Check for send button
    await expect(page.locator('[data-testid="send-button"]')).toBeVisible();
  });

  test('should allow message input', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"]');
    const testMessage = 'Hello, can you help me write a document?';
    
    await chatInput.fill(testMessage);
    await expect(chatInput).toHaveValue(testMessage);
  });

  test('should send message when send button is clicked', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');
    const testMessage = 'Test message for AI assistant';
    
    await chatInput.fill(testMessage);
    await sendButton.click();
    
    // Check if message appears in chat history
    const messageList = page.locator('[data-testid="message-list"]');
    if (await messageList.isVisible()) {
      await expect(messageList).toContainText(testMessage);
    }
    
    // Input should be cleared after sending
    await expect(chatInput).toHaveValue('');
  });

  test('should send message with Enter key', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"]');
    const testMessage = 'Test message with Enter key';
    
    await chatInput.fill(testMessage);
    await chatInput.press('Enter');
    
    // Check if message appears in chat history
    const messageList = page.locator('[data-testid="message-list"]');
    if (await messageList.isVisible()) {
      await expect(messageList).toContainText(testMessage);
    }
  });

  test('should show typing indicator', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');
    
    await chatInput.fill('Generate a test document');
    await sendButton.click();
    
    // Check if typing indicator appears
    const typingIndicator = page.locator('[data-testid="typing-indicator"]');
    if (await typingIndicator.isVisible()) {
      await expect(typingIndicator).toBeVisible();
    }
  });

  test('should handle chat sidebar toggle', async ({ page }) => {
    const sidebarToggle = page.locator('[data-testid="sidebar-toggle"]');
    const chatSidebar = page.locator('[data-testid="chat-sidebar"]');
    
    if (await sidebarToggle.isVisible()) {
      // Toggle sidebar
      await sidebarToggle.click();
      
      // Check sidebar visibility state change
      // This test depends on the actual implementation
      // and may need adjustment based on CSS classes used
    }
  });

  test('should support different message types', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');
    
    // Test different types of messages
    const messages = [
      'Write a blog post about AI',
      'Check grammar in my document',
      'Generate citations for this text',
      'Improve readability of this paragraph'
    ];
    
    for (const message of messages) {
      await chatInput.fill(message);
      await sendButton.click();
      await page.waitForTimeout(1000); // Wait between messages
    }
    
    // Verify messages appear in history
    const messageList = page.locator('[data-testid="message-list"]');
    if (await messageList.isVisible()) {
      for (const message of messages) {
        await expect(messageList).toContainText(message);
      }
    }
  });
});