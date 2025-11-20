-- ============================================================================
-- COMPREHENSIVE AGENT REGISTRATION - 60+ Specialized AI Agents
-- MB.MD Protocol v9.2 - Agent-to-Agent (A2A) Orchestration System
-- ============================================================================

-- Clear existing agents (except vibecoding and code_generator which are already registered)
-- DELETE FROM agent_cards WHERE agent_id NOT IN ('vibecoding', 'code_generator');

-- ============================================================================
-- LIFE CEO SYSTEM - 16 Specialized Life Management Agents
-- ============================================================================

INSERT INTO agent_cards (agent_id, name, description, capabilities, input_schema, output_schema, methods, a2a_endpoint, version)
VALUES
-- 1. Career Coach
('life-ceo-career-coach', 'Career Coach', 'Professional Career Coach AI agent specializing in resume optimization, job search strategies, interview preparation, career path planning, and workplace dynamics', 
ARRAY['resume_review', 'interview_prep', 'career_planning', 'networking_advice'],
'{"type":"object","properties":{"userId":{"type":"number"},"message":{"type":"string"},"context":{"type":"string"}},"required":["userId","message"]}'::jsonb,
'{"type":"object","properties":{"response":{"type":"string"},"recommendations":{"type":"array"},"nextSteps":{"type":"array"}}}'::jsonb,
ARRAY['chat', 'getRecommendation', 'trackProgress'],
'/api/life-ceo/agents/career-coach',
'1.0.0'),

-- 2. Health Advisor
('life-ceo-health-advisor', 'Health Advisor', 'Health & Wellness advisor focusing on general wellness, preventive health habits, lifestyle recommendations, and connecting users with healthcare resources',
ARRAY['wellness_tips', 'health_tracking', 'habit_formation', 'resource_connection'],
'{"type":"object","properties":{"userId":{"type":"number"},"message":{"type":"string"},"healthGoals":{"type":"array"}},"required":["userId","message"]}'::jsonb,
'{"type":"object","properties":{"response":{"type":"string"},"recommendations":{"type":"array"},"resources":{"type":"array"}}}'::jsonb,
ARRAY['chat', 'getRecommendation', 'trackHealth'],
'/api/life-ceo/agents/health-advisor',
'1.0.0'),

-- 3. Financial Planner
('life-ceo-financial-planner', 'Financial Planner', 'Financial planning specialist for budgeting, savings goals, investment education, debt management, and retirement planning',
ARRAY['budgeting', 'savings_planning', 'investment_education', 'debt_management'],
'{"type":"object","properties":{"userId":{"type":"number"},"message":{"type":"string"},"financialGoals":{"type":"array"}},"required":["userId","message"]}'::jsonb,
'{"type":"object","properties":{"response":{"type":"string"},"plan":{"type":"object"},"actionItems":{"type":"array"}}}'::jsonb,
ARRAY['chat', 'getRecommendation', 'createBudget'],
'/api/life-ceo/agents/financial-planner',
'1.0.0'),

-- 4. Relationship Counselor
('life-ceo-relationship-counselor', 'Relationship Counselor', 'Relationship counseling specialist for communication skills, conflict resolution, building friendships, and social confidence',
ARRAY['communication_coaching', 'conflict_resolution', 'social_skills', 'boundary_setting'],
'{"type":"object","properties":{"userId":{"type":"number"},"message":{"type":"string"},"relationshipType":{"type":"string"}},"required":["userId","message"]}'::jsonb,
'{"type":"object","properties":{"response":{"type":"string"},"strategies":{"type":"array"},"exercises":{"type":"array"}}}'::jsonb,
ARRAY['chat', 'getRecommendation', 'analyzeConflict'],
'/api/life-ceo/agents/relationship-counselor',
'1.0.0'),

-- 5. Learning Tutor
('life-ceo-learning-tutor', 'Learning Tutor', 'Education specialist for study techniques, skill acquisition, course recommendations, and overcoming learning challenges',
ARRAY['study_planning', 'skill_development', 'course_selection', 'learning_optimization'],
'{"type":"object","properties":{"userId":{"type":"number"},"message":{"type":"string"},"skillGoal":{"type":"string"}},"required":["userId","message"]}'::jsonb,
'{"type":"object","properties":{"response":{"type":"string"},"learningPath":{"type":"array"},"resources":{"type":"array"}}}'::jsonb,
ARRAY['chat', 'getRecommendation', 'createLearningPath'],
'/api/life-ceo/agents/learning-tutor',
'1.0.0'),

-- 6. Creativity Mentor
('life-ceo-creativity-mentor', 'Creativity Mentor', 'Creativity specialist for project ideation, overcoming creative blocks, artistic skill development, and building creative habits',
ARRAY['creative_ideation', 'project_planning', 'skill_building', 'creative_confidence'],
'{"type":"object","properties":{"userId":{"type":"number"},"message":{"type":"string"},"projectType":{"type":"string"}},"required":["userId","message"]}'::jsonb,
'{"type":"object","properties":{"response":{"type":"string"},"ideas":{"type":"array"},"exercises":{"type":"array"}}}'::jsonb,
ARRAY['chat', 'getRecommendation', 'generateIdeas'],
'/api/life-ceo/agents/creativity-mentor',
'1.0.0'),

-- 7. Home Organizer
('life-ceo-home-organizer', 'Home Organizer', 'Home organization specialist for decluttering, cleaning routines, space optimization, and creating functional living spaces',
ARRAY['organization_systems', 'decluttering', 'maintenance_planning', 'space_optimization'],
'{"type":"object","properties":{"userId":{"type":"number"},"message":{"type":"string"},"spaceType":{"type":"string"}},"required":["userId","message"]}'::jsonb,
'{"type":"object","properties":{"response":{"type":"string"},"plan":{"type":"object"},"checklist":{"type":"array"}}}'::jsonb,
ARRAY['chat', 'getRecommendation', 'createOrganizationPlan'],
'/api/life-ceo/agents/home-organizer',
'1.0.0'),

-- 8. Travel Planner
('life-ceo-travel-planner', 'Travel Planner', 'Travel planning specialist for trip planning, budget travel, destination research, and cultural awareness',
ARRAY['trip_planning', 'destination_research', 'budget_optimization', 'itinerary_creation'],
'{"type":"object","properties":{"userId":{"type":"number"},"message":{"type":"string"},"destination":{"type":"string"},"budget":{"type":"number"}},"required":["userId","message"]}'::jsonb,
'{"type":"object","properties":{"response":{"type":"string"},"itinerary":{"type":"array"},"recommendations":{"type":"array"}}}'::jsonb,
ARRAY['chat', 'getRecommendation', 'createItinerary'],
'/api/life-ceo/agents/travel-planner',
'1.0.0'),

-- 9. Mindfulness Guide
('life-ceo-mindfulness-guide', 'Mindfulness Guide', 'Mindfulness specialist for meditation techniques, personal growth, self-reflection, and building resilience',
ARRAY['meditation_guidance', 'mindfulness_practices', 'self_reflection', 'values_alignment'],
'{"type":"object","properties":{"userId":{"type":"number"},"message":{"type":"string"},"practiceType":{"type":"string"}},"required":["userId","message"]}'::jsonb,
'{"type":"object","properties":{"response":{"type":"string"},"exercises":{"type":"array"},"reflections":{"type":"array"}}}'::jsonb,
ARRAY['chat', 'getRecommendation', 'guideMeditation'],
'/api/life-ceo/agents/mindfulness-guide',
'1.0.0'),

-- 10. Entertainment Curator
('life-ceo-entertainment-curator', 'Entertainment Curator', 'Entertainment specialist for personalized recommendations, content discovery, and activity planning',
ARRAY['content_recommendations', 'discovery', 'taste_profiling', 'activity_planning'],
'{"type":"object","properties":{"userId":{"type":"number"},"message":{"type":"string"},"preferences":{"type":"object"}},"required":["userId","message"]}'::jsonb,
'{"type":"object","properties":{"response":{"type":"string"},"recommendations":{"type":"array"},"activities":{"type":"array"}}}'::jsonb,
ARRAY['chat', 'getRecommendation', 'curate'],
'/api/life-ceo/agents/entertainment-curator',
'1.0.0'),

-- 11. Productivity Coach
('life-ceo-productivity-coach', 'Productivity Coach', 'Productivity specialist for time management, task prioritization, focus strategies, and habit building',
ARRAY['time_management', 'task_prioritization', 'habit_building', 'focus_strategies'],
'{"type":"object","properties":{"userId":{"type":"number"},"message":{"type":"string"},"goals":{"type":"array"}},"required":["userId","message"]}'::jsonb,
'{"type":"object","properties":{"response":{"type":"string"},"schedule":{"type":"object"},"tips":{"type":"array"}}}'::jsonb,
ARRAY['chat', 'getRecommendation', 'optimizeSchedule'],
'/api/life-ceo/agents/productivity-coach',
'1.0.0'),

-- 12. Fitness Trainer
('life-ceo-fitness-trainer', 'Fitness Trainer', 'Fitness specialist for workout plans, form coaching, goal tracking, and motivation',
ARRAY['workout_planning', 'form_coaching', 'goal_tracking', 'motivation'],
'{"type":"object","properties":{"userId":{"type":"number"},"message":{"type":"string"},"fitnessLevel":{"type":"string"},"goals":{"type":"array"}},"required":["userId","message"]}'::jsonb,
'{"type":"object","properties":{"response":{"type":"string"},"workoutPlan":{"type":"array"},"progressTracking":{"type":"object"}}}'::jsonb,
ARRAY['chat', 'getRecommendation', 'createWorkoutPlan'],
'/api/life-ceo/agents/fitness-trainer',
'1.0.0'),

-- 13. Nutrition Expert
('life-ceo-nutrition-expert', 'Nutrition Expert', 'Nutrition specialist for meal planning, nutrition education, recipe suggestions, and dietary goals',
ARRAY['meal_planning', 'nutrition_education', 'recipe_suggestions', 'dietary_goals'],
'{"type":"object","properties":{"userId":{"type":"number"},"message":{"type":"string"},"dietaryRestrictions":{"type":"array"},"goals":{"type":"array"}},"required":["userId","message"]}'::jsonb,
'{"type":"object","properties":{"response":{"type":"string"},"mealPlan":{"type":"array"},"recipes":{"type":"array"}}}'::jsonb,
ARRAY['chat', 'getRecommendation', 'createMealPlan'],
'/api/life-ceo/agents/nutrition-expert',
'1.0.0'),

-- 14. Sleep Specialist
('life-ceo-sleep-specialist', 'Sleep Specialist', 'Sleep optimization specialist for sleep hygiene, routine building, environment optimization, and sleep education',
ARRAY['sleep_hygiene', 'routine_building', 'environment_optimization', 'sleep_education'],
'{"type":"object","properties":{"userId":{"type":"number"},"message":{"type":"string"},"sleepChallenges":{"type":"array"}},"required":["userId","message"]}'::jsonb,
'{"type":"object","properties":{"response":{"type":"string"},"routine":{"type":"object"},"recommendations":{"type":"array"}}}'::jsonb,
ARRAY['chat', 'getRecommendation', 'createSleepRoutine'],
'/api/life-ceo/agents/sleep-specialist',
'1.0.0'),

-- 15. Stress Manager
('life-ceo-stress-manager', 'Stress Manager', 'Stress management specialist for stress assessment, coping strategies, relaxation techniques, and burnout prevention',
ARRAY['stress_assessment', 'coping_strategies', 'relaxation_techniques', 'burnout_prevention'],
'{"type":"object","properties":{"userId":{"type":"number"},"message":{"type":"string"},"stressTriggers":{"type":"array"}},"required":["userId","message"]}'::jsonb,
'{"type":"object","properties":{"response":{"type":"string"},"copingStrategies":{"type":"array"},"exercises":{"type":"array"}}}'::jsonb,
ARRAY['chat', 'getRecommendation', 'assessStress'],
'/api/life-ceo/agents/stress-manager',
'1.0.0'),

-- 16. Life CEO Coordinator
('life-ceo-coordinator', 'Life CEO Coordinator', 'Master orchestrator of all Life CEO agents, providing holistic life overview, coordinating recommendations across domains, and prioritizing focus areas',
ARRAY['holistic_planning', 'agent_coordination', 'priority_setting', 'balance_optimization'],
'{"type":"object","properties":{"userId":{"type":"number"},"message":{"type":"string"},"focusAreas":{"type":"array"}},"required":["userId","message"]}'::jsonb,
'{"type":"object","properties":{"response":{"type":"string"},"overallPlan":{"type":"object"},"agentRecommendations":{"type":"array"}}}'::jsonb,
ARRAY['chat', 'coordinateAgents', 'createHolisticPlan'],
'/api/life-ceo/agents/coordinator',
'1.0.0');

-- ============================================================================
-- MR. BLUE SYSTEM - 15 Specialized Development & Quality Agents
-- ============================================================================

INSERT INTO agent_cards (agent_id, name, description, capabilities, input_schema, output_schema, methods, a2a_endpoint, version)
VALUES
-- 1. Error Analysis Agent
('mr-blue-error-analysis', 'Error Analysis Agent', 'Bug categorization, similar bug detection, severity prediction, and error pattern analysis using AI-powered embeddings and classification',
ARRAY['bug_categorization', 'similarity_detection', 'severity_prediction', 'error_pattern_analysis'],
'{"type":"object","properties":{"bugId":{"type":"number"},"title":{"type":"string"},"description":{"type":"string"},"severity":{"type":"string"}},"required":["title","description"]}'::jsonb,
'{"type":"object","properties":{"type":{"type":"string"},"confidence":{"type":"number"},"reasoning":{"type":"string"},"similarBugs":{"type":"array"}}}'::jsonb,
ARRAY['categorizeBug', 'findSimilarBugs', 'predictSeverity'],
'/api/mrblue/agents/error-analysis',
'1.0.0'),

-- 2. Quality Validator Agent
('mr-blue-quality-validator', 'Quality Validator Agent', 'Content validation, profanity detection, spam filtering, code quality analysis, and improvement suggestions',
ARRAY['content_validation', 'profanity_detection', 'spam_filtering', 'code_quality_analysis'],
'{"type":"object","properties":{"text":{"type":"string"},"type":{"type":"string"},"code":{"type":"string"}},"required":["text"]}'::jsonb,
'{"type":"object","properties":{"isValid":{"type":"boolean"},"score":{"type":"number"},"issues":{"type":"array"},"suggestions":{"type":"array"}}}'::jsonb,
ARRAY['validatePostContent', 'suggestImprovements', 'analyzeCodeQuality'],
'/api/mrblue/agents/quality-validator',
'1.0.0'),

-- 3. Autonomous Agent
('mr-blue-autonomous', 'Autonomous Agent', 'Autonomous task execution, recursive improvement, goal decomposition, and self-healing capabilities',
ARRAY['autonomous_execution', 'goal_decomposition', 'recursive_improvement', 'self_healing'],
'{"type":"object","properties":{"goal":{"type":"string"},"context":{"type":"object"},"constraints":{"type":"array"}},"required":["goal"]}'::jsonb,
'{"type":"object","properties":{"status":{"type":"string"},"steps":{"type":"array"},"results":{"type":"object"},"improvements":{"type":"array"}}}'::jsonb,
ARRAY['executeGoal', 'decomposeTask', 'selfImprove'],
'/api/mrblue/agents/autonomous',
'1.0.0'),

-- 4. Tour Guide Agent
('mr-blue-tour-guide', 'Tour Guide Agent', 'Interactive product tours, feature onboarding, contextual help, and user guidance',
ARRAY['product_tours', 'feature_onboarding', 'contextual_help', 'user_guidance'],
'{"type":"object","properties":{"userId":{"type":"number"},"page":{"type":"string"},"feature":{"type":"string"}},"required":["userId","page"]}'::jsonb,
'{"type":"object","properties":{"tourSteps":{"type":"array"},"hints":{"type":"array"},"nextFeature":{"type":"string"}}}'::jsonb,
ARRAY['createTour', 'provideHint', 'trackProgress'],
'/api/mrblue/agents/tour-guide',
'1.0.0'),

-- 5. Avatar Agent
('mr-blue-avatar', 'Avatar Agent', 'AI-powered avatar generation, voice cloning, video creation, and personalized interactions',
ARRAY['avatar_generation', 'voice_cloning', 'video_creation', 'personalized_interactions'],
'{"type":"object","properties":{"userId":{"type":"number"},"voiceSample":{"type":"string"},"avatarPreferences":{"type":"object"}},"required":["userId"]}'::jsonb,
'{"type":"object","properties":{"avatarUrl":{"type":"string"},"voiceId":{"type":"string"},"videoUrl":{"type":"string"}}}'::jsonb,
ARRAY['generateAvatar', 'cloneVoice', 'createVideo'],
'/api/mrblue/agents/avatar',
'1.0.0'),

-- 6. Role Adapter Agent
('mr-blue-role-adapter', 'Role Adapter Agent', 'Dynamic role adaptation, permission management, context-aware responses, and personalized experiences',
ARRAY['role_adaptation', 'permission_management', 'context_awareness', 'personalization'],
'{"type":"object","properties":{"userId":{"type":"number"},"role":{"type":"string"},"context":{"type":"object"}},"required":["userId","role"]}'::jsonb,
'{"type":"object","properties":{"adaptedResponse":{"type":"string"},"permissions":{"type":"array"},"suggestions":{"type":"array"}}}'::jsonb,
ARRAY['adaptRole', 'checkPermissions', 'personalizeExperience'],
'/api/mrblue/agents/role-adapter',
'1.0.0'),

-- 7. Subscription Agent
('mr-blue-subscription', 'Subscription Agent', 'Subscription management, upgrade recommendations, usage tracking, and billing optimization',
ARRAY['subscription_management', 'upgrade_recommendations', 'usage_tracking', 'billing_optimization'],
'{"type":"object","properties":{"userId":{"type":"number"},"currentTier":{"type":"string"},"usage":{"type":"object"}},"required":["userId"]}'::jsonb,
'{"type":"object","properties":{"recommendations":{"type":"array"},"savingsOpportunities":{"type":"array"},"upgradeOptions":{"type":"array"}}}'::jsonb,
ARRAY['analyzeUsage', 'recommendUpgrade', 'optimizeBilling'],
'/api/mrblue/agents/subscription',
'1.0.0'),

-- 8. Solution Suggester Agent
('mr-blue-solution-suggester', 'Solution Suggester Agent', 'Problem analysis, solution generation, alternative approaches, and optimization suggestions',
ARRAY['problem_analysis', 'solution_generation', 'alternative_approaches', 'optimization'],
'{"type":"object","properties":{"problem":{"type":"string"},"context":{"type":"object"},"constraints":{"type":"array"}},"required":["problem"]}'::jsonb,
'{"type":"object","properties":{"solutions":{"type":"array"},"tradeoffs":{"type":"object"},"recommendations":{"type":"string"}}}'::jsonb,
ARRAY['analyzeProblem', 'generateSolutions', 'evaluateOptions'],
'/api/mrblue/agents/solution-suggester',
'1.0.0'),

-- 9. Progress Tracking Agent
('mr-blue-progress-tracker', 'Progress Tracking Agent', 'Goal tracking, milestone monitoring, progress visualization, and achievement notifications',
ARRAY['goal_tracking', 'milestone_monitoring', 'progress_visualization', 'achievement_notifications'],
'{"type":"object","properties":{"userId":{"type":"number"},"goalId":{"type":"number"},"progress":{"type":"number"}},"required":["userId","goalId"]}'::jsonb,
'{"type":"object","properties":{"currentProgress":{"type":"number"},"milestones":{"type":"array"},"achievements":{"type":"array"},"nextSteps":{"type":"array"}}}'::jsonb,
ARRAY['trackProgress', 'updateMilestone', 'celebrateAchievement'],
'/api/mrblue/agents/progress-tracker',
'1.0.0'),

-- 10. Agent Orchestrator
('mr-blue-orchestrator', 'Agent Orchestrator', 'Multi-agent coordination, workflow management, resource allocation, and distributed task execution',
ARRAY['agent_coordination', 'workflow_management', 'resource_allocation', 'distributed_execution'],
'{"type":"object","properties":{"task":{"type":"string"},"requiredAgents":{"type":"array"},"priority":{"type":"string"}},"required":["task"]}'::jsonb,
'{"type":"object","properties":{"orchestrationPlan":{"type":"object"},"agentAssignments":{"type":"array"},"status":{"type":"string"}}}'::jsonb,
ARRAY['orchestrate', 'allocateResources', 'monitorExecution'],
'/api/mrblue/agents/orchestrator',
'1.0.0'),

-- 11. Autofix Engine
('mr-blue-autofix', 'Autofix Engine', 'Automated bug fixing, code repair, dependency resolution, and error recovery',
ARRAY['auto_bug_fixing', 'code_repair', 'dependency_resolution', 'error_recovery'],
'{"type":"object","properties":{"error":{"type":"string"},"code":{"type":"string"},"context":{"type":"object"}},"required":["error","code"]}'::jsonb,
'{"type":"object","properties":{"fixed":{"type":"boolean"},"changes":{"type":"array"},"explanation":{"type":"string"}}}'::jsonb,
ARRAY['fixBug', 'repairCode', 'resolveDependencies'],
'/api/mrblue/agents/autofix',
'1.0.0'),

-- 12. Context Service
('mr-blue-context', 'Context Service', 'Semantic search, RAG capabilities, context extraction, and knowledge retrieval using LanceDB',
ARRAY['semantic_search', 'rag_capabilities', 'context_extraction', 'knowledge_retrieval'],
'{"type":"object","properties":{"query":{"type":"string"},"filters":{"type":"object"},"limit":{"type":"number"}},"required":["query"]}'::jsonb,
'{"type":"object","properties":{"results":{"type":"array"},"context":{"type":"string"},"relevanceScores":{"type":"array"}}}'::jsonb,
ARRAY['search', 'extractContext', 'retrieveKnowledge'],
'/api/mrblue/agents/context',
'1.0.0'),

-- 13. Git Commit Generator
('mr-blue-git-commit', 'Git Commit Generator', 'Automated commit message generation, code change analysis, and Git workflow optimization',
ARRAY['commit_message_generation', 'change_analysis', 'workflow_optimization'],
'{"type":"object","properties":{"changes":{"type":"array"},"context":{"type":"string"},"conventionalCommit":{"type":"boolean"}},"required":["changes"]}'::jsonb,
'{"type":"object","properties":{"commitMessage":{"type":"string"},"type":{"type":"string"},"scope":{"type":"string"},"breaking":{"type":"boolean"}}}'::jsonb,
ARRAY['generateCommitMessage', 'analyzeChanges', 'suggestBranch'],
'/api/mrblue/agents/git-commit',
'1.0.0'),

-- 14. Learning Coordinator
('mr-blue-learning', 'Learning Coordinator', 'Pattern learning, knowledge retention, curriculum management, and adaptive learning',
ARRAY['pattern_learning', 'knowledge_retention', 'curriculum_management', 'adaptive_learning'],
'{"type":"object","properties":{"userId":{"type":"number"},"learningGoal":{"type":"string"},"currentLevel":{"type":"string"}},"required":["userId","learningGoal"]}'::jsonb,
'{"type":"object","properties":{"curriculum":{"type":"array"},"nextLesson":{"type":"object"},"progress":{"type":"number"}}}'::jsonb,
ARRAY['createCurriculum', 'trackLearning', 'adaptDifficulty'],
'/api/mrblue/agents/learning',
'1.0.0'),

-- 15. Task Planner
('mr-blue-task-planner', 'Task Planner', 'Task decomposition, dependency analysis, timeline optimization, and execution planning',
ARRAY['task_decomposition', 'dependency_analysis', 'timeline_optimization', 'execution_planning'],
'{"type":"object","properties":{"goal":{"type":"string"},"deadline":{"type":"string"},"resources":{"type":"array"}},"required":["goal"]}'::jsonb,
'{"type":"object","properties":{"tasks":{"type":"array"},"dependencies":{"type":"object"},"timeline":{"type":"array"}}}'::jsonb,
ARRAY['decompose', 'analyzeDependencies', 'optimizeTimeline'],
'/api/mrblue/agents/task-planner',
'1.0.0');

-- ============================================================================
-- ORCHESTRATION SYSTEM - 6 Multi-Agent Coordination Agents
-- ============================================================================

INSERT INTO agent_cards (agent_id, name, description, capabilities, input_schema, output_schema, methods, a2a_endpoint, version)
VALUES
-- 1. A2A Protocol Service
('orchestration-a2a-protocol', 'A2A Protocol Service', 'Agent-to-Agent communication protocol, message routing, capability discovery, and inter-agent coordination',
ARRAY['message_routing', 'capability_discovery', 'agent_discovery', 'communication_protocol'],
'{"type":"object","properties":{"fromAgent":{"type":"string"},"toAgent":{"type":"string"},"method":{"type":"string"},"params":{"type":"object"}},"required":["fromAgent","toAgent","method"]}'::jsonb,
'{"type":"object","properties":{"response":{"type":"object"},"status":{"type":"string"},"executionTime":{"type":"number"}}}'::jsonb,
ARRAY['sendMessage', 'discoverAgents', 'routeMessage'],
'/api/a2a/protocol',
'1.0.0'),

-- 2. Sequential Orchestrator
('orchestration-sequential', 'Sequential Orchestrator', 'Sequential task execution, ordered workflows, step-by-step processing, and dependency-aware orchestration',
ARRAY['sequential_execution', 'ordered_workflows', 'step_processing', 'dependency_handling'],
'{"type":"object","properties":{"tasks":{"type":"array"},"context":{"type":"object"},"stopOnError":{"type":"boolean"}},"required":["tasks"]}'::jsonb,
'{"type":"object","properties":{"results":{"type":"array"},"status":{"type":"string"},"completedSteps":{"type":"number"}}}'::jsonb,
ARRAY['executeSequentially', 'handleDependencies', 'recoverFromError'],
'/api/orchestration/sequential',
'1.0.0'),

-- 3. Parallel Orchestrator
('orchestration-parallel', 'Parallel Orchestrator', 'Parallel task execution, concurrent workflows, load balancing, and distributed processing',
ARRAY['parallel_execution', 'concurrent_workflows', 'load_balancing', 'distributed_processing'],
'{"type":"object","properties":{"tasks":{"type":"array"},"maxConcurrency":{"type":"number"},"timeout":{"type":"number"}},"required":["tasks"]}'::jsonb,
'{"type":"object","properties":{"results":{"type":"array"},"status":{"type":"string"},"executionTime":{"type":"number"},"parallelism":{"type":"number"}}}'::jsonb,
ARRAY['executeParallel', 'balanceLoad', 'aggregateResults'],
'/api/orchestration/parallel',
'1.0.0'),

-- 4. Workflow Orchestrator
('orchestration-workflow', 'Workflow Orchestrator', 'Complex workflow management, state machines, conditional branching, and workflow persistence',
ARRAY['workflow_management', 'state_machines', 'conditional_branching', 'workflow_persistence'],
'{"type":"object","properties":{"workflowId":{"type":"string"},"definition":{"type":"object"},"initialState":{"type":"object"}},"required":["workflowId","definition"]}'::jsonb,
'{"type":"object","properties":{"workflowState":{"type":"object"},"status":{"type":"string"},"history":{"type":"array"}}}'::jsonb,
ARRAY['startWorkflow', 'pauseWorkflow', 'resumeWorkflow', 'getState'],
'/api/orchestration/workflow',
'1.0.0'),

-- 5. Intelligence Cycle Orchestrator
('orchestration-intelligence-cycle', 'Intelligence Cycle Orchestrator', 'MB.MD intelligence cycle management, Free Energy Principle, Active Inference, and Bayesian belief updating',
ARRAY['intelligence_cycle', 'free_energy_principle', 'active_inference', 'bayesian_updating'],
'{"type":"object","properties":{"observation":{"type":"object"},"priors":{"type":"object"},"cycleType":{"type":"string"}},"required":["observation"]}'::jsonb,
'{"type":"object","properties":{"posterior":{"type":"object"},"freeEnergy":{"type":"number"},"actions":{"type":"array"},"beliefs":{"type":"object"}}}'::jsonb,
ARRAY['updateBeliefs', 'minimizeFreeEnergy', 'selectAction'],
'/api/orchestration/intelligence-cycle',
'1.0.0'),

-- 6. Loop Orchestrator
('orchestration-loop', 'Loop Orchestrator', 'Continuous autonomous loops, background processing, scheduled tasks, and autonomous operations',
ARRAY['continuous_loops', 'background_processing', 'scheduled_tasks', 'autonomous_operations'],
'{"type":"object","properties":{"loopId":{"type":"string"},"interval":{"type":"number"},"task":{"type":"object"},"stopCondition":{"type":"object"}},"required":["loopId","task"]}'::jsonb,
'{"type":"object","properties":{"status":{"type":"string"},"iterations":{"type":"number"},"lastRun":{"type":"string"},"nextRun":{"type":"string"}}}'::jsonb,
ARRAY['startLoop', 'stopLoop', 'pauseLoop', 'getStatus'],
'/api/orchestration/loop',
'1.0.0');

-- ============================================================================
-- SELF-HEALING SYSTEM - 5 Autonomous Validation & Recovery Agents
-- ============================================================================

INSERT INTO agent_cards (agent_id, name, description, capabilities, input_schema, output_schema, methods, a2a_endpoint, version)
VALUES
-- 1. Agent Activation Service
('self-healing-activation', 'Agent Activation Service', 'Automatic agent activation based on page navigation, context detection, and proactive agent triggering',
ARRAY['auto_activation', 'context_detection', 'proactive_triggering', 'agent_routing'],
'{"type":"object","properties":{"page":{"type":"string"},"context":{"type":"object"},"userAction":{"type":"string"}},"required":["page"]}'::jsonb,
'{"type":"object","properties":{"activatedAgents":{"type":"array"},"reason":{"type":"string"},"confidence":{"type":"number"}}}'::jsonb,
ARRAY['activateAgents', 'detectContext', 'routeToAgent'],
'/api/self-healing/activation',
'1.0.0'),

-- 2. Self-Healing Service
('self-healing-core', 'Self-Healing Service', 'Autonomous error detection, root cause analysis, automated fixes, and preventive measures',
ARRAY['error_detection', 'root_cause_analysis', 'automated_fixes', 'preventive_measures'],
'{"type":"object","properties":{"error":{"type":"object"},"context":{"type":"object"},"autoFix":{"type":"boolean"}},"required":["error"]}'::jsonb,
'{"type":"object","properties":{"fixed":{"type":"boolean"},"rootCause":{"type":"string"},"fix":{"type":"object"},"prevention":{"type":"array"}}}'::jsonb,
ARRAY['detectError', 'analyzeRootCause', 'applyFix', 'preventRecurrence'],
'/api/self-healing/core',
'1.0.0'),

-- 3. UX Validation Service
('self-healing-ux-validation', 'UX Validation Service', 'UI/UX audit, accessibility checking, design consistency validation, and user flow analysis',
ARRAY['ux_audit', 'accessibility_checking', 'design_consistency', 'user_flow_analysis'],
'{"type":"object","properties":{"page":{"type":"string"},"html":{"type":"string"},"interactions":{"type":"array"}},"required":["page"]}'::jsonb,
'{"type":"object","properties":{"score":{"type":"number"},"issues":{"type":"array"},"recommendations":{"type":"array"},"accessibility":{"type":"object"}}}'::jsonb,
ARRAY['auditUX', 'checkAccessibility', 'validateDesign', 'analyzeUserFlow'],
'/api/self-healing/ux-validation',
'1.0.0'),

-- 4. Page Audit Service
('self-healing-page-audit', 'Page Audit Service', 'Comprehensive page analysis, performance auditing, SEO validation, and content quality checks',
ARRAY['page_analysis', 'performance_audit', 'seo_validation', 'content_quality'],
'{"type":"object","properties":{"url":{"type":"string"},"auditType":{"type":"string"},"depth":{"type":"string"}},"required":["url"]}'::jsonb,
'{"type":"object","properties":{"performanceScore":{"type":"number"},"seoScore":{"type":"number"},"issues":{"type":"array"},"recommendations":{"type":"array"}}}'::jsonb,
ARRAY['auditPage', 'analyzePerformance', 'validateSEO', 'checkContent'],
'/api/self-healing/page-audit',
'1.0.0'),

-- 5. Predictive Pre-Check Service
('self-healing-predictive', 'Predictive Pre-Check Service', 'Predictive error detection, proactive validation, risk assessment, and preventive recommendations',
ARRAY['predictive_detection', 'proactive_validation', 'risk_assessment', 'preventive_recommendations'],
'{"type":"object","properties":{"code":{"type":"string"},"context":{"type":"object"},"riskThreshold":{"type":"number"}},"required":["code"]}'::jsonb,
'{"type":"object","properties":{"risks":{"type":"array"},"predictions":{"type":"array"},"preventions":{"type":"array"},"confidence":{"type":"number"}}}'::jsonb,
ARRAY['predictErrors', 'assessRisk', 'recommendPrevention'],
'/api/self-healing/predictive',
'1.0.0');

-- ============================================================================
-- USER TESTING SYSTEM - 4 Quality Assurance Agents
-- ============================================================================

INSERT INTO agent_cards (agent_id, name, description, capabilities, input_schema, output_schema, methods, a2a_endpoint, version)
VALUES
-- 1. Bug Detector Agent
('user-testing-bug-detector', 'Bug Detector Agent', 'Automated bug detection, visual regression testing, interaction monitoring, and issue reporting',
ARRAY['bug_detection', 'visual_regression', 'interaction_monitoring', 'issue_reporting'],
'{"type":"object","properties":{"sessionId":{"type":"number"},"interactions":{"type":"array"},"screenshots":{"type":"array"}},"required":["sessionId"]}'::jsonb,
'{"type":"object","properties":{"bugs":{"type":"array"},"severity":{"type":"string"},"screenshots":{"type":"array"},"recommendations":{"type":"array"}}}'::jsonb,
ARRAY['detectBugs', 'analyzeInteractions', 'reportIssues'],
'/api/user-testing/bug-detector',
'1.0.0'),

-- 2. Live Observer Agent
('user-testing-live-observer', 'Live Observer Agent', 'Real-time session monitoring, user behavior analysis, pain point detection, and live feedback',
ARRAY['session_monitoring', 'behavior_analysis', 'pain_point_detection', 'live_feedback'],
'{"type":"object","properties":{"sessionId":{"type":"number"},"realTime":{"type":"boolean"},"metrics":{"type":"array"}},"required":["sessionId"]}'::jsonb,
'{"type":"object","properties":{"observations":{"type":"array"},"painPoints":{"type":"array"},"insights":{"type":"array"},"suggestions":{"type":"array"}}}'::jsonb,
ARRAY['observeSession', 'detectPainPoints', 'provideFeedback'],
'/api/user-testing/live-observer',
'1.0.0'),

-- 3. Session Scheduler Agent
('user-testing-scheduler', 'Session Scheduler Agent', 'Testing session scheduling, tester matching, availability management, and session coordination',
ARRAY['session_scheduling', 'tester_matching', 'availability_management', 'coordination'],
'{"type":"object","properties":{"testType":{"type":"string"},"duration":{"type":"number"},"requirements":{"type":"object"}},"required":["testType"]}'::jsonb,
'{"type":"object","properties":{"sessionId":{"type":"number"},"scheduledTime":{"type":"string"},"tester":{"type":"object"},"status":{"type":"string"}}}'::jsonb,
ARRAY['scheduleSession', 'matchTester', 'manageAvailability'],
'/api/user-testing/scheduler',
'1.0.0'),

-- 4. UX Pattern Agent
('user-testing-ux-pattern', 'UX Pattern Agent', 'UX pattern recognition, best practice validation, design trend analysis, and improvement suggestions',
ARRAY['pattern_recognition', 'best_practice_validation', 'trend_analysis', 'improvement_suggestions'],
'{"type":"object","properties":{"page":{"type":"string"},"interactions":{"type":"array"},"context":{"type":"object"}},"required":["page"]}'::jsonb,
'{"type":"object","properties":{"patterns":{"type":"array"},"bestPractices":{"type":"array"},"violations":{"type":"array"},"improvements":{"type":"array"}}}'::jsonb,
ARRAY['recognizePatterns', 'validateBestPractices', 'suggestImprovements'],
'/api/user-testing/ux-pattern',
'1.0.0');

-- ============================================================================
-- KNOWLEDGE SYSTEM - 4 Learning & Memory Agents
-- ============================================================================

INSERT INTO agent_cards (agent_id, name, description, capabilities, input_schema, output_schema, methods, a2a_endpoint, version)
VALUES
-- 1. Knowledge Auto-Saver
('knowledge-auto-saver', 'Knowledge Auto-Saver', 'Automated knowledge extraction, pattern mining, insight generation, and knowledge base updates',
ARRAY['knowledge_extraction', 'pattern_mining', 'insight_generation', 'kb_updates'],
'{"type":"object","properties":{"content":{"type":"string"},"context":{"type":"object"},"category":{"type":"string"}},"required":["content"]}'::jsonb,
'{"type":"object","properties":{"extracted":{"type":"array"},"patterns":{"type":"array"},"insights":{"type":"array"},"saved":{"type":"boolean"}}}'::jsonb,
ARRAY['extractKnowledge', 'minePatterns', 'generateInsights'],
'/api/knowledge/auto-saver',
'1.0.0'),

-- 2. Codebase Indexer
('knowledge-codebase-indexer', 'Codebase Indexer', 'AST parsing, code indexing, LanceDB embedding, and semantic code search',
ARRAY['ast_parsing', 'code_indexing', 'embedding_generation', 'semantic_search'],
'{"type":"object","properties":{"files":{"type":"array"},"language":{"type":"string"},"indexType":{"type":"string"}},"required":["files"]}'::jsonb,
'{"type":"object","properties":{"indexed":{"type":"number"},"embeddings":{"type":"number"},"searchable":{"type":"boolean"},"stats":{"type":"object"}}}'::jsonb,
ARRAY['parseCode', 'indexFiles', 'generateEmbeddings', 'search'],
'/api/knowledge/codebase-indexer',
'1.0.0'),

-- 3. Knowledge Base Manager
('knowledge-kb-manager', 'Knowledge Base Manager', 'Knowledge organization, retrieval, versioning, and knowledge graph management',
ARRAY['knowledge_organization', 'retrieval', 'versioning', 'graph_management'],
'{"type":"object","properties":{"query":{"type":"string"},"category":{"type":"string"},"version":{"type":"string"}},"required":["query"]}'::jsonb,
'{"type":"object","properties":{"results":{"type":"array"},"graph":{"type":"object"},"version":{"type":"string"},"relevance":{"type":"array"}}}'::jsonb,
ARRAY['organize', 'retrieve', 'updateVersion', 'buildGraph'],
'/api/knowledge/kb-manager',
'1.0.0'),

-- 4. Agent Knowledge Sync
('knowledge-agent-sync', 'Agent Knowledge Sync', 'Cross-agent knowledge sharing, distributed learning, knowledge synchronization, and collaborative intelligence',
ARRAY['knowledge_sharing', 'distributed_learning', 'synchronization', 'collaborative_intelligence'],
'{"type":"object","properties":{"fromAgent":{"type":"string"},"knowledge":{"type":"object"},"targetAgents":{"type":"array"}},"required":["fromAgent","knowledge"]}'::jsonb,
'{"type":"object","properties":{"synced":{"type":"array"},"conflicts":{"type":"array"},"merged":{"type":"object"},"status":{"type":"string"}}}'::jsonb,
ARRAY['shareKnowledge', 'syncAgents', 'resolveConflicts'],
'/api/knowledge/agent-sync',
'1.0.0');

-- ============================================================================
-- CLARIFICATION SYSTEM - 2 Question & Answer Agents
-- ============================================================================

INSERT INTO agent_cards (agent_id, name, description, capabilities, input_schema, output_schema, methods, a2a_endpoint, version)
VALUES
-- 1. Clarification Service
('clarification-service', 'Clarification Service', 'Ambiguity detection, clarifying question generation, answer collection, and requirement refinement',
ARRAY['ambiguity_detection', 'question_generation', 'answer_collection', 'requirement_refinement'],
'{"type":"object","properties":{"request":{"type":"string"},"context":{"type":"object"},"maxQuestions":{"type":"number"}},"required":["request"]}'::jsonb,
'{"type":"object","properties":{"isAmbiguous":{"type":"boolean"},"questions":{"type":"array"},"refined":{"type":"string"},"confidence":{"type":"number"}}}'::jsonb,
ARRAY['detectAmbiguity', 'generateQuestions', 'refineRequirement'],
'/api/clarification/service',
'1.0.0'),

-- 2. Question Generator
('clarification-question-gen', 'Question Generator', 'Intelligent question generation, context analysis, question ranking, and iterative refinement',
ARRAY['question_generation', 'context_analysis', 'question_ranking', 'iterative_refinement'],
'{"type":"object","properties":{"topic":{"type":"string"},"context":{"type":"object"},"questionType":{"type":"string"}},"required":["topic"]}'::jsonb,
'{"type":"object","properties":{"questions":{"type":"array"},"ranked":{"type":"array"},"priority":{"type":"array"},"reasoning":{"type":"array"}}}'::jsonb,
ARRAY['generate', 'analyzeContext', 'rankQuestions'],
'/api/clarification/question-gen',
'1.0.0');

-- ============================================================================
-- DEPLOYMENT & VALIDATION - 4 Production Readiness Agents
-- ============================================================================

INSERT INTO agent_cards (agent_id, name, description, capabilities, input_schema, output_schema, methods, a2a_endpoint, version)
VALUES
-- 1. Build Validator
('deployment-build-validator', 'Build Validator', 'Build verification, dependency checking, artifact validation, and deployment readiness assessment',
ARRAY['build_verification', 'dependency_checking', 'artifact_validation', 'readiness_assessment'],
'{"type":"object","properties":{"buildId":{"type":"string"},"artifacts":{"type":"array"},"environment":{"type":"string"}},"required":["buildId"]}'::jsonb,
'{"type":"object","properties":{"valid":{"type":"boolean"},"issues":{"type":"array"},"warnings":{"type":"array"},"ready":{"type":"boolean"}}}'::jsonb,
ARRAY['validateBuild', 'checkDependencies', 'assessReadiness'],
'/api/deployment/build-validator',
'1.0.0'),

-- 2. Deployment Readiness Service
('deployment-readiness', 'Deployment Readiness Service', 'Comprehensive deployment checks, health monitoring, rollback preparation, and go-live validation',
ARRAY['deployment_checks', 'health_monitoring', 'rollback_preparation', 'golive_validation'],
'{"type":"object","properties":{"environment":{"type":"string"},"checks":{"type":"array"},"critical":{"type":"boolean"}},"required":["environment"]}'::jsonb,
'{"type":"object","properties":{"ready":{"type":"boolean"},"score":{"type":"number"},"blockers":{"type":"array"},"warnings":{"type":"array"},"rollbackPlan":{"type":"object"}}}'::jsonb,
ARRAY['checkReadiness', 'monitorHealth', 'prepareRollback'],
'/api/deployment/readiness',
'1.0.0'),

-- 3. Quality Validator (Validation Service)
('validation-quality', 'Quality Validator', 'Code quality validation, test coverage analysis, linting, and code review automation',
ARRAY['quality_validation', 'coverage_analysis', 'linting', 'code_review'],
'{"type":"object","properties":{"files":{"type":"array"},"standards":{"type":"object"},"threshold":{"type":"number"}},"required":["files"]}'::jsonb,
'{"type":"object","properties":{"score":{"type":"number"},"coverage":{"type":"number"},"issues":{"type":"array"},"passed":{"type":"boolean"}}}'::jsonb,
ARRAY['validate', 'analyzeCoverage', 'reviewCode'],
'/api/validation/quality',
'1.0.0'),

-- 4. Recursive Improver
('validation-recursive-improver', 'Recursive Improver', 'Iterative quality improvement, recursive optimization, self-reflection, and continuous enhancement',
ARRAY['iterative_improvement', 'recursive_optimization', 'self_reflection', 'continuous_enhancement'],
'{"type":"object","properties":{"code":{"type":"string"},"metrics":{"type":"object"},"iterations":{"type":"number"}},"required":["code"]}'::jsonb,
'{"type":"object","properties":{"improved":{"type":"string"},"improvements":{"type":"array"},"metricsImproved":{"type":"object"},"iterations":{"type":"number"}}}'::jsonb,
ARRAY['improve', 'optimize', 'reflect', 'enhance'],
'/api/validation/recursive-improver',
'1.0.0');

-- ============================================================================
-- AI ARBITRAGE & INTELLIGENCE - 5 Advanced AI Agents
-- ============================================================================

INSERT INTO agent_cards (agent_id, name, description, capabilities, input_schema, output_schema, methods, a2a_endpoint, version)
VALUES
-- 1. Task Classifier
('ai-task-classifier', 'Task Classifier', 'Intelligent task classification, complexity assessment, model selection, and routing optimization',
ARRAY['task_classification', 'complexity_assessment', 'model_selection', 'routing_optimization'],
'{"type":"object","properties":{"task":{"type":"string"},"context":{"type":"object"},"requirements":{"type":"object"}},"required":["task"]}'::jsonb,
'{"type":"object","properties":{"category":{"type":"string"},"complexity":{"type":"string"},"recommendedModel":{"type":"string"},"confidence":{"type":"number"}}}'::jsonb,
ARRAY['classify', 'assessComplexity', 'selectModel'],
'/api/ai/task-classifier',
'1.0.0'),

-- 2. Model Selector
('ai-model-selector', 'Model Selector', 'AI model selection, performance prediction, cost optimization, and capability matching',
ARRAY['model_selection', 'performance_prediction', 'cost_optimization', 'capability_matching'],
'{"type":"object","properties":{"task":{"type":"string"},"budget":{"type":"number"},"latencyReq":{"type":"number"},"qualityReq":{"type":"number"}},"required":["task"]}'::jsonb,
'{"type":"object","properties":{"selectedModel":{"type":"string"},"expectedCost":{"type":"number"},"expectedLatency":{"type":"number"},"expectedQuality":{"type":"number"},"reasoning":{"type":"string"}}}'::jsonb,
ARRAY['select', 'predictPerformance', 'optimizeCost'],
'/api/ai/model-selector',
'1.0.0'),

-- 3. Cascade Executor
('ai-cascade-executor', 'Cascade Executor', 'Cascading AI execution, fallback management, multi-model orchestration, and quality assurance',
ARRAY['cascade_execution', 'fallback_management', 'multi_model_orchestration', 'quality_assurance'],
'{"type":"object","properties":{"task":{"type":"string"},"models":{"type":"array"},"qualityThreshold":{"type":"number"}},"required":["task","models"]}'::jsonb,
'{"type":"object","properties":{"result":{"type":"object"},"usedModel":{"type":"string"},"attempts":{"type":"number"},"cost":{"type":"number"},"quality":{"type":"number"}}}'::jsonb,
ARRAY['execute', 'fallback', 'orchestrate'],
'/api/ai/cascade-executor',
'1.0.0'),

-- 4. Cost Tracker
('ai-cost-tracker', 'Cost Tracker', 'AI cost tracking, budget management, usage analytics, and cost optimization recommendations',
ARRAY['cost_tracking', 'budget_management', 'usage_analytics', 'cost_optimization'],
'{"type":"object","properties":{"operation":{"type":"string"},"model":{"type":"string"},"tokens":{"type":"number"},"userId":{"type":"number"}},"required":["operation","model"]}'::jsonb,
'{"type":"object","properties":{"cost":{"type":"number"},"totalCost":{"type":"number"},"remaining":{"type":"number"},"recommendations":{"type":"array"}}}'::jsonb,
ARRAY['track', 'manageBudget', 'analyzeUsage', 'optimize'],
'/api/ai/cost-tracker',
'1.0.0'),

-- 5. Semantic Cache Service
('ai-semantic-cache', 'Semantic Cache Service', 'Semantic caching, embedding-based retrieval, cache optimization, and intelligent cache invalidation',
ARRAY['semantic_caching', 'embedding_retrieval', 'cache_optimization', 'smart_invalidation'],
'{"type":"object","properties":{"query":{"type":"string"},"similarityThreshold":{"type":"number"},"ttl":{"type":"number"}},"required":["query"]}'::jsonb,
'{"type":"object","properties":{"cached":{"type":"boolean"},"result":{"type":"object"},"similarity":{"type":"number"},"source":{"type":"string"}}}'::jsonb,
ARRAY['cache', 'retrieve', 'optimize', 'invalidate'],
'/api/ai/semantic-cache',
'1.0.0');

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Total agents registered: 60+
-- - LIFE CEO System: 16 agents
-- - Mr. Blue System: 15 agents  
-- - Orchestration System: 6 agents
-- - Self-Healing System: 5 agents
-- - User Testing System: 4 agents
-- - Knowledge System: 4 agents
-- - Clarification System: 2 agents
-- - Deployment & Validation: 4 agents
-- - AI Arbitrage & Intelligence: 5 agents
-- ============================================================================

SELECT COUNT(*) as total_agents FROM agent_cards;
