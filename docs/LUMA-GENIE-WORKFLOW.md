# MB.MD Protocol: Luma Genie 3D Avatar Generation Workflow

## **CRITICAL DISCOVERY**

Your `LUMA_API_KEY` is for **Luma Dream Machine (video generation)**, NOT for Genie (3D models).

**Luma Genie** (text-to-3D):
- ✅ FREE web tool
- ✅ Generates GLB files in ~10 seconds
- ❌ NO public API (Enterprise only)
- 🌐 Access: https://lumalabs.ai/genie

---

## **🎯 RECOMMENDED WORKFLOW**

### **Option 1: Use Luma Genie Web Interface (FASTEST - 2 MIN)**

#### **Step 1: Generate Mr. Blue 3D Model**

1. Go to **https://lumalabs.ai/genie**
2. Login (Google/Apple/Discord)
3. Enter this prompt:

```
Professional AI companion character, bright turquoise cyan mohawk hairstyle with shaved sides, silver and turquoise jewelry on wrists and fingers, teal floral patterned blazer, warm medium skin tone, friendly approachable smile, Pixar animation quality, full body character, standing confident pose
```

4. Wait ~10 seconds
5. Click "Download" → Select **GLB format**
6. Save as `mr-blue-avatar.glb`

#### **Step 2: Integrate into Mundo Tango**

```bash
# Move downloaded file to project
mv ~/Downloads/mr-blue-avatar.glb client/public/models/

# Verify it's working
curl http://localhost:5000/api/avatar/info
# Should show: "modelExists": true
```

#### **Step 3: Switch to 3D Mode**

Edit `client/src/lib/avatarConfig.ts`:
```typescript
export const AVATAR_CONFIG = {
  mode: '3d',  // Changed from 'auto'
  // ... rest stays same
};
```

**Result:** Mr. Blue will render as fully interactive 3D Pixar avatar!

---

### **Option 2: Use Reference Photos with Luma Genie**

If you want Mr. Blue based on actual photos:

1. Go to https://lumalabs.ai/genie
2. Click **"Upload Reference Images"**
3. Upload 3-5 best photos from `attached_assets/`:
   - `image_1761861709743.png` (601KB - good quality)
   - `image_1761864695682.png` (526KB)
   - `image_1761865258532.png` (381KB)
   - `image_1761865330782.png` (325KB)

4. Add text prompt:
```
Pixar-style 3D character avatar matching reference photos, turquoise mohawk, jewelry, teal blazer, professional AI companion
```

5. Generate → Download GLB
6. Place in `client/public/models/mr-blue-avatar.glb`

---

### **Option 3: Automated Workflow (FUTURE)**

If Luma provides Enterprise API access:

```typescript
// This would require Enterprise plan contact
import { LumaGenieAPI } from '@luma/genie-sdk';

const genie = new LumaGenieAPI(process.env.LUMA_GENIE_API_KEY);

const model = await genie.generateFrom3D({
  prompt: "Mr. Blue Pixar avatar...",
  format: "glb"
});

await model.download('client/public/models/mr-blue-avatar.glb');
```

**Contact:** Enterprise team at lumalabs.ai for API access

---

## **🔧 CURRENT IMPLEMENTATION STATUS**

✅ **Ready:**
- React Three Fiber installed
- MrBlueAvatar3D component with GLB loader
- Error boundary with 2D fallback
- Avatar config system
- Backend API routes

⚠️ **Missing:**
- Actual `mr-blue-avatar.glb` file (generate via Luma Genie)

---

## **📊 REFERENCE PHOTOS AVAILABLE**

30+ Mr. Blue photos ready in `attached_assets/`:
- Best quality: `image_1761861709743.png` (601KB)
- Good variety of angles and expressions
- Suitable for Luma Genie reference upload

---

## **🚀 QUICK START (2 MINUTES)**

```bash
# 1. Generate at https://lumalabs.ai/genie
# 2. Download GLB file
# 3. Place in project:
mv ~/Downloads/*.glb client/public/models/mr-blue-avatar.glb

# 4. Test
curl http://localhost:5000/api/avatar/info
# {"modelExists":true}

# 5. Restart app
# Done! 3D avatar is live
```

---

## **💡 WHY THIS IS BETTER THAN API**

- ✅ FREE (no credits needed)
- ✅ FAST (10 seconds)
- ✅ HIGH QUALITY (Pixar-level)
- ✅ FULL CONTROL (edit prompt, iterate)
- ✅ NO QUOTA LIMITS

---

**Next Step:** Generate the GLB file via Luma Genie web interface, then we'll integrate it!
