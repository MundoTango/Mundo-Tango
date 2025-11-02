/**
 * AGENT HEALTH PAGE OBJECT MODEL
 * Handles agent health monitoring dashboard
 */

import { Page, Locator } from '@playwright/test';

export class AgentHealthPage {
  readonly page: Page;
  readonly agentsList: Locator;
  readonly healthStatusCard: Locator;
  readonly refreshButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.agentsList = page.getByTestId('list-agents');
    this.healthStatusCard = page.getByTestId('card-health-status');
    this.refreshButton = page.getByTestId('button-refresh');
  }

  /**
   * Navigate to agent health page
   */
  async goto(): Promise<void> {
    await this.page.goto('/admin/agent-health');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Refresh agent health data
   */
  async refresh(): Promise<void> {
    await this.refreshButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get agent status
   */
  async getAgentStatus(agentId: string): Promise<string> {
    const statusElement = this.page.getByTestId(`agent-status-${agentId}`);
    return await statusElement.textContent() || 'unknown';
  }
}
