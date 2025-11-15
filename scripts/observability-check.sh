#!/bin/bash
set -e

echo "🔍 Checking Observability Setup..."

# Check OpenTelemetry instrumentation files
echo "📁 Checking instrumentation files..."
if [ -f "server/instrumentation.ts" ]; then
  echo "✅ server/instrumentation.ts found"
else
  echo "⚠️ server/instrumentation.ts not found"
fi

if [ -f "client/src/lib/telemetry.ts" ]; then
  echo "✅ client/src/lib/telemetry.ts found"
else
  echo "⚠️ client/src/lib/telemetry.ts not found"
fi

# Check environment variables
echo -e "\n📊 Checking observability configuration..."
if [ -n "$SIGNOZ_ENDPOINT" ]; then
  echo "✅ SIGNOZ_ENDPOINT: $SIGNOZ_ENDPOINT"
else
  echo "⚠️ SIGNOZ_ENDPOINT not configured (optional for dev)"
fi

# Check WebSocket server
echo -e "\n🔌 Checking WebSocket health..."
curl -s http://localhost:5000/api/health | grep -q "healthy" && echo "✅ Health endpoint responding" || echo "⚠️ Health endpoint not responding"

echo -e "\n✅ Observability check complete"
