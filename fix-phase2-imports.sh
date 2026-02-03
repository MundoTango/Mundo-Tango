#!/bin/bash
# Comprehensive Phase 2 Import Fix Script
# Fixes all broken service imports after Phase 2 reorganization

set -e

echo "🔧 Starting comprehensive Phase 2 import fixes..."
echo "📍 Working directory: $(pwd)"

# Function to fix imports with both single and double quotes
fix_import() {
    local old_path="$1"
    local new_path="$2"
    echo "  ➜ Fixing: $old_path → $new_path"
    
    # Fix with double quotes
    find server -name "*.ts" -type f -exec sed -i '' "s|\"${old_path}\"|\"${new_path}\"|g" {} \;
    # Fix with single quotes
    find server -name "*.ts" -type f -exec sed -i '' "s|'${old_path}'|'${new_path}'|g" {} \;
}

echo ""
echo "1️⃣ Fixing core services..."
fix_import "../services/RBACService" "../services/core/RBACService"
fix_import "./services/RBACService" "./services/core/RBACService"
fix_import "../services/FeatureFlagService" "../services/core/FeatureFlagService"
fix_import "./services/FeatureFlagService" "./services/core/FeatureFlagService"
fix_import "../services/livestream-websocket" "../services/core/livestream-websocket"
fix_import "./services/livestream-websocket" "./services/core/livestream-websocket"

echo ""
echo "2️⃣ Fixing monitoring services..."
fix_import "../services/ProductionDatabaseService" "../services/monitoring/ProductionDatabaseService"
fix_import "./services/ProductionDatabaseService" "./services/monitoring/ProductionDatabaseService"
fix_import "../services/AnalyticsService" "../services/monitoring/AnalyticsService"
fix_import "./services/AnalyticsService" "./services/monitoring/AnalyticsService"
fix_import "../services/AgentValidationService" "../services/monitoring/AgentValidationService"
fix_import "./services/AgentValidationService" "./services/monitoring/AgentValidationService"

echo ""
echo "3️⃣ Fixing location/geography services..."
fix_import "../services/GeocodingService" "../services/domains/location/GeocodingService"
fix_import "./services/GeocodingService" "./services/domains/location/GeocodingService"
fix_import "../services/GeocodingService.ts" "../services/domains/location/GeocodingService"
fix_import "../../services/CityMatcherService" "../../services/domains/location/CityMatcherService"
fix_import "../services/CityMatcherService" "../services/domains/location/CityMatcherService"
fix_import "./services/city-group-data-ingestion" "./services/domains/location/city-group-data-ingestion"
fix_import "./services/cityscape-service" "./services/domains/location/cityscape-service"

echo ""
echo "4️⃣ Fixing event services..."
fix_import "../services/LiveStreamService" "../services/domains/events/LiveStreamService"
fix_import "./services/LiveStreamService" "./services/domains/events/LiveStreamService"
fix_import "../services/ScrapedEventIngestionService" "../services/domains/events/ScrapedEventIngestionService"
fix_import "../services/ScrapedEventIngestionService.ts" "../services/domains/events/ScrapedEventIngestionService"
fix_import "./services/ScrapedEventIngestionService" "./services/domains/events/ScrapedEventIngestionService"

echo ""
echo "5️⃣ Fixing social services..."
fix_import "../services/StoriesService" "../services/domains/social/StoriesService"
fix_import "./services/StoriesService" "./services/domains/social/StoriesService"
fix_import "../services/PostingPermissionService" "../services/domains/social/PostingPermissionService"
fix_import "./services/PostingPermissionService" "./services/domains/social/PostingPermissionService"
fix_import "./services/feedAlgorithm" "./services/domains/social/feedAlgorithm"
fix_import "../services/feedAlgorithm" "../services/domains/social/feedAlgorithm"

echo ""
echo "6️⃣ Fixing profile services..."
fix_import "./services/profile-enrichment" "./services/domains/profiles/profile-enrichment"
fix_import "../services/profile-enrichment" "../services/domains/profiles/profile-enrichment"
fix_import "./services/resume-parser" "./services/utils/resume-parser"
fix_import "../services/resume-parser" "../services/utils/resume-parser"

echo ""
echo "7️⃣ Fixing AI/integration services..."
fix_import "../services/didService" "../services/utils/didService"
fix_import "./services/didService" "./services/utils/didService"

echo ""
echo "8️⃣ Fixing scraping services..."
fix_import "../services/FacebookScraperService" "../services/domains/events/scraping/FacebookScraperService"
fix_import "./services/FacebookScraperService" "./services/domains/events/scraping/FacebookScraperService"

echo ""
echo "9️⃣ Fixing orchestration services..."
fix_import "../services/ConversationOrchestrator" "../services/orchestration/ai-orchestration/ConversationOrchestrator"
fix_import "./services/ConversationOrchestrator" "./services/orchestration/ai-orchestration/ConversationOrchestrator"

echo ""
echo "🔟 Fixing external integration services..."
fix_import "../services/GitHubSyncService" "../services/dev-tools/GitHubSyncService"
fix_import "./services/GitHubSyncService" "./services/dev-tools/GitHubSyncService"
fix_import "../services/JiraSyncService" "../services/dev-tools/JiraSyncService"
fix_import "./services/JiraSyncService" "./services/dev-tools/JiraSyncService"

echo ""
echo "1️⃣1️⃣ Fixing orchestration services..."
fix_import "../services/RecommendationEngine" "../services/orchestration/RecommendationEngine"
fix_import "./services/RecommendationEngine" "./services/orchestration/RecommendationEngine"
fix_import "../services/RevenueShareService" "../services/financial/RevenueShareService"
fix_import "./services/RevenueShareService" "./services/financial/RevenueShareService"

echo ""
echo "1️⃣2️⃣ Fixing self-healing services..."
fix_import "../services/SelfHealingService" "../services/self-healing/SelfHealingService"
fix_import "./services/SelfHealingService" "./services/self-healing/SelfHealingService"
fix_import "../services/PredictiveContextService" "../services/orchestration/PredictiveContextService"
fix_import "./services/PredictiveContextService" "./services/orchestration/PredictiveContextService"

echo ""
echo "✅ All import fixes complete!"
echo "📊 Summary:"
echo "   - Core services: RBACService, FeatureFlagService, livestream-websocket"
echo "   - Monitoring: ProductionDatabaseService, AnalyticsService, AgentValidationService"
echo "   - Location: GeocodingService, CityMatcherService, city-group-data-ingestion, cityscape-service"
echo "   - Events: LiveStreamService, ScrapedEventIngestionService"
echo "   - Social: StoriesService, PostingPermissionService, feedAlgorithm"
echo "   - Profiles: profile-enrichment, resume-parser"
echo "   - AI: didService, ConversationOrchestrator"
echo "   - Scraping: FacebookScraperService"
echo "   - External: GitHubSyncService, JiraSyncService"
echo "   - Business: RecommendationEngine, RevenueShareService"
echo "   - Operational: SelfHealingService, PredictiveContextService"
echo ""
echo "🚀 Ready to start dev server!"
