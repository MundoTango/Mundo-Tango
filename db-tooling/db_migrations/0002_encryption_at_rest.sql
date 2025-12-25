-- WAVE 7 TRACK 4: Encryption at Rest Migration (P0 #8)
-- Created: November 14, 2025
-- AES-256-GCM encryption for sensitive financial and health data
-- Reference: docs/handoff/ULTIMATE_ZERO_TO_DEPLOY_PART_8.md

-- ============================================================================
-- FINANCIAL DATA TABLES
-- ============================================================================

-- Financial Goals
CREATE TABLE IF NOT EXISTS financial_goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL, -- 'savings', 'investment', 'debt_reduction', 'retirement'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' NOT NULL, -- 'active', 'completed', 'abandoned'
  target_date TIMESTAMP,
  
  -- ENCRYPTED FIELD: Stores sensitive financial data as encrypted text
  -- Format: iv:tag:encrypted
  -- Decrypted structure: {targetAmount, currentAmount, currency, notes, milestones}
  encrypted_data TEXT NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS financial_goals_user_idx ON financial_goals(user_id);
CREATE INDEX IF NOT EXISTS financial_goals_status_idx ON financial_goals(status);
CREATE INDEX IF NOT EXISTS financial_goals_type_idx ON financial_goals(goal_type);

-- Budget Entries
CREATE TABLE IF NOT EXISTS budget_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES users(id), -- Will eventually reference budget_categories
  entry_type VARCHAR(20) NOT NULL, -- 'income', 'expense'
  date TIMESTAMP NOT NULL,
  merchant VARCHAR(255),
  
  -- ENCRYPTED FIELD: Stores sensitive transaction data
  -- Decrypted structure: {amount, description, currency, notes}
  encrypted_data TEXT NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS budget_entries_user_idx ON budget_entries(user_id);
CREATE INDEX IF NOT EXISTS budget_entries_category_idx ON budget_entries(category_id);
CREATE INDEX IF NOT EXISTS budget_entries_date_idx ON budget_entries(date);
CREATE INDEX IF NOT EXISTS budget_entries_type_idx ON budget_entries(entry_type);

-- Budget Categories
CREATE TABLE IF NOT EXISTS budget_categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(20),
  icon VARCHAR(50),
  
  -- ENCRYPTED FIELD: Stores budget limits and targets
  -- Decrypted structure: {monthlyLimit, yearlyTarget, notes}
  encrypted_data TEXT,
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS budget_categories_user_idx ON budget_categories(user_id);
CREATE INDEX IF NOT EXISTS budget_categories_name_idx ON budget_categories(name);

-- ============================================================================
-- HEALTH DATA TABLES
-- ============================================================================

-- Health Goals
CREATE TABLE IF NOT EXISTS health_goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL, -- 'weight_loss', 'muscle_gain', 'endurance', 'flexibility'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' NOT NULL,
  target_date TIMESTAMP,
  
  -- ENCRYPTED FIELD: Stores sensitive health metrics
  -- Decrypted structure: {targetWeight, currentWeight, bmi, bodyFat, measurements}
  encrypted_data TEXT NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS health_goals_user_idx ON health_goals(user_id);
CREATE INDEX IF NOT EXISTS health_goals_status_idx ON health_goals(status);
CREATE INDEX IF NOT EXISTS health_goals_type_idx ON health_goals(goal_type);

-- Health Metrics
CREATE TABLE IF NOT EXISTS health_metrics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TIMESTAMP NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- 'weight', 'blood_pressure', 'heart_rate', 'sleep'
  
  -- ENCRYPTED FIELD: Stores sensitive health measurements
  -- Decrypted structure: {value, unit, notes, additionalData}
  encrypted_data TEXT NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS health_metrics_user_idx ON health_metrics(user_id);
CREATE INDEX IF NOT EXISTS health_metrics_date_idx ON health_metrics(date);
CREATE INDEX IF NOT EXISTS health_metrics_type_idx ON health_metrics(metric_type);

-- Nutrition Logs
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TIMESTAMP NOT NULL,
  meal_type VARCHAR(20) NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
  food_name VARCHAR(255) NOT NULL,
  
  -- ENCRYPTED FIELD: Stores sensitive nutrition data
  -- Decrypted structure: {calories, protein, carbs, fat, fiber, sugar, notes}
  encrypted_data TEXT NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS nutrition_logs_user_idx ON nutrition_logs(user_id);
CREATE INDEX IF NOT EXISTS nutrition_logs_date_idx ON nutrition_logs(date);
CREATE INDEX IF NOT EXISTS nutrition_logs_meal_type_idx ON nutrition_logs(meal_type);

-- Fitness Activities
CREATE TABLE IF NOT EXISTS fitness_activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TIMESTAMP NOT NULL,
  activity_type VARCHAR(100) NOT NULL, -- 'running', 'cycling', 'swimming', 'strength_training'
  duration INTEGER, -- in minutes (not encrypted - used for queries)
  
  -- ENCRYPTED FIELD: Stores detailed fitness metrics
  -- Decrypted structure: {distance, pace, heartRate, calories, notes, route}
  encrypted_data TEXT NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS fitness_activities_user_idx ON fitness_activities(user_id);
CREATE INDEX IF NOT EXISTS fitness_activities_date_idx ON fitness_activities(date);
CREATE INDEX IF NOT EXISTS fitness_activities_type_idx ON fitness_activities(activity_type);

-- ============================================================================
-- PAYMENT DATA TABLE
-- ============================================================================

-- User Payments (sensitive payment information)
CREATE TABLE IF NOT EXISTS user_payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_type VARCHAR(50) NOT NULL, -- 'subscription', 'event_ticket', 'housing', 'marketplace'
  status VARCHAR(20) DEFAULT 'pending' NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
  stripe_payment_intent_id VARCHAR(255),
  
  -- ENCRYPTED FIELD: Stores sensitive payment details
  -- Decrypted structure: {amount, currency, description, metadata, billingDetails}
  encrypted_data TEXT NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS user_payments_user_idx ON user_payments(user_id);
CREATE INDEX IF NOT EXISTS user_payments_status_idx ON user_payments(status);
CREATE INDEX IF NOT EXISTS user_payments_type_idx ON user_payments(payment_type);
CREATE INDEX IF NOT EXISTS user_payments_stripe_idx ON user_payments(stripe_payment_intent_id);

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================

-- ENCRYPTION IMPLEMENTATION:
-- 1. Algorithm: AES-256-GCM (Authenticated Encryption)
-- 2. Key Derivation: scrypt from ENCRYPTION_KEY or SESSION_SECRET env variable
-- 3. IV: Random 16 bytes per record (prevents pattern detection)
-- 4. Auth Tag: 16 bytes GCM tag (prevents tampering)
-- 5. Format: "iv:tag:encrypted" stored as TEXT in encrypted_data column
--
-- COMPLIANCE:
-- - GDPR Article 32: Security of Processing (encryption at rest)
-- - HIPAA Security Rule: Technical Safeguards (encryption of ePHI)
-- - PCI DSS Requirement 3: Protect Stored Cardholder Data
--
-- PERFORMANCE:
-- - Target: <10ms encryption/decryption overhead per operation
-- - Indexes on non-encrypted columns for query performance
-- - Encrypted_data excluded from SELECT * to minimize decryption
--
-- TESTING:
-- Run: `npm run test:encryption` to verify:
--   1. Data encrypted in database (unreadable without key)
--   2. API returns decrypted data correctly
--   3. Cannot decrypt without correct key
--   4. Performance within <10ms overhead

COMMENT ON TABLE financial_goals IS 'Stores encrypted financial goal data. Sensitive fields (amounts, details) encrypted with AES-256-GCM in encrypted_data column.';
COMMENT ON TABLE budget_entries IS 'Stores encrypted budget transaction data. Amounts and descriptions encrypted with AES-256-GCM.';
COMMENT ON TABLE budget_categories IS 'Stores encrypted budget category limits and targets with AES-256-GCM.';
COMMENT ON TABLE health_goals IS 'Stores encrypted health goal data. Weight, BMI, body measurements encrypted with AES-256-GCM.';
COMMENT ON TABLE health_metrics IS 'Stores encrypted health metric readings (weight, BP, HR, sleep) with AES-256-GCM.';
COMMENT ON TABLE nutrition_logs IS 'Stores encrypted nutrition data. Calories, macros, and details encrypted with AES-256-GCM.';
COMMENT ON TABLE fitness_activities IS 'Stores encrypted fitness activity data. Metrics, routes encrypted with AES-256-GCM.';
COMMENT ON TABLE user_payments IS 'Stores encrypted payment transaction data. Amounts, billing details encrypted with AES-256-GCM.';
