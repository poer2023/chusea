import { test, expect } from '@playwright/test';

/**
 * Playwright MCP 模拟人工测试
 * 完整测试 AI Writing Tool 的用户体验流程
 */
test.describe('AI Writing Tool - 完整用户体验测试', () => {
  const testPage = 'http://localhost:59209/test-page.html';

  test.beforeEach(async ({ page }) => {
    // 导航到测试页面
    await page.goto(testPage);
    await page.waitForLoadState('networkidle');
  });

  test('完整用户流程 - 从首页到完成写作任务', async ({ page }) => {
    // === 步骤1: 验证首页加载 ===
    await test.step('验证首页内容和布局', async () => {
      // 检查页面标题
      await expect(page.locator('h1')).toContainText('AI Writing Tool');
      await expect(page.locator('p').first()).toContainText('智能写作助手测试界面');

      // 检查导航栏
      await expect(page.locator('#tab-home')).toBeVisible();
      await expect(page.locator('#tab-editor')).toBeVisible();
      await expect(page.locator('#tab-chat')).toBeVisible();
      await expect(page.locator('#tab-workflow')).toBeVisible();

      // 检查核心功能列表
      await expect(page.locator('text=✅ 智能写作助手')).toBeVisible();
      await expect(page.locator('text=✅ 循环工作流引擎')).toBeVisible();
      await expect(page.locator('text=✅ 文献引用管理')).toBeVisible();
    });

    // === 步骤2: 测试首页交互 ===
    await test.step('测试开始写作按钮', async () => {
      await page.click('#start-writing');
      
      // 验证自动切换到编辑器
      await expect(page.locator('#editor-section')).toBeVisible();
      await expect(page.locator('#home-section')).toBeHidden();
      
      // 验证状态提示
      await expect(page.locator('#status-bar')).toBeVisible();
      await expect(page.locator('#status-message')).toContainText('已切换到编辑器模式');
    });

    // === 步骤3: 测试富文本编辑器 ===
    await test.step('测试富文本编辑器功能', async () => {
      const editorContent = page.locator('#editor-content');
      
      // 清除默认内容并输入测试文本
      await editorContent.click();
      await page.keyboard.press('Control+a');
      await editorContent.fill('这是一个关于人工智能发展的测试文档。人工智能技术正在快速发展。');
      
      // 测试文本选择和格式化
      await page.keyboard.press('Control+a');
      await page.click('#bold-btn');
      
      // 测试保存功能
      await page.click('#save-document');
      await expect(page.locator('#status-message')).toContainText('文档已保存');
      
      // 测试文本分析功能
      await page.click('#analyze-text');
      await expect(page.locator('#status-message')).toContainText('文本分析');
    });

    // === 步骤4: 测试AI聊天功能 ===
    await test.step('测试AI聊天交互', async () => {
      // 切换到聊天页面
      await page.click('#tab-chat');
      await expect(page.locator('#chat-section')).toBeVisible();
      
      // 测试发送消息
      const chatInput = page.locator('#chat-input');
      await chatInput.fill('请帮我优化这篇关于人工智能的文章');
      await page.click('#send-message');
      
      // 验证消息显示
      await expect(page.locator('#chat-messages')).toContainText('请帮我优化这篇关于人工智能的文章');
      
      // 等待AI回复并验证
      await page.waitForTimeout(1500);
      await expect(page.locator('#chat-messages')).toContainText('我理解您的需求');
      
      // 测试回车键发送
      await chatInput.fill('谢谢你的帮助');
      await page.keyboard.press('Enter');
      await expect(page.locator('#chat-messages')).toContainText('谢谢你的帮助');
    });

    // === 步骤5: 测试智能工作流 ===
    await test.step('测试智能工作流管理', async () => {
      // 切换到工作流页面
      await page.click('#tab-workflow');
      await expect(page.locator('#workflow-section')).toBeVisible();
      
      // 验证工作流步骤显示
      await expect(page.locator('#step-plan')).toBeVisible();
      await expect(page.locator('#step-draft')).toBeVisible();
      await expect(page.locator('#step-citation')).toBeVisible();
      await expect(page.locator('#step-grammar')).toBeVisible();
      await expect(page.locator('#step-readability')).toBeVisible();
      
      // 填写工作流配置
      await page.fill('#workflow-topic', '人工智能在医疗领域的应用研究');
      await page.selectOption('#writing-type', 'academic');
      await page.selectOption('#readability-target', '80');
      
      // 启动工作流
      await page.click('#start-workflow');
      
      // 验证工作流状态变化
      await expect(page.locator('#start-workflow')).toBeHidden();
      await expect(page.locator('#stop-workflow')).toBeVisible();
      
      // 等待工作流执行并验证步骤进度
      await page.waitForTimeout(3000);
      
      // 验证第一步已激活
      const planStep = page.locator('#step-plan .bg-blue-500');
      await expect(planStep).toBeVisible();
      
      // 等待工作流完成
      await page.waitForTimeout(8000);
      await expect(page.locator('#start-workflow')).toBeVisible();
      await expect(page.locator('#stop-workflow')).toBeHidden();
      
      // 验证完成状态
      await expect(page.locator('#status-message')).toContainText('工作流完成');
    });

    // === 步骤6: 测试工作流重置功能 ===
    await test.step('测试工作流重置', async () => {
      await page.click('#reset-workflow');
      
      // 验证所有步骤重置为灰色
      await expect(page.locator('#step-plan .bg-gray-300')).toBeVisible();
      await expect(page.locator('#step-draft .bg-gray-300')).toBeVisible();
      await expect(page.locator('#step-citation .bg-gray-300')).toBeVisible();
      await expect(page.locator('#step-grammar .bg-gray-300')).toBeVisible();
      await expect(page.locator('#step-readability .bg-gray-300')).toBeVisible();
      
      await expect(page.locator('#status-message')).toContainText('工作流已重置');
    });

    // === 步骤7: 测试导航切换 ===
    await test.step('测试页面导航功能', async () => {
      // 测试所有页签切换
      const tabs = ['home', 'editor', 'chat', 'workflow'];
      
      for (const tab of tabs) {
        await page.click(`#tab-${tab}`);
        await expect(page.locator(`#${tab}-section`)).toBeVisible();
        
        // 验证其他页面隐藏
        for (const otherTab of tabs) {
          if (otherTab !== tab) {
            await expect(page.locator(`#${otherTab}-section`)).toBeHidden();
          }
        }
        
        // 验证当前标签高亮
        await expect(page.locator(`#tab-${tab}`)).toHaveClass(/bg-blue-500/);
      }
    });

    // === 步骤8: 测试数据持久化 ===
    await test.step('测试本地存储功能', async () => {
      // 切换回编辑器
      await page.click('#tab-editor');
      
      // 输入并保存内容
      const testContent = '这是持久化测试内容 - AI技术革命';
      await page.locator('#editor-content').click();
      await page.keyboard.press('Control+a');
      await page.locator('#editor-content').fill(testContent);
      await page.click('#save-document');
      
      // 刷新页面验证内容保持
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // 切换到编辑器并验证内容
      await page.click('#tab-editor');
      await expect(page.locator('#editor-content')).toContainText(testContent);
    });

    // === 步骤9: 测试响应式设计 ===
    await test.step('测试响应式布局', async () => {
      // 测试移动端视图
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      // 验证导航按钮仍然可见
      await expect(page.locator('#tab-home')).toBeVisible();
      await expect(page.locator('#tab-editor')).toBeVisible();
      
      // 测试桌面端视图
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(500);
      
      // 验证布局正常
      await expect(page.locator('.container')).toBeVisible();
    });

    // === 步骤10: 验证完整用户体验 ===
    await test.step('验证完整用户体验流程', async () => {
      // 模拟完整的写作流程
      
      // 1. 从首页开始
      await page.click('#tab-home');
      await page.click('#start-writing');
      
      // 2. 在编辑器中写作
      await page.locator('#editor-content').click();
      await page.keyboard.press('Control+a');
      await page.locator('#editor-content').fill('AI驱动的未来：智能技术如何改变我们的生活方式和工作模式。');
      await page.click('#save-document');
      
      // 3. 与AI助手讨论
      await page.click('#tab-chat');
      await page.fill('#chat-input', '请帮我扩展这个主题，增加更多技术细节');
      await page.click('#send-message');
      await page.waitForTimeout(1500);
      
      // 4. 启动智能工作流
      await page.click('#tab-workflow');
      await page.fill('#workflow-topic', 'AI驱动的未来技术发展趋势');
      await page.selectOption('#writing-type', 'blog');
      await page.click('#start-workflow');
      
      // 等待工作流部分执行
      await page.waitForTimeout(5000);
      
      // 验证最终状态
      await expect(page.locator('#status-bar')).toBeVisible();
      console.log('✅ 完整用户体验测试成功完成');
    });
  });

  test('错误处理和边界情况测试', async ({ page }) => {
    await test.step('测试空输入处理', async () => {
      // 测试工作流空主题
      await page.click('#tab-workflow');
      await page.click('#start-workflow');
      await expect(page.locator('#status-message')).toContainText('请输入写作主题');
      
      // 测试聊天空消息
      await page.click('#tab-chat');
      await page.click('#send-message');
      // 验证只有初始消息存在
      await expect(page.locator('#chat-messages')).toContainText('开始与AI助手对话');
    });

    await test.step('测试快速连续操作', async () => {
      // 快速切换标签
      for (let i = 0; i < 5; i++) {
        await page.click('#tab-home');
        await page.click('#tab-editor');
        await page.click('#tab-chat');
        await page.click('#tab-workflow');
      }
      
      // 验证最终状态正常
      await expect(page.locator('#workflow-section')).toBeVisible();
    });
  });

  test('性能和用户体验测试', async ({ page }) => {
    await test.step('测试页面加载性能', async () => {
      const startTime = Date.now();
      await page.goto(testPage);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // 页面应在3秒内加载完成
      expect(loadTime).toBeLessThan(3000);
      console.log(`页面加载时间: ${loadTime}ms`);
    });

    await test.step('测试交互响应性', async () => {
      const interactions = [
        () => page.click('#tab-editor'),
        () => page.click('#tab-chat'),
        () => page.click('#tab-workflow'),
        () => page.click('#tab-home'),
      ];

      for (const interaction of interactions) {
        const startTime = Date.now();
        await interaction();
        const responseTime = Date.now() - startTime;
        
        // 交互响应应在500ms内（更宽松的要求）
        expect(responseTime).toBeLessThan(500);
      }
    });
  });
});