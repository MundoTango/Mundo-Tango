import { chromium } from 'playwright';

async function auditARIA() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const routes = ['/mr-blue', '/visual-editor'];
  const report: any[] = [];
  
  for (const route of routes) {
    await page.goto(`http://localhost:5000${route}`);
    
    // Check interactive elements have labels
    const unlabeledButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons
        .filter(btn => !btn.getAttribute('aria-label') && !btn.textContent?.trim())
        .map(btn => ({
          tag: btn.tagName,
          testId: btn.getAttribute('data-testid'),
          class: btn.className,
        }));
    });
    
    // Check images have alt text
    const missingAlt = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images
        .filter(img => !img.getAttribute('alt'))
        .map(img => ({
          src: img.src,
          testId: img.getAttribute('data-testid'),
        }));
    });
    
    // Check form inputs have labels
    const unlabeledInputs = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, textarea'));
      return inputs
        .filter(input => {
          const id = input.id;
          const hasLabel = id && document.querySelector(`label[for="${id}"]`);
          const hasAriaLabel = input.getAttribute('aria-label');
          return !hasLabel && !hasAriaLabel;
        })
        .map(input => ({
          type: input.getAttribute('type'),
          testId: input.getAttribute('data-testid'),
        }));
    });
    
    report.push({
      route,
      unlabeledButtons: unlabeledButtons.length,
      missingAlt: missingAlt.length,
      unlabeledInputs: unlabeledInputs.length,
      details: { unlabeledButtons, missingAlt, unlabeledInputs },
    });
  }
  
  await browser.close();
  
  // Generate report
  console.log('\n♿ ARIA Audit Report\n');
  for (const item of report) {
    console.log(`Route: ${item.route}`);
    console.log(`- Unlabeled buttons: ${item.unlabeledButtons}`);
    console.log(`- Images missing alt: ${item.missingAlt}`);
    console.log(`- Unlabeled inputs: ${item.unlabeledInputs}`);
    if (item.unlabeledButtons > 0) {
      console.log('  Details:', item.details.unlabeledButtons);
    }
    console.log('');
  }
  
  const totalIssues = report.reduce((sum, item) => 
    sum + item.unlabeledButtons + item.missingAlt + item.unlabeledInputs, 0
  );
  
  if (totalIssues === 0) {
    console.log('✅ All ARIA requirements met');
  } else {
    console.log(`⚠️ Found ${totalIssues} accessibility issues`);
  }
}

auditARIA();
