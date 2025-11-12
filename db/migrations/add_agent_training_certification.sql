-- ============================================================================
-- BATCH 27: Agent Training Certification Schema Migration
-- ============================================================================
-- Purpose: Add training certification tracking fields to agents table
-- Date: January 12, 2025
-- Reference: agent_training_validation_report.md
-- ============================================================================

-- PHASE 1: Data Cleanup
-- ============================================================================

-- Step 1: Remove duplicate Life CEO agents (lowercase versions)
-- These are duplicates with inconsistent naming conventions
DELETE FROM agents WHERE type = 'life-ceo';
-- Expected: 16 rows deleted

-- Step 2: Remove test agent (not in framework specification)
DELETE FROM agents WHERE id = 'test-agent';
-- Expected: 1 row deleted

-- Checkpoint: Verify agent count = 101
-- SELECT COUNT(*) FROM agents;  -- Should be 101

-- ============================================================================
-- PHASE 2: Add Missing Operational Excellence Agents
-- ============================================================================

-- Add 5 Operational Excellence agents per APPENDIX O Category 6
INSERT INTO agents (id, name, type, category, description, status, configuration, capabilities, version, layer) VALUES
  (
    'AGENT_63',
    'Sprint Project Manager',
    'OPERATIONAL',
    'project_management',
    'Manages sprint planning, backlog grooming, and agile workflows',
    'active',
    jsonb_build_object(
      'capacity', jsonb_build_object(
        'max_concurrent_tasks', 15,
        'queue_size_limit', 30
      ),
      'hierarchy', jsonb_build_object(
        'level', 'OPERATIONAL',
        'reports_to', ARRAY['DOMAIN_9']
      ),
      'escalation', jsonb_build_object(
        'enabled', true,
        'escalation_path', ARRAY['DOMAIN_9', 'CHIEF_6']
      )
    ),
    jsonb_build_array(
      'problem_solving', 'collaboration', 'learning', 'self_testing',
      'agile_workflows', 'sprint_planning', 'backlog_management'
    ),
    '1.0.0',
    NULL
  ),
  (
    'AGENT_64',
    'Documentation Specialist',
    'OPERATIONAL',
    'documentation',
    'Manages knowledge base, methodology files, and technical documentation',
    'active',
    jsonb_build_object(
      'capacity', jsonb_build_object(
        'max_concurrent_tasks', 15,
        'queue_size_limit', 30
      ),
      'hierarchy', jsonb_build_object(
        'level', 'OPERATIONAL',
        'reports_to', ARRAY['DOMAIN_9']
      ),
      'escalation', jsonb_build_object(
        'enabled', true,
        'escalation_path', ARRAY['DOMAIN_9', 'CHIEF_6']
      )
    ),
    jsonb_build_array(
      'problem_solving', 'collaboration', 'learning', 'self_testing',
      'technical_writing', 'knowledge_management', 'documentation_standards'
    ),
    '1.0.0',
    NULL
  ),
  (
    'AGENT_65',
    'GitHub Integration Manager',
    'OPERATIONAL',
    'integration',
    'Manages GitHub integration, issue tracking, and project synchronization',
    'active',
    jsonb_build_object(
      'capacity', jsonb_build_object(
        'max_concurrent_tasks', 15,
        'queue_size_limit', 30
      ),
      'hierarchy', jsonb_build_object(
        'level', 'OPERATIONAL',
        'reports_to', ARRAY['DOMAIN_9']
      ),
      'escalation', jsonb_build_object(
        'enabled', true,
        'escalation_path', ARRAY['DOMAIN_9', 'CHIEF_6']
      )
    ),
    jsonb_build_array(
      'problem_solving', 'collaboration', 'learning', 'self_testing',
      'github_api', 'project_sync', 'issue_management'
    ),
    '1.0.0',
    NULL
  ),
  (
    'AGENT_66',
    'TestSprite AI Coordinator',
    'OPERATIONAL',
    'testing',
    'Coordinates automated testing, coverage analysis, and test suite management',
    'active',
    jsonb_build_object(
      'capacity', jsonb_build_object(
        'max_concurrent_tasks', 15,
        'queue_size_limit', 30
      ),
      'hierarchy', jsonb_build_object(
        'level', 'OPERATIONAL',
        'reports_to', ARRAY['DOMAIN_9']
      ),
      'escalation', jsonb_build_object(
        'enabled', true,
        'escalation_path', ARRAY['DOMAIN_9', 'CHIEF_6']
      )
    ),
    jsonb_build_array(
      'problem_solving', 'collaboration', 'learning', 'self_testing',
      'automated_testing', 'test_coverage', 'quality_assurance'
    ),
    '1.0.0',
    NULL
  ),
  (
    'AGENT_67',
    'Quality Assurance Lead',
    'OPERATIONAL',
    'quality_assurance',
    'Manages QA protocols, bug tracking, and quality standards enforcement',
    'active',
    jsonb_build_object(
      'capacity', jsonb_build_object(
        'max_concurrent_tasks', 15,
        'queue_size_limit', 30
      ),
      'hierarchy', jsonb_build_object(
        'level', 'OPERATIONAL',
        'reports_to', ARRAY['DOMAIN_9']
      ),
      'escalation', jsonb_build_object(
        'enabled', true,
        'escalation_path', ARRAY['DOMAIN_9', 'CHIEF_6']
      )
    ),
    jsonb_build_array(
      'problem_solving', 'collaboration', 'learning', 'self_testing',
      'qa_protocols', 'bug_tracking', 'quality_standards'
    ),
    '1.0.0',
    NULL
  );

-- Expected: 5 rows inserted
-- Checkpoint: Verify agent count = 106
-- SELECT COUNT(*) FROM agents;  -- Should be 106

-- ============================================================================
-- PHASE 3: Add Training Certification Fields
-- ============================================================================

-- Add new columns for training certification tracking
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS training_status VARCHAR(50) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS certified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS training_completion_date TIMESTAMP,
  ADD COLUMN IF NOT EXISTS certification_level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS training_achievements JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS patterns_mastered JSONB DEFAULT '[]';

-- Add indexes for efficient certification queries
CREATE INDEX IF NOT EXISTS agents_training_status_idx ON agents(training_status);
CREATE INDEX IF NOT EXISTS agents_certified_idx ON agents(certified);
CREATE INDEX IF NOT EXISTS agents_certification_level_idx ON agents(certification_level);

-- ============================================================================
-- PHASE 4: Populate Training Certification Data from APPENDIX O
-- ============================================================================

-- All 105 agents certified as of January 12, 2025 per APPENDIX O
UPDATE agents 
SET 
  training_status = 'completed',
  certified = true,
  training_completion_date = '2025-01-12 00:00:00'::timestamp,
  certification_level = CASE
    WHEN type = 'CEO' THEN 3  -- Level 3: Expert - Production Ready
    WHEN type = 'CHIEF' THEN 3  -- Level 3: Expert - Production Ready
    WHEN type = 'DOMAIN' THEN 2  -- Level 2: Intermediate - Operational
    WHEN type = 'LAYER' THEN 2  -- Level 2: Intermediate - Operational
    WHEN type = 'EXPERT' THEN 3  -- Level 3: Expert - Production Ready
    WHEN type = 'LIFE_CEO' THEN 2  -- Level 2: Intermediate - AI Integration
    WHEN type = 'OPERATIONAL' THEN 2  -- Level 2: Intermediate - Process Excellence
    ELSE 1  -- Level 1: Basic - Training Required
  END,
  training_achievements = CASE
    WHEN type = 'CEO' THEN 
      jsonb_build_array(
        'strategic_framework_governance',
        'conflict_resolution_mastery',
        'emergency_intervention_protocols'
      )
    WHEN type = 'CHIEF' THEN
      jsonb_build_array(
        'division_management_excellence',
        'resource_allocation_optimization',
        'cross_division_coordination'
      )
    WHEN type = 'DOMAIN' THEN
      jsonb_build_array(
        'cross_layer_integration',
        'performance_profiling',
        'agent_coordination'
      )
    WHEN type = 'LAYER' THEN
      jsonb_build_array(
        'layer_specific_expertise',
        'production_patterns',
        'peer_collaboration'
      )
    WHEN type = 'EXPERT' THEN
      jsonb_build_array(
        'deep_expertise_demonstration',
        'best_practices_library',
        'innovation_leadership'
      )
    WHEN type = 'LIFE_CEO' THEN
      jsonb_build_array(
        'openai_gpt4_integration',
        'semantic_memory_system',
        'personalized_dashboards'
      )
    WHEN type = 'OPERATIONAL' THEN
      jsonb_build_array(
        'process_excellence',
        'automation_workflows',
        'continuous_improvement'
      )
    ELSE '[]'::jsonb
  END;

-- Expected: 106 rows updated

-- ============================================================================
-- PHASE 5: Validation Queries
-- ============================================================================

-- Verify final agent count
-- Expected: 106 agents total
SELECT COUNT(*) as total_agents FROM agents;

-- Verify certification by type
SELECT 
  type,
  COUNT(*) as total,
  SUM(CASE WHEN certified THEN 1 ELSE 0 END) as certified,
  SUM(CASE WHEN certified THEN 0 ELSE 1 END) as not_certified
FROM agents
GROUP BY type
ORDER BY type;

-- Verify certification levels
SELECT 
  certification_level,
  COUNT(*) as agent_count,
  array_agg(DISTINCT type) as agent_types
FROM agents
GROUP BY certification_level
ORDER BY certification_level DESC;

-- Verify training completion
SELECT 
  training_status,
  COUNT(*) as agent_count
FROM agents
GROUP BY training_status;

-- ============================================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================================

/*
-- To rollback this migration:

-- Remove training certification fields
ALTER TABLE agents
  DROP COLUMN IF EXISTS training_status,
  DROP COLUMN IF EXISTS certified,
  DROP COLUMN IF EXISTS training_completion_date,
  DROP COLUMN IF EXISTS certification_level,
  DROP COLUMN IF EXISTS training_achievements,
  DROP COLUMN IF EXISTS patterns_mastered;

-- Drop indexes
DROP INDEX IF EXISTS agents_training_status_idx;
DROP INDEX IF EXISTS agents_certified_idx;
DROP INDEX IF EXISTS agents_certification_level_idx;

-- Remove operational agents
DELETE FROM agents WHERE id IN ('AGENT_63', 'AGENT_64', 'AGENT_65', 'AGENT_66', 'AGENT_67');

-- Note: Cannot restore deleted agents (test-agent and life-ceo duplicates)
-- If needed, restore from backup before running this migration
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Final Summary Report
SELECT 
  'Migration Complete' as status,
  (SELECT COUNT(*) FROM agents) as total_agents,
  (SELECT COUNT(*) FROM agents WHERE certified = true) as certified_agents,
  (SELECT COUNT(DISTINCT type) FROM agents) as agent_types,
  (SELECT MAX(training_completion_date) FROM agents) as last_certification_date;
