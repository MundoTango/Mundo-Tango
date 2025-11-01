#!/bin/bash

# Video generation IDs from the batch
declare -A VIDEOS=(
  [idle]="62b1355f-ab63-43f3-9387-817017cb0223"
  [listening]="f636187c-76f2-47ad-ace4-ab02433f2c89"
  [speaking]="e4cb32b7-cc5a-4511-b912-2c95778b4b31"
  [happy]="e053e35f-683a-4422-b66d-91cb12ddcd5e"
  [surprised]="01f35d89-d34d-4d67-8da0-7740a275d38c"
  [nodding]="3df42c06-916a-40ab-933f-4d05819053c5"
  [walk-left]="f81f6fc4-0289-4976-b969-c023d14ffdb1"
  [walk-right]="1f07499d-55f2-41fa-bbc8-e9658dff0259"
)

mkdir -p client/public/videos/states

for state in "${!VIDEOS[@]}"; do
  id="${VIDEOS[$state]}"
  echo "📥 Downloading $state video (ID: $id)..."
  
  # Get generation status with video URL
  response=$(curl -s "https://api.lumalabs.ai/dream-machine/v1/generations/$id" \
    -H "Authorization: Bearer $LUMA_API_KEY")
  
  # Extract video URL (using jq would be cleaner but keeping it simple)
  video_url=$(echo "$response" | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  if [ ! -z "$video_url" ]; then
    echo "✅ Found video URL: $video_url"
    curl -s "$video_url" -o "client/public/videos/states/$state.mp4"
    echo "✅ Downloaded $state.mp4"
  else
    echo "❌ No video URL for $state (may not be ready yet)"
  fi
done

echo ""
echo "📊 Downloaded videos:"
ls -lh client/public/videos/states/
