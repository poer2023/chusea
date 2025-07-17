const { chromium } = require('playwright');
const fs = require('fs');

async function testTipTapFixesAfter() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture console messages
  const consoleMessages = [];
  const errorMessages = [];
  
  page.on('console', (msg) => {
    const text = msg.text();
    consoleMessages.push({
      type: msg.type(),
      text: text,
      timestamp: new Date().toISOString()
    });
    
    if (msg.type() === 'error') {
      errorMessages.push(text);
      console.log(`❌ Console Error: ${text}`);
    } else if (msg.type() === 'warning') {
      console.log(`⚠️  Console Warning: ${text}`);
    } else {
      console.log(`ℹ️  Console ${msg.type()}: ${text}`);
    }
  });

  // Capture page errors
  page.on('pageerror', (error) => {
    const errorText = error.toString();
    errorMessages.push(errorText);
    console.log(`🚨 Page Error: ${errorText}`);
  });

  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    consoleMessages: [],
    errorMessages: [],
    screenshots: []
  };

  try {
    console.log('🧪 Testing homepage after TipTap fixes...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const homepageScreenshot = `homepage_after_fix_${Date.now()}.png`;
    await page.screenshot({ path: homepageScreenshot, fullPage: true });
    results.screenshots.push(homepageScreenshot);
    
    results.tests.push({
      route: '/',
      status: 'loaded',
      title: await page.title(),
      errors: [...errorMessages]
    });
    
    console.log(`📸 Homepage screenshot saved: ${homepageScreenshot}`);

    // Clear error messages for next test
    errorMessages.length = 0;

    console.log('🧪 Testing /demo/editor route after fixes...');
    try {
      await page.goto('http://localhost:3000/demo/editor', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      const editorScreenshot = `editor_after_fix_${Date.now()}.png`;
      await page.screenshot({ path: editorScreenshot, fullPage: true });
      results.screenshots.push(editorScreenshot);
      
      results.tests.push({
        route: '/demo/editor',
        status: 'loaded',
        title: await page.title(),
        errors: [...errorMessages]
      });
      
      console.log(`📸 Editor screenshot saved: ${editorScreenshot}`);
    } catch (editorError) {
      console.log(`❌ Editor route failed: ${editorError.message}`);
      results.tests.push({
        route: '/demo/editor',
        status: 'failed',
        error: editorError.message,
        errors: [...errorMessages]
      });
    }

    // Clear error messages for next test
    errorMessages.length = 0;

    console.log('🧪 Testing /chat route...');
    try {
      await page.goto('http://localhost:3000/chat', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      const chatScreenshot = `chat_after_fix_${Date.now()}.png`;
      await page.screenshot({ path: chatScreenshot, fullPage: true });
      results.screenshots.push(chatScreenshot);
      
      results.tests.push({
        route: '/chat',
        status: 'loaded',
        title: await page.title(),
        errors: [...errorMessages]
      });
      
      console.log(`📸 Chat screenshot saved: ${chatScreenshot}`);
    } catch (chatError) {
      console.log(`❌ Chat route failed: ${chatError.message}`);
      results.tests.push({
        route: '/chat',
        status: 'failed',
        error: chatError.message,
        errors: [...errorMessages]
      });
    }

    // Store all console messages and errors
    results.consoleMessages = consoleMessages;
    results.errorMessages = [...new Set(errorMessages)]; // Remove duplicates

    // Save results to file
    fs.writeFileSync('test_results_after_fix.json', JSON.stringify(results, null, 2));
    console.log('💾 Test results saved to test_results_after_fix.json');

    // Summary
    console.log('\n📊 Test Summary After TipTap Fixes:');
    console.log(`Total routes tested: ${results.tests.length}`);
    console.log(`Successful loads: ${results.tests.filter(t => t.status === 'loaded').length}`);
    console.log(`Failed loads: ${results.tests.filter(t => t.status === 'failed').length}`);
    console.log(`Total console messages: ${consoleMessages.length}`);
    console.log(`Total error messages: ${results.errorMessages.length}`);
    
    // Check for TipTap specific errors
    const tiptapErrors = results.errorMessages.filter(error => 
      error.includes('BubbleMenu') || 
      error.includes('FloatingMenu') || 
      error.includes('@tiptap')
    );
    
    console.log(`TipTap-related errors: ${tiptapErrors.length}`);
    
    if (tiptapErrors.length > 0) {
      console.log('\n🚨 Remaining TipTap Errors:');
      tiptapErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('\n✅ No TipTap-related errors detected!');
    }
    
    if (results.errorMessages.length > 0) {
      console.log('\n🚨 Other Remaining Errors:');
      results.errorMessages.filter(error => 
        !error.includes('BubbleMenu') && 
        !error.includes('FloatingMenu') && 
        !error.includes('@tiptap')
      ).forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testTipTapFixesAfter().catch(console.error);