import { Page, expect } from '@playwright/test';

/**
 * Financial System Testing Helper
 * Utilities for testing financial management features
 */

export async function createPortfolio(page: Page, data: {
  name: string;
  description?: string;
  initialCash?: number;
}) {
  await page.goto('/financial/portfolios');
  await page.getByTestId('button-create-portfolio').click();
  
  await page.getByTestId('input-portfolio-name').fill(data.name);
  
  if (data.description) {
    await page.getByTestId('input-portfolio-description').fill(data.description);
  }
  
  if (data.initialCash) {
    await page.getByTestId('input-initial-cash').fill(data.initialCash.toString());
  }
  
  await page.getByTestId('button-submit-portfolio').click();
  
  // Wait for portfolio to be created
  await expect(page.getByText(data.name)).toBeVisible({ timeout: 10000 });
}

export async function executeTrade(page: Page, trade: {
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price?: number;
}) {
  await page.goto('/financial/trading');
  
  // Search for asset
  await page.getByTestId('input-search-asset').fill(trade.symbol);
  await page.waitForTimeout(500);
  await page.getByTestId(`asset-${trade.symbol}`).click();
  
  // Select buy or sell
  await page.getByTestId(`button-${trade.type}`).click();
  
  // Enter quantity
  await page.getByTestId('input-quantity').fill(trade.quantity.toString());
  
  // Enter price (if market order, skip)
  if (trade.price) {
    await page.getByTestId('input-limit-price').fill(trade.price.toString());
  }
  
  // Preview trade
  await page.getByTestId('button-preview-trade').click();
  await page.waitForTimeout(500);
  
  // Confirm trade
  await page.getByTestId('button-confirm-trade').click();
  
  // Wait for trade confirmation
  await expect(page.getByText(/trade executed|order placed/i)).toBeVisible({ timeout: 10000 });
}

export async function verifyPortfolioValue(page: Page, expectedValue: number, tolerance = 100) {
  const valueText = await page.getByTestId('text-total-value').textContent();
  const value = parseFloat(valueText?.replace(/[^0-9.]/g, '') || '0');
  
  expect(Math.abs(value - expectedValue)).toBeLessThan(tolerance);
}

export async function verifyTradeHistory(page: Page, symbol: string) {
  await page.goto('/financial/history');
  await expect(page.getByText(symbol)).toBeVisible();
}

export async function startAIAgents(page: Page) {
  await page.goto('/financial/insights');
  await page.getByTestId('button-start-agents').click();
  
  // Wait for agents to initialize
  await expect(page.getByText(/agents running|33 agents active/i)).toBeVisible({ timeout: 15000 });
}

export async function stopAIAgents(page: Page) {
  await page.getByTestId('button-stop-agents').click();
  
  // Wait for agents to stop
  await expect(page.getByText(/agents stopped|agents inactive/i)).toBeVisible({ timeout: 10000 });
}

export async function verifyAIDecision(page: Page, decisionId: string) {
  await page.getByTestId(`decision-${decisionId}`).click();
  
  // Verify decision details are visible
  await expect(page.getByTestId('text-decision-strategy')).toBeVisible();
  await expect(page.getByTestId('text-decision-confidence')).toBeVisible();
  await expect(page.getByTestId('text-decision-risk')).toBeVisible();
  await expect(page.getByTestId('text-decision-reasoning')).toBeVisible();
}

export async function acceptAIRecommendation(page: Page, recommendationId: string) {
  await page.getByTestId(`recommendation-${recommendationId}`).click();
  await page.getByTestId('button-accept-recommendation').click();
  
  // Wait for trade execution
  await expect(page.getByText(/trade executed/i)).toBeVisible({ timeout: 10000 });
}

export async function overrideAIDecision(page: Page, decisionId: string) {
  await page.getByTestId(`decision-${decisionId}`).click();
  await page.getByTestId('button-override-decision').click();
  
  // Verify override confirmation
  await expect(page.getByText(/decision overridden/i)).toBeVisible();
}

export async function verifyRiskMetrics(page: Page) {
  await page.goto('/financial/risk');
  
  // Verify all risk metrics are present
  await expect(page.getByTestId('metric-max-drawdown')).toBeVisible();
  await expect(page.getByTestId('metric-volatility')).toBeVisible();
  await expect(page.getByTestId('metric-beta')).toBeVisible();
  await expect(page.getByTestId('metric-sharpe-ratio')).toBeVisible();
}

export async function generateReport(page: Page, reportType: 'daily' | 'weekly' | 'monthly') {
  await page.goto('/financial/reports');
  await page.getByTestId(`button-generate-${reportType}`).click();
  
  // Wait for report to generate
  await expect(page.getByText(/report generated/i)).toBeVisible({ timeout: 15000 });
}

export async function exportReport(page: Page, format: 'pdf' | 'csv') {
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId(`button-export-${format}`).click();
  const download = await downloadPromise;
  
  expect(download.suggestedFilename()).toMatch(new RegExp(`\\.${format}$`));
}

export async function connectAccount(page: Page, provider: 'coinbase' | 'schwab' | 'mercury') {
  await page.goto('/financial/accounts');
  await page.getByTestId('button-connect-account').click();
  await page.getByTestId(`provider-${provider}`).click();
  
  // Simulate OAuth (in real tests, this would go through OAuth flow)
  // For now, verify the connection modal appears
  await expect(page.getByText(/connect.*account/i)).toBeVisible();
}
