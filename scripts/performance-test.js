import fs from 'fs';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox'] });

  try {
    const options = {
      logLevel: 'info',
      output: 'html',
      onlyCategories: ['performance', 'accessibility', 'best-practices'],
      port: chrome.port
    };

    const runnerResult = await lighthouse(url, options);
    if (!runnerResult) throw new Error('No Lighthouse result returned.');

    fs.writeFileSync('lighthouse-report.html', runnerResult.report);

    const { categories, audits } = runnerResult.lhr;
    const scores = {
      performance: Math.round(categories.performance.score * 100),
      accessibility: Math.round(categories.accessibility.score * 100),
      bestPractices: Math.round(categories['best-practices'].score * 100),
      fcp: audits['first-contentful-paint'].displayValue,
      lcp: audits['largest-contentful-paint'].displayValue,
      tti: audits.interactive.displayValue,
      cls: audits['cumulative-layout-shift'].displayValue,
      tbt: audits['total-blocking-time'].displayValue
    };

    console.log('\nPerformance Metrics');
    console.log('--------------------------------------------------');
    console.log(`Performance Score:    ${scores.performance}/100`);
    console.log(`Accessibility Score:  ${scores.accessibility}/100`);
    console.log(`Best Practices Score: ${scores.bestPractices}/100`);
    console.log('--------------------------------------------------');
    console.log(`First Contentful Paint: ${scores.fcp}`);
    console.log(`Largest Contentful Paint: ${scores.lcp}`);
    console.log(`Time to Interactive: ${scores.tti}`);
    console.log(`Cumulative Layout Shift: ${scores.cls}`);
    console.log(`Total Blocking Time: ${scores.tbt}`);
    console.log('--------------------------------------------------');
    console.log('Full report: lighthouse-report.html\n');
    return scores;
  } finally {
    await chrome.kill();
  }
}

const url = process.argv[2] || 'http://localhost:3000';
console.log(`Testing URL: ${url}`);
runLighthouse(url).catch((error) => {
  console.error('Lighthouse run failed:', error);
  process.exit(1);
});
