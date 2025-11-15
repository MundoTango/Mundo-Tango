import { chromium } from 'playwright';

async function checkContrast() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5000/mr-blue');
  
  // Inject contrast checking library
  await page.addScriptTag({ url: 'https://unpkg.com/wcag-contrast@3.0.0' });
  
  const contrastIssues = await page.evaluate(() => {
    const issues = [];
    
    // Check all text elements
    const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, button, a');
    
    elements.forEach((el) => {
      const color = window.getComputedStyle(el).color;
      const bgColor = window.getComputedStyle(el).backgroundColor;
      
      // Parse RGB values
      const parseRGB = (rgb: string) => {
        const match = rgb.match(/\d+/g);
        return match ? match.map(Number) : [0, 0, 0];
      };
      
      const fg = parseRGB(color);
      const bg = parseRGB(bgColor);
      
      // Calculate relative luminance
      const getLuminance = (rgb) => {
        const [r, g, b] = rgb.map(val => {
          val = val / 255;
          return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      
      const fgLum = getLuminance(fg);
      const bgLum = getLuminance(bg);
      
      // Calculate contrast ratio
      const contrast = (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05);
      
      // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
      const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
      const minContrast = fontSize >= 24 ? 3 : 4.5;
      
      if (contrast < minContrast) {
        issues.push({
          element: el.tagName,
          text: el.textContent?.slice(0, 30),
          contrast: contrast.toFixed(2),
          required: minContrast,
          testId: el.getAttribute('data-testid'),
        });
      }
    });
    
    return issues;
  });
  
  await browser.close();
  
  console.log('\n🎨 Color Contrast Report\n');
  if (contrastIssues.length === 0) {
    console.log('✅ All text meets WCAG AA contrast requirements');
  } else {
    console.log(`⚠️ Found ${contrastIssues.length} contrast issues:`);
    console.table(contrastIssues);
  }
}

checkContrast();
