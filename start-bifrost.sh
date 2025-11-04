#!/bin/bash
# Bifrost AI Gateway Startup Script
# MB.MD Protocol Implementation
# Date: November 4, 2025

echo "🌈 Starting Bifrost AI Gateway for Mundo Tango..."
echo ""
echo "Features enabled:"
echo "  ✅ Automatic failover (OpenAI → Anthropic → Bedrock)"
echo "  ✅ Semantic caching (60-80% cost savings)"
echo "  ✅ Load balancing across multiple API keys"
echo "  ✅ Budget management and observability"
echo ""

# Export configuration path
export BIFROST_CONFIG_PATH="./bifrost-config/bifrost.yaml"

# Start Bifrost (using npx for easy installation)
npx -y @maximhq/bifrost --config "$BIFROST_CONFIG_PATH" --port 8080

# Alternative: Use Docker for production
# docker run -p 8080:8080 \
#   -v ./bifrost-config:/config \
#   -e OPENAI_API_KEY="$OPENAI_API_KEY" \
#   -e GROQ_API_KEY="$GROQ_API_KEY" \
#   -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
#   maximhq/bifrost
