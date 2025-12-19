import { Page, expect } from '@playwright/test';

/**
 * Form Helper - Form filling and validation utilities
 */

export async function fillInput(page: Page, testId: string, value: string) {
  const input = page.getByTestId(testId);
  await input.clear();
  await input.fill(value);
}

export async function fillForm(page: Page, formData: Record<string, string>) {
  for (const [testId, value] of Object.entries(formData)) {
    await fillInput(page, testId, value);
  }
}

export async function selectDropdown(page: Page, testId: string, value: string) {
  await page.getByTestId(testId).click();
  await page.getByRole('option', { name: value }).click();
}

export async function checkCheckbox(page: Page, testId: string, checked: boolean = true) {
  const checkbox = page.getByTestId(testId);
  const isChecked = await checkbox.isChecked();
  
  if (isChecked !== checked) {
    await checkbox.click();
  }
}

export async function submitForm(page: Page, buttonTestId: string) {
  await page.getByTestId(buttonTestId).click();
}

export async function waitForFormSubmission(page: Page, apiEndpoint: string) {
  const responsePromise = page.waitForResponse(
    response => response.url().includes(apiEndpoint) && response.status() === 200
  );
  
  return responsePromise;
}

export async function verifyFormError(page: Page, errorMessage: string | RegExp) {
  await expect(page.getByText(errorMessage)).toBeVisible();
}

export async function verifyFormSuccess(page: Page, successMessage: string | RegExp) {
  await expect(page.getByText(successMessage)).toBeVisible({ timeout: 10000 });
}

export async function uploadFile(page: Page, testId: string, filePath: string) {
  const fileInput = page.getByTestId(testId);
  await fileInput.setInputFiles(filePath);
}

export async function clearForm(page: Page, formTestId: string) {
  const form = page.getByTestId(formTestId);
  const inputs = await form.locator('input').all();
  
  for (const input of inputs) {
    await input.clear();
  }
}

export async function verifyRequiredFields(page: Page, buttonTestId: string, requiredFields: string[]) {
  // Try to submit empty form
  await submitForm(page, buttonTestId);
  
  // Verify validation errors appear
  for (const field of requiredFields) {
    const errorRegex = new RegExp(`${field}.*required`, 'i');
    await verifyFormError(page, errorRegex);
  }
}
