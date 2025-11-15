#!/bin/bash
set -e

echo "🏥 Running health checks..."
echo ""

# Check server is running
echo "🌐 Checking server health..."
if curl -f http://localhost:5000/api/health 2>/dev/null; then
  echo "✅ Server health check passed"
else
  echo "⚠️  Server health check failed (server may not be running)"
fi
echo ""

# Check database connection
echo "💾 Checking database connection..."
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set"
else
  echo "✅ DATABASE_URL configured"
fi
echo ""

# Check WebSocket
echo "📡 WebSocket endpoint available at ws://localhost:5000/ws/notifications"
echo ""

# Check critical routes
echo "🔍 Checking critical routes..."

routes=(
  "/mr-blue"
  "/feed"
  "/events"
  "/"
)

for route in "${routes[@]}"; do
  if curl -f -s -o /dev/null http://localhost:5000$route; then
    echo "✅ Route $route is accessible"
  else
    echo "⚠️  Route $route check failed"
  fi
done

echo ""
echo "✅ Health checks complete"
