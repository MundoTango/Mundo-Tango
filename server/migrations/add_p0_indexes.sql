-- Performance indexes for P0 workflow tables

-- Feature Review Status indexes
CREATE INDEX IF NOT EXISTS idx_feature_review_status ON feature_review_status(status);
CREATE INDEX IF NOT EXISTS idx_feature_review_submitted_at ON feature_review_status(submitted_at DESC);

-- Safety Reviews indexes
CREATE INDEX IF NOT EXISTS idx_safety_reviews_status ON safety_reviews(status);
CREATE INDEX IF NOT EXISTS idx_safety_reviews_risk_level ON safety_reviews(risk_level);
CREATE INDEX IF NOT EXISTS idx_safety_reviews_target ON safety_reviews(target_type, target_id);

-- Support Tickets indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_human_review ON support_tickets(human_review_required) WHERE human_review_required = true;

-- Compound indexes
CREATE INDEX IF NOT EXISTS idx_feature_review_status_date ON feature_review_status(status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_safety_reviews_status_risk ON safety_reviews(status, risk_level);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status_priority ON support_tickets(status, priority);
