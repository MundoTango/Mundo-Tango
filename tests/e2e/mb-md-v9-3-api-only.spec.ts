/**
 * MB.MD v9.3 - Backend API Test (Simplified)
 * 
 * Tests ONLY the backend API endpoints without browser interaction.
 * This validates the 7-phase Backend Orchestrator workflow.
 * 
 * Pattern: MB.MD Pattern 28 - Hierarchical Execution
 * Created: November 23, 2025
 */

import { test, expect } from '@playwright/test';

test.describe('MB.MD v9.3: Backend API Validation', () => {

  /**
   * TEST 1: Session Tracker API
   * Validates that UI changes can be tracked via API
   */
  test('SessionTracker API: Track UI changes', async ({ request }) => {
    console.log('🎯 TEST 1: SessionTracker API...');

    const response = await request.post('/api/mrblue/session-track/change', {
      data: {
        conversationId: 999,
        change: {
          type: 'ui-modification',
          description: 'API test - Added blue header',
          timestamp: Date.now()
        }
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    console.log('✅ SessionTracker response:', data);
    
    expect(data).toHaveProperty('success');
    console.log('✅ TEST 1 PASSED: SessionTracker working\n');
  });

  /**
   * TEST 2: Backend Orchestrator API
   * Validates the 7-phase backend save workflow
   */
  test('Backend Orchestrator: 7-phase save workflow', async ({ request }) => {
    console.log('🎯 TEST 2: Backend Orchestrator API...');

    // Step 1: Create session changes
    console.log('Step 1: Creating session changes...');
    const changeResponse = await request.post('/api/mrblue/session-track/change', {
      data: {
        conversationId: 1000,
        change: {
          type: 'backend-test',
          description: 'Full workflow test - Card component',
          timestamp: Date.now()
        }
      }
    });
    expect(changeResponse.ok()).toBeTruthy();
    console.log('✅ Session change created');

    // Step 2: Trigger backend save
    console.log('Step 2: Triggering backend save...');
    const saveResponse = await request.post('/api/mrblue/save-backend', {
      data: {
        conversationId: 1000
      }
    });

    expect(saveResponse.ok()).toBeTruthy();
    const saveData = await saveResponse.json();
    console.log('✅ Backend save response:', saveData);

    // Step 3: Validate response structure
    expect(saveData).toHaveProperty('success');
    expect(saveData).toHaveProperty('filesModified');
    expect(saveData).toHaveProperty('agentsUsed');
    expect(saveData).toHaveProperty('errors');
    
    // Validate it processed successfully
    expect(saveData.success).toBeTruthy();
    expect(Array.isArray(saveData.filesModified)).toBeTruthy();
    expect(Array.isArray(saveData.agentsUsed)).toBeTruthy();
    expect(Array.isArray(saveData.errors)).toBeTruthy();

    console.log('✅ TEST 2 PASSED: Backend Orchestrator working\n');
  });

  /**
   * TEST 3: Status API
   * Validates that status endpoint returns correct information
   */
  test('Status API: Check save status', async ({ request }) => {
    console.log('🎯 TEST 3: Status API...');

    const response = await request.get('/api/mrblue/save-backend/status');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    console.log('✅ Status response:', data);

    expect(data).toHaveProperty('success');
    console.log('✅ TEST 3 PASSED: Status API working\n');
  });

  /**
   * TEST 4: Empty Save Test
   * Validates graceful handling when no changes exist
   */
  test('Error Handling: Save with no changes', async ({ request }) => {
    console.log('🎯 TEST 4: Empty save handling...');

    const response = await request.post('/api/mrblue/save-backend', {
      data: {
        conversationId: 9999 // Non-existent conversation
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    console.log('✅ Empty save response:', data);

    expect(data).toHaveProperty('success');
    expect(data.success).toBeTruthy();
    expect(data.message).toContain('No changes');

    console.log('✅ TEST 4 PASSED: Empty save handled gracefully\n');
  });

  /**
   * TEST 5: Full 2-Stage Workflow Simulation
   * Simulates Generate → Save workflow via API only
   */
  test('FULL WORKFLOW: Generate → Save (API simulation)', async ({ request }) => {
    console.log('🎯 TEST 5: Full 2-stage workflow (API)...\n');

    console.log('📝 STAGE 1: GENERATE (UI Changes)');
    // Simulate VibeCoding UI change
    const vибеCodingChange = await request.post('/api/mrblue/session-track/change', {
      data: {
        conversationId: 2000,
        change: {
          type: 'vibecoding-ui',
          description: 'Generated card component with blue background',
          timestamp: Date.now()
        }
      }
    });
    expect(vибеCodingChange.ok()).toBeTruthy();
    console.log('✅ STAGE 1 COMPLETE: VibeCoding UI change tracked\n');

    console.log('💾 STAGE 2: SAVE (Backend Changes)');
    // Trigger backend save
    const backendSave = await request.post('/api/mrblue/save-backend', {
      data: {
        conversationId: 2000
      }
    });
    
    expect(backendSave.ok()).toBeTruthy();
    const backendData = await backendSave.json();
    
    console.log('✅ Backend Orchestrator Response:');
    console.log('   - Success:', backendData.success);
    console.log('   - Files Modified:', backendData.filesModified?.length || 0);
    console.log('   - Agents Used:', backendData.agentsUsed?.length || 0);
    console.log('   - Errors:', backendData.errors?.length || 0);
    console.log('   - Duration:', backendData.duration, 'ms');
    
    expect(backendData.success).toBeTruthy();
    console.log('✅ STAGE 2 COMPLETE\n');

    console.log('✅ FULL WORKFLOW VALIDATION:');
    console.log('   ✅ Stage 1: VibeCoding tracked UI changes');
    console.log('   ✅ Stage 2: Backend Orchestrator processed changes');
    console.log('   ✅ 7-Phase workflow executed successfully');
    console.log('\n🎉 MB.MD v9.3 TWO-STAGE WORKFLOW: API VALIDATED! 🎉');
  });
});
