import { Page, expect } from '@playwright/test';

/**
 * Legal Document Management Helper - Templates, AI review, e-signatures
 */

export async function browseTemplates(page: Page, category?: string) {
  await page.goto('/legal/templates');
  await page.waitForLoadState('networkidle');
  
  // Verify template library displayed
  await expect(page.getByTestId('template-library')).toBeVisible();
  
  if (category) {
    await page.getByTestId('filter-category').click();
    await page.getByRole('option', { name: category }).click();
    await page.waitForLoadState('networkidle');
  }
}

export async function searchTemplate(page: Page, searchTerm: string) {
  await page.getByTestId('input-template-search').fill(searchTerm);
  await page.getByTestId('button-search-templates').click();
  await page.waitForLoadState('networkidle');
  
  // Verify search results
  await expect(page.getByTestId('template-search-results')).toBeVisible();
}

export async function previewTemplate(page: Page, templateId: string) {
  await page.getByTestId(`button-preview-template-${templateId}`).click();
  
  // Wait for preview modal
  await page.waitForSelector('[data-testid="template-preview-modal"]');
  
  // Verify preview content
  await expect(page.getByTestId('template-preview-content')).toBeVisible();
}

export async function useTemplate(page: Page, templateName: string) {
  // Find and click "Use This Template" button
  await page.getByTestId(`button-use-template-${templateName}`).click();
  
  // Wait for document editor
  await page.waitForSelector('[data-testid="document-editor"]');
}

export async function fillTemplateVariables(page: Page, variables: Record<string, string>) {
  // Wait for variable form
  await page.waitForSelector('[data-testid="template-variables-form"]');
  
  for (const [varName, value] of Object.entries(variables)) {
    await page.getByTestId(`input-var-${varName}`).fill(value);
  }
}

export async function previewDocument(page: Page) {
  await page.getByTestId('button-preview-document').click();
  
  // Wait for preview
  await page.waitForSelector('[data-testid="document-preview"]');
  
  // Verify content rendered
  await expect(page.getByTestId('document-preview-content')).toBeVisible();
}

export async function saveDocument(page: Page, title?: string) {
  if (title) {
    await page.getByTestId('input-document-title').fill(title);
  }
  
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/legal/documents') && response.status() === 201
  );
  
  await page.getByTestId('button-save-document').click();
  const response = await responsePromise;
  
  const responseData = await response.json();
  
  // Wait for redirect to document detail page
  await page.waitForURL(/\/legal\/document\/\d+/);
  
  return responseData.id;
}

export async function createCustomDocument(page: Page, documentData: {
  title: string;
  content: string;
}) {
  await page.goto('/legal/documents');
  await page.waitForLoadState('networkidle');
  
  await page.getByTestId('button-create-document').click();
  await page.waitForSelector('[data-testid="document-form"]');
  
  await page.getByTestId('input-document-title').fill(documentData.title);
  await page.getByTestId('textarea-document-content').fill(documentData.content);
}

export async function addClause(page: Page, clauseData: {
  type: string;
  content: string;
}) {
  await page.getByTestId('button-add-clause').click();
  await page.waitForSelector('[data-testid="clause-form"]');
  
  await page.getByTestId('select-clause-type').click();
  await page.getByRole('option', { name: clauseData.type }).click();
  
  await page.getByTestId('textarea-clause-content').fill(clauseData.content);
  
  await page.getByTestId('button-save-clause').click();
  await page.waitForSelector('[data-testid="clause-list"]');
}

export async function saveAsDraft(page: Page) {
  await page.getByTestId('button-save-draft').click();
  
  await page.waitForResponse(
    response => response.url().includes('/api/legal/documents') && response.status() === 201
  );
  
  // Verify draft saved
  await expect(page.getByText(/draft.*saved/i)).toBeVisible();
}

export async function publishDocument(page: Page) {
  await page.getByTestId('button-publish-document').click();
  
  await page.waitForResponse(
    response => response.url().includes('/api/legal/documents') && response.status() === 200
  );
  
  // Verify published
  await expect(page.getByTestId('document-status')).toHaveText(/published/i);
}

export async function reviewDocument(page: Page) {
  await page.getByTestId('button-ai-review').click();
  
  // Wait for AI Agent #185 to analyze
  await page.waitForSelector('[data-testid="ai-review-results"]', { timeout: 30000 });
  
  // Verify review components
  await expect(page.getByTestId('clause-extraction')).toBeVisible();
  await expect(page.getByTestId('completeness-check')).toBeVisible();
  await expect(page.getByTestId('risk-assessment-score')).toBeVisible();
  await expect(page.getByTestId('compliance-checking')).toBeVisible();
  await expect(page.getByTestId('plain-language-suggestions')).toBeVisible();
  await expect(page.getByTestId('inconsistency-detection')).toBeVisible();
  await expect(page.getByTestId('improvement-recommendations')).toBeVisible();
}

export async function verifyClauseExtraction(page: Page, expectedClauses: string[]) {
  for (const clauseType of expectedClauses) {
    await expect(
      page.getByTestId(`extracted-clause-${clauseType}`)
    ).toBeVisible();
  }
}

export async function verifyComplianceChecks(page: Page, standards: string[]) {
  for (const standard of standards) {
    await expect(
      page.getByTestId(`compliance-${standard}`)
    ).toBeVisible();
  }
}

export async function getAIAssistance(page: Page) {
  await page.getByTestId('button-ai-assistant').click();
  
  // Wait for AI Agent #186
  await page.waitForSelector('[data-testid="ai-assistant-panel"]', { timeout: 15000 });
  
  // Verify assistance components
  await expect(page.getByTestId('clause-recommendations')).toBeVisible();
  await expect(page.getByTestId('jurisdiction-guidance')).toBeVisible();
  await expect(page.getByTestId('industry-best-practices')).toBeVisible();
  await expect(page.getByTestId('negotiation-suggestions')).toBeVisible();
}

export async function applyAISuggestions(page: Page) {
  await page.getByTestId('button-apply-suggestions').click();
  
  await page.waitForResponse(
    response => response.url().includes('/api/legal/documents') && response.status() === 200
  );
  
  // Verify applied
  await expect(page.getByText(/suggestions.*applied/i)).toBeVisible();
}

export async function compareDocuments(page: Page, documentId1: number, documentId2: number) {
  await page.goto('/legal/documents');
  await page.waitForLoadState('networkidle');
  
  await page.getByTestId(`checkbox-document-${documentId1}`).check();
  await page.getByTestId(`checkbox-document-${documentId2}`).check();
  
  await page.getByTestId('button-compare-documents').click();
  
  // Wait for comparison view
  await page.waitForSelector('[data-testid="document-comparison"]');
  
  // Verify comparison components
  await expect(page.getByTestId('side-by-side-comparison')).toBeVisible();
  await expect(page.getByTestId('difference-highlighting')).toBeVisible();
  await expect(page.getByTestId('strengths-weaknesses-analysis')).toBeVisible();
  await expect(page.getByTestId('best-practices-recommendations')).toBeVisible();
}

export async function requestSignature(page: Page, signatureData: {
  recipients: string[];
  workflow: 'sequential' | 'parallel';
  instructions?: string;
}) {
  await page.getByTestId('button-request-signature').click();
  await page.waitForSelector('[data-testid="signature-request-form"]');
  
  // Add recipients
  for (const email of signatureData.recipients) {
    await page.getByTestId('input-recipient-email').fill(email);
    await page.getByTestId('button-add-recipient').click();
  }
  
  // Set workflow
  await page.getByTestId('select-signature-workflow').click();
  await page.getByRole('option', { name: signatureData.workflow }).click();
  
  // Add instructions
  if (signatureData.instructions) {
    await page.getByTestId('textarea-signing-instructions').fill(signatureData.instructions);
  }
  
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/legal/signature-requests') && response.status() === 201
  );
  
  await page.getByTestId('button-send-request').click();
  await responsePromise;
  
  // Verify success
  await expect(page.getByText(/signature.*request.*sent/i)).toBeVisible();
}

export async function signDocument(page: Page, signatureRequestId: number) {
  await page.goto(`/legal/sign/${signatureRequestId}`);
  await page.waitForLoadState('networkidle');
  
  // Review document
  await expect(page.getByTestId('document-content')).toBeVisible();
  
  // Draw signature
  const canvas = page.getByTestId('signature-pad');
  await canvas.click();
  
  // Simulate drawing (click multiple points)
  const canvasBox = await canvas.boundingBox();
  if (canvasBox) {
    await page.mouse.move(canvasBox.x + 50, canvasBox.y + 50);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + 100, canvasBox.y + 70);
    await page.mouse.move(canvasBox.x + 150, canvasBox.y + 50);
    await page.mouse.up();
  }
  
  // Confirm signature
  await page.getByTestId('button-confirm-signature').click();
  
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/legal/sign') && response.status() === 200
  );
  
  await page.getByTestId('button-submit-signature').click();
  await responsePromise;
  
  // Verify completion
  await expect(page.getByTestId('signature-completion-message')).toBeVisible();
}

export async function downloadSignedDocument(page: Page) {
  const downloadPromise = page.waitForEvent('download');
  
  await page.getByTestId('button-download-signed-pdf').click();
  
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
}

export async function viewSignatureStatus(page: Page) {
  await page.getByTestId('tab-signatures').click();
  
  // Verify signature tracking
  await expect(page.getByTestId('signature-status-list')).toBeVisible();
}

export async function verifySignatureDetails(page: Page, recipientEmail: string) {
  const recipientRow = page.getByTestId(`signature-recipient-${recipientEmail}`);
  
  await expect(recipientRow).toBeVisible();
  
  // Check status and timestamp
  await expect(recipientRow.getByTestId('signature-status')).toBeVisible();
  await expect(recipientRow.getByTestId('signed-timestamp')).toBeVisible();
}

export async function resendSignatureReminder(page: Page, recipientEmail: string) {
  await page.getByTestId(`button-resend-reminder-${recipientEmail}`).click();
  
  await page.waitForResponse(
    response => response.url().includes('/api/legal/signature-reminder') && response.status() === 200
  );
  
  // Verify success
  await expect(page.getByText(/reminder.*sent/i)).toBeVisible();
}

export async function cancelSignatureRequest(page: Page) {
  await page.getByTestId('button-cancel-signature-request').click();
  
  // Confirm cancellation
  await page.getByTestId('button-confirm-cancel').click();
  
  await page.waitForResponse(
    response => response.url().includes('/api/legal/signature-requests') && response.status() === 200
  );
  
  // Verify cancelled
  await expect(page.getByText(/request.*cancelled/i)).toBeVisible();
}
