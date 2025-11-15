import { chromium } from 'playwright';

async function monitorErrorRates() {
  console.log('📊 Error Rate Monitor\n');
  
  const stats = {
    totalRequests: 0,
    failedRequests: 0,
    consoleErrors: 0,
  };
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('request', () => stats.totalRequests++);
  page.on('requestfailed', () => stats.failedRequests++);
  page.on('console', msg => {
    if (msg.type() === 'error') stats.consoleErrors++;
  });
  
  await page.goto('http://localhost:5000/mr-blue');
  await page.waitForTimeout(5000);
  
  await page.goto('http://localhost:5000/admin/visual-editor');
  await page.waitForTimeout(5000);
  
  await browser.close();
  
  const errorRate = ((stats.failedRequests + stats.consoleErrors) / stats.totalRequests) * 100;
  
  console.log(`Total requests: ${stats.totalRequests}`);
  console.log(`Failed requests: ${stats.failedRequests}`);
  console.log(`Console errors: ${stats.consoleErrors}`);
  console.log(`Error rate: ${errorRate.toFixed(2)}%\n`);
  
  if (errorRate < 1) {
    console.log('✅ Error rate below 1% target');
  } else {
    console.log('⚠️ Error rate exceeds 1% target');
  }
}

monitorErrorRates().catch(console.error);
