# UX Journey Documentation

Complete visual documentation of MundoTango customer journeys for standard users (Tier 0-2).

## Quick Access

| Journey | Screenshots | Video |
|---------|-------------|-------|
| 1. Onboarding | [📸 View](./screenshots/01-onboarding/) | [🎬 Watch](./videos/01-onboarding.webm) |
| 2. Feed & Social | [📸 View](./screenshots/02-feed-social/) | [🎬 Watch](./videos/02-feed-social.webm) |
| 3. Events | [📸 View](./screenshots/03-events/) | [🎬 Watch](./videos/03-events.webm) |
| 4. Cities & Groups | [📸 View](./screenshots/04-cities-groups/) | [🎬 Watch](./videos/04-cities-groups.webm) |
| 5. Profile | [📸 View](./screenshots/05-profile/) | [🎬 Watch](./videos/05-profile.webm) |
| 6. Friends | [📸 View](./screenshots/06-friends/) | [🎬 Watch](./videos/06-friends.webm) |
| 7. Messages | [📸 View](./screenshots/07-messages/) | [🎬 Watch](./videos/07-messages.webm) |
| 8. Travel | [📸 View](./screenshots/08-travel/) | [🎬 Watch](./videos/08-travel.webm) |
| 9. Housing | [📸 View](./screenshots/09-housing/) | [🎬 Watch](./videos/09-housing.webm) |
| 10. Mr. Blue | [📸 View](./screenshots/10-mr-blue/) | [🎬 Watch](./videos/10-mr-blue.webm) |

## Standard User Access (Tier 0-2)

| Feature | Access Level |
|---------|--------------|
| Feed & Posts | ✅ Full access |
| Events | ✅ Browse, RSVP, check-in, create |
| Profile | ✅ View others, edit own |
| Friends & Messages | ✅ Full access |
| Cities & Groups | ✅ Full access |
| Travel | ✅ Full access |
| Housing | ✅ Browse only |
| Mr. Blue | ✅ Basic chat (10-50 msgs/hr) |
| VibeCoding | ❌ Tier 7+ only |
| Admin | ❌ No access |

## How to Share

### Option 1: GitHub
Push this branch and share the GitHub URL:
```
https://github.com/MundoTango/Mundo-Tango/tree/feature/ux-journey-docs/ux-journeys
```

### Option 2: Download ZIP
Download the `ux-journeys/` folder and share via:
- Google Drive
- Dropbox
- WeTransfer

### Option 3: Local Preview
```bash
# Open screenshots folder
open ux-journeys/screenshots/

# Play videos (macOS)
open ux-journeys/videos/01-onboarding.webm
```

## Regenerate Screenshots/Videos

```bash
# Ensure app is running
npm run dev

# Run capture script
npx playwright test ux-journeys/scripts/capture-journeys.ts

# Videos saved to test-results/, move to videos/
mv test-results/**/*.webm ux-journeys/videos/
```

## File Structure

```
ux-journeys/
├── README.md                    # This file
├── JOURNEY-MAP.md               # Detailed journey documentation
├── screenshots/
│   ├── 01-onboarding/           # PNG per step
│   ├── 02-feed-social/
│   ├── 03-events/
│   ├── 04-cities-groups/
│   ├── 05-profile/
│   ├── 06-friends/
│   ├── 07-messages/
│   ├── 08-travel/
│   ├── 09-housing/
│   └── 10-mr-blue/
├── videos/
│   └── *.webm                   # Full journey recordings
└── scripts/
    └── capture-journeys.ts      # Playwright automation
```

## Video Format Notes

- **Format:** WebM (VP8/VP9 codec)
- **Resolution:** 1280x720
- **Conversion to MP4:** `ffmpeg -i input.webm -c:v libx264 output.mp4`
- **Conversion to GIF:** `ffmpeg -i input.webm -vf "fps=10,scale=640:-1" output.gif`
