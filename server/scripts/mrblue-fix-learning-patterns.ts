import { MrBlueInternalExecutor } from '../services/mrBlue/MrBlueInternalExecutor';

async function fixLearningPatterns() {
  const executor = new MrBlueInternalExecutor();
  
  console.log('\n🔵 [Mr Blue] FIX: Learning Patterns Recording Error\n');
  
  const result = await executor.executeTask({
    bugId: 'p101-fix-learning-patterns',
    description: 'Fix "null value in column solution_template" error when recording learning patterns',
    targetFiles: ['server/services/mrBlue/LearningRetentionService.ts'],
    fixPlan: `Fix the recordSuccessPattern function:
1. Find the recordSuccessPattern function (around line 508)
2. The error is: null value in column "solution_template" violates not-null constraint
3. Add a default value for solution_template when inserting
4. The solution_template should be set to a description of the fix, not null
5. Add: solution_template: description || 'Auto-generated solution'

Look for the INSERT statement and ensure solution_template is always provided.`,
    context: [
      'Error: null value in column "solution_template" violates not-null constraint',
      'Happening in LearningRetentionService.recordSuccessPattern',
      'Need to provide default value for solution_template field',
      'This is preventing pattern learning from being recorded'
    ]
  });
  
  console.log('\n🔵 Fix Result:', result.success ? '✅' : '❌');
  return result;
}

fixLearningPatterns().catch(console.error);
