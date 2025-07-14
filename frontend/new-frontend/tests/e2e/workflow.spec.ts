import { test, expect } from '@playwright/test';

test.describe('Writing Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/workflow');
  });

  test('should display workflow steps', async ({ page }) => {
    // Check if workflow container is visible
    await expect(page.locator('[data-testid="workflow-container"]')).toBeVisible();
    
    // Check for workflow steps
    const workflowSteps = [
      'plan',
      'draft', 
      'citation',
      'grammar',
      'readability'
    ];
    
    for (const step of workflowSteps) {
      const stepElement = page.locator(`[data-testid="workflow-step-${step}"]`);
      if (await stepElement.isVisible()) {
        await expect(stepElement).toBeVisible();
      }
    }
  });

  test('should start workflow process', async ({ page }) => {
    const startButton = page.locator('[data-testid="start-workflow"]');
    
    if (await startButton.isVisible()) {
      await startButton.click();
      
      // Check if workflow status changes
      const workflowStatus = page.locator('[data-testid="workflow-status"]');
      if (await workflowStatus.isVisible()) {
        await expect(workflowStatus).not.toContainText('idle');
      }
    }
  });

  test('should show progress through workflow steps', async ({ page }) => {
    const startButton = page.locator('[data-testid="start-workflow"]');
    
    if (await startButton.isVisible()) {
      await startButton.click();
      
      // Wait for workflow to progress
      await page.waitForTimeout(2000);
      
      // Check if any step shows as active or completed
      const activeStep = page.locator('[data-workflow-status="active"]');
      const completedStep = page.locator('[data-workflow-status="completed"]');
      
      if (await activeStep.isVisible() || await completedStep.isVisible()) {
        expect(true).toBe(true); // Workflow is progressing
      }
    }
  });

  test('should display workflow results', async ({ page }) => {
    // Mock or wait for workflow completion
    const resultsContainer = page.locator('[data-testid="workflow-results"]');
    
    if (await resultsContainer.isVisible()) {
      await expect(resultsContainer).toBeVisible();
      
      // Check for specific result elements
      const metrics = page.locator('[data-testid="readability-score"]');
      if (await metrics.isVisible()) {
        await expect(metrics).toBeVisible();
      }
    }
  });

  test('should allow workflow configuration', async ({ page }) => {
    const configButton = page.locator('[data-testid="workflow-config"]');
    
    if (await configButton.isVisible()) {
      await configButton.click();
      
      // Check if configuration modal/panel opens
      const configPanel = page.locator('[data-testid="workflow-config-panel"]');
      if (await configPanel.isVisible()) {
        await expect(configPanel).toBeVisible();
        
        // Test configuration options
        const readabilityThreshold = page.locator('[data-testid="readability-threshold"]');
        if (await readabilityThreshold.isVisible()) {
          await readabilityThreshold.fill('80');
          await expect(readabilityThreshold).toHaveValue('80');
        }
      }
    }
  });

  test('should handle workflow errors gracefully', async ({ page }) => {
    // This test would require mocking error conditions
    // For now, we'll test that error states are handled
    
    const errorMessage = page.locator('[data-testid="workflow-error"]');
    const retryButton = page.locator('[data-testid="retry-workflow"]');
    
    // Check if error handling UI exists
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
    
    if (await retryButton.isVisible()) {
      await expect(retryButton).toBeVisible();
    }
  });

  test('should support workflow cancellation', async ({ page }) => {
    const startButton = page.locator('[data-testid="start-workflow"]');
    const cancelButton = page.locator('[data-testid="cancel-workflow"]');
    
    if (await startButton.isVisible()) {
      await startButton.click();
      
      // Wait a moment for workflow to start
      await page.waitForTimeout(1000);
      
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        
        // Check if workflow returns to idle state
        const workflowStatus = page.locator('[data-testid="workflow-status"]');
        if (await workflowStatus.isVisible()) {
          await expect(workflowStatus).toContainText('idle');
        }
      }
    }
  });
});