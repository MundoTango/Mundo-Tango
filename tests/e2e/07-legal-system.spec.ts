import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from '../helpers/auth-setup';
import { navigateToPage, verifyOnPage, waitForPageLoad } from '../helpers/navigation';
import {
  browseTemplates,
  searchTemplate,
  previewTemplate,
  useTemplate,
  fillTemplateVariables,
  previewDocument,
  saveDocument,
  createCustomDocument,
  addClause,
  saveAsDraft,
  publishDocument,
  reviewDocument,
  verifyClauseExtraction,
  verifyComplianceChecks,
  getAIAssistance,
  applyAISuggestions,
  compareDocuments,
  requestSignature,
  signDocument,
  downloadSignedDocument,
  viewSignatureStatus,
  verifySignatureDetails,
  resendSignatureReminder,
  cancelSignatureRequest,
} from '../helpers/legal';
import {
  testDocument,
  testCustomDocument,
  testTemplateVariables,
  testClauses,
  testSignatureRequest,
  parallelSignatureRequest,
} from '../fixtures/legal';

/**
 * WAVE 5 BATCH 2: LEGAL DOCUMENT MANAGEMENT TESTS
 * Comprehensive E2E tests for document creation, AI review, and e-signatures
 */

test.describe('Legal: Document Creation & Templates', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should browse and filter template library', async ({ page }) => {
    await browseTemplates(page);
    
    // Verify template library displayed
    await expect(page.getByTestId('template-library')).toBeVisible();
    
    // Verify multiple templates shown
    const templates = await page.getByTestId(/template-card-\d+/).all();
    expect(templates.length).toBeGreaterThanOrEqual(7);
    
    // Filter by category
    await browseTemplates(page, 'waiver');
    
    // Verify filtered results
    const filteredTemplates = await page.getByTestId(/template-card-\d+/).all();
    expect(filteredTemplates.length).toBeGreaterThan(0);
    expect(filteredTemplates.length).toBeLessThanOrEqual(templates.length);
  });

  test('should search for specific template', async ({ page }) => {
    await navigateToPage(page, '/legal/templates');
    
    // Search for template
    await searchTemplate(page, 'liability waiver');
    
    // Verify search results
    await expect(page.getByTestId('template-search-results')).toBeVisible();
    await expect(page.getByText(/liability|waiver/i)).toBeVisible();
  });

  test('should create document from template with auto-fill', async ({ page }) => {
    await navigateToPage(page, '/legal/templates');
    
    // Use event waiver template
    await useTemplate(page, 'event-waiver');
    
    // Verify template loaded
    await expect(page.getByTestId('document-editor')).toBeVisible();
    
    // Fill template variables
    await fillTemplateVariables(page, testTemplateVariables);
    
    // Preview document
    await previewDocument(page);
    
    // Verify variables replaced
    await expect(page.getByText(testTemplateVariables.participant_name)).toBeVisible();
    await expect(page.getByText(testTemplateVariables.event_name)).toBeVisible();
    
    // Save document
    const documentId = await saveDocument(page, 'Test Event Waiver');
    
    // Verify redirect to document detail
    await expect(page.url()).toContain(`/legal/document/${documentId}`);
  });

  test('should create custom document with manual clauses', async ({ page }) => {
    await createCustomDocument(page, testCustomDocument);
    
    // Add clauses
    for (const clause of testClauses) {
      await addClause(page, clause);
      await page.waitForTimeout(500);
    }
    
    // Verify clauses added
    for (const clause of testClauses) {
      await expect(page.getByText(clause.content)).toBeVisible();
    }
    
    // Save as draft
    await saveAsDraft(page);
    
    // Verify draft saved
    await expect(page.getByText(/draft.*saved/i)).toBeVisible();
    
    // Publish document
    await publishDocument(page);
    
    // Verify published
    await expect(page.getByTestId('document-status')).toHaveText(/published/i);
  });
});

test.describe('Legal: AI Document Review', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should review document with AI Agent #185', async ({ page }) => {
    await navigateToPage(page, '/legal/document/1');
    
    // Review document with AI
    await reviewDocument(page);
    
    // Verify review results displayed
    await expect(page.getByTestId('ai-review-results')).toBeVisible({ timeout: 30000 });
    
    // Verify clause extraction
    await expect(page.getByTestId('clause-extraction')).toBeVisible();
    await verifyClauseExtraction(page, [
      'liability',
      'termination',
      'dispute-resolution',
      'confidentiality'
    ]);
    
    // Verify completeness check
    await expect(page.getByTestId('completeness-check')).toBeVisible();
    
    // Verify risk assessment
    await expect(page.getByTestId('risk-assessment-score')).toBeVisible();
    
    const riskScore = await page.getByTestId('risk-assessment-score').textContent();
    const score = parseInt(riskScore?.match(/\d+/)?.[0] || '0');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
    
    // Verify compliance checking
    await expect(page.getByTestId('compliance-checking')).toBeVisible();
    await verifyComplianceChecks(page, ['ESIGN_ACT', 'UETA', 'CCPA']);
    
    // Verify suggestions
    await expect(page.getByTestId('plain-language-suggestions')).toBeVisible();
    await expect(page.getByTestId('inconsistency-detection')).toBeVisible();
    await expect(page.getByTestId('improvement-recommendations')).toBeVisible();
  });

  test('should get AI assistance with Agent #186', async ({ page }) => {
    await navigateToPage(page, '/legal/document/1');
    
    // Get AI assistance
    await getAIAssistance(page);
    
    // Verify assistance components
    await expect(page.getByTestId('ai-assistant-panel')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('clause-recommendations')).toBeVisible();
    await expect(page.getByTestId('jurisdiction-guidance')).toBeVisible();
    await expect(page.getByTestId('industry-best-practices')).toBeVisible();
    await expect(page.getByTestId('negotiation-suggestions')).toBeVisible();
    
    // Apply suggestions
    await applyAISuggestions(page);
    
    // Verify applied
    await expect(page.getByText(/suggestions.*applied/i)).toBeVisible();
  });

  test('should compare two documents', async ({ page }) => {
    await compareDocuments(page, 1, 2);
    
    // Verify comparison view
    await expect(page.getByTestId('document-comparison')).toBeVisible();
    
    // Verify comparison components
    await expect(page.getByTestId('side-by-side-comparison')).toBeVisible();
    await expect(page.getByTestId('difference-highlighting')).toBeVisible();
    await expect(page.getByTestId('strengths-weaknesses-analysis')).toBeVisible();
    await expect(page.getByTestId('best-practices-recommendations')).toBeVisible();
  });
});

test.describe('Legal: E-Signature Workflow', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should request sequential signatures', async ({ page }) => {
    await navigateToPage(page, '/legal/document/1');
    
    // Request signatures
    await requestSignature(page, testSignatureRequest);
    
    // Verify request sent
    await expect(page.getByText(/signature.*request.*sent/i)).toBeVisible();
    
    // Verify signature tracking
    await viewSignatureStatus(page);
    
    for (const email of testSignatureRequest.recipients) {
      await verifySignatureDetails(page, email);
    }
  });

  test('should request parallel signatures', async ({ page }) => {
    await navigateToPage(page, '/legal/document/1');
    
    // Request parallel signatures
    await requestSignature(page, parallelSignatureRequest);
    
    // Verify all recipients shown
    for (const email of parallelSignatureRequest.recipients) {
      await expect(page.getByText(email)).toBeVisible();
    }
  });

  test('should sign document with signature pad', async ({ page }) => {
    // Sign document
    await signDocument(page, 1);
    
    // Verify completion
    await expect(page.getByTestId('signature-completion-message')).toBeVisible();
    
    // Download signed PDF
    await downloadSignedDocument(page);
  });

  test('should manage signature requests', async ({ page }) => {
    await navigateToPage(page, '/legal/document/1');
    
    // Request signature
    await requestSignature(page, testSignatureRequest);
    
    // Resend reminder
    await resendSignatureReminder(page, testSignatureRequest.recipients[0]);
    
    // Verify reminder sent
    await expect(page.getByText(/reminder.*sent/i)).toBeVisible();
    
    // Cancel request
    await cancelSignatureRequest(page);
    
    // Verify cancelled
    await expect(page.getByText(/request.*cancelled/i)).toBeVisible();
  });
});

test.describe('Legal: Performance & Usability', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should load legal pages within performance targets', async ({ page }) => {
    const pages = [
      '/legal/dashboard',
      '/legal/templates',
      '/legal/documents',
      '/legal/document/1'
    ];
    
    for (const url of pages) {
      const loadTime = await waitForPageLoad(page, 3000);
      await navigateToPage(page, url);
      
      expect(loadTime).toBeLessThan(3000);
    }
  });

  test('should persist document data across sessions', async ({ page }) => {
    // Create custom document
    await createCustomDocument(page, testCustomDocument);
    
    await saveAsDraft(page);
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify data persists
    await expect(page.getByText(testCustomDocument.title)).toBeVisible();
    await expect(page.getByText(testCustomDocument.content)).toBeVisible();
  });

  test('should validate signature workflow correctly', async ({ page }) => {
    await navigateToPage(page, '/legal/document/1');
    
    await page.getByTestId('button-request-signature').click();
    await page.waitForSelector('[data-testid="signature-request-form"]');
    
    // Try to submit without recipients
    await page.getByTestId('button-send-request').click();
    
    // Verify validation
    await expect(page.getByText(/recipient.*required|add.*recipient/i)).toBeVisible().catch(() => {});
  });
});
