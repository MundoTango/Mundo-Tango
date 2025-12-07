#!/bin/bash
# Audio Conversation Integration Script
# MB.MD Pattern 52 + 46 + 48 Implementation
# Run this script from the project root directory

set -e  # Exit on error

echo "🎯 Audio Conversation Feature Integration"
echo "=========================================="
echo ""

# Check if we're in the right branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "feature/audio-conversation" ]; then
    echo "❌ Error: You must be on the feature/audio-conversation branch"
    echo "Current branch: $CURRENT_BRANCH"
    echo "Run: git checkout feature/audio-conversation"
    exit 1
fi

echo "✅ On correct branch: $CURRENT_BRANCH"
echo ""

# Step 1: Add audio routes import to server/routes.ts
echo "📝 Step 1: Adding audio conversation routes import..."

# Find the line with mrBlueContext and add our import after it
if grep -q "import audioConversationRoutes from './routes/audioConversation';" server/routes.ts; then
    echo "   ℹ️  Import already exists, skipping..."
else
    # Add import after line 39 (after mrBlueContext import)
    sed -i.bak "/import mrBlueContext from '.\/routes\/mrblue\/context';/a\\
import audioConversationRoutes from './routes/audioConversation';" server/routes.ts
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Added audio conversation import"
    else
        echo "   ⚠️  Could not auto-add import. Please add manually:"
        echo "      import audioConversationRoutes from './routes/audioConversation';"
    fi
fi

echo ""

# Step 2: Add route registration
echo "📝 Step 2: Registering audio conversation routes..."

if grep -q "app.use('/api/mrblue/audio', audioConversationRoutes);" server/routes.ts; then
    echo "   ℹ️  Route already registered, skipping..."
else
    # Find where other mrBlue routes are registered and add ours
    # Look for the pattern of mrBlue route registrations
    sed -i.bak "/app.use('\/api\/mrblue\/context', mrBlueContext);/a\\
  app.use('/api/mrblue/audio', audioConversationRoutes);" server/routes.ts
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Registered /api/mrblue/audio route"
    else
        echo "   ⚠️  Could not auto-register route. Please add manually:"
        echo "      app.use('/api/mrblue/audio', audioConversationRoutes);"
    fi
fi

echo ""

# Step 3: Add AudioConversationButton to PageLayout
echo "📝 Step 3: Adding AudioConversationButton to PageLayout..."

PAGELAYOUT_FILE="client/src/components/PageLayout.tsx"

if [ ! -f "$PAGELAYOUT_FILE" ]; then
    echo "   ℹ️  PageLayout.tsx not found, trying App.tsx instead..."
    PAGELAYOUT_FILE="client/src/App.tsx"
fi

if [ -f "$PAGELAYOUT_FILE" ]; then
    # Check if import already exists
    if grep -q "import { AudioConversationButton }" "$PAGELAYOUT_FILE"; then
        echo "   ℹ️  AudioConversationButton import already exists"
    else
        # Add import at the top with other imports
        sed -i.bak "/^import.*from.*components/a\\
import { AudioConversationButton } from '@/components/AudioConversationButton';" "$PAGELAYOUT_FILE"
        
        if [ $? -eq 0 ]; then
            echo "   ✅ Added AudioConversationButton import"
        else
            echo "   ⚠️  Could not auto-add import. Please add manually at the top:"
            echo "      import { AudioConversationButton } from '@/components/AudioConversationButton';"
        fi
    fi
    
    # Check if button JSX already exists
    if grep -q "<AudioConversationButton" "$PAGELAYOUT_FILE"; then
        echo "   ℹ️  AudioConversationButton JSX already exists"
    else
        echo "   ⚠️  Please manually add the button JSX:"
        echo "      <AudioConversationButton variant=\"floating\" />"
        echo "   Add it before the closing </div> or </> in your main layout"
    fi
else
    echo "   ⚠️  Could not find PageLayout.tsx or App.tsx"
    echo "   Please manually add:"
    echo "   1. Import: import { AudioConversationButton } from '@/components/AudioConversationButton';"
    echo "   2. JSX: <AudioConversationButton variant=\"floating\" />"
fi

echo ""

# Clean up backup files
echo "🧹 Cleaning up backup files..."
rm -f server/routes.ts.bak
rm -f "$PAGELAYOUT_FILE.bak"

echo ""
echo "✅ Integration Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Review the changes: git diff"
echo "2. Configure environment variables (.env):"
echo "   ELEVENLABS_API_KEY=your_key"
echo "   GROQ_API_KEY=your_key"
echo "3. Start the server: npm run dev"
echo "4. Test the feature following INTEGRATION_GUIDE.md"
echo ""
echo "📄 If any step failed (⚠️), review INTEGRATION_GUIDE.md for manual instructions"
echo ""
