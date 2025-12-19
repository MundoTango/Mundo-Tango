# 🚀 Quick Start: Replit AI ↔ Mr. Blue Integration

## **1-Minute Setup**

### **Send a Message to Mr. Blue**
```bash
curl -X POST https://[YOUR_REPL_URL]/api/mrblue/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain the Free Energy Principle",
    "context": { "currentPage": "/", "mode": "text" }
  }'
```

### **Stream Live Vibecoding**
```javascript
const eventSource = new EventSource('/api/mrblue/stream');

eventSource.addEventListener('fileChange', (e) => {
  const change = JSON.parse(e.data);
  console.log(`📝 ${change.action} ${change.filePath}`);
});

eventSource.addEventListener('complete', (e) => {
  console.log('✅ Done!', JSON.parse(e.data));
});

// Send request
fetch('/api/mrblue/stream', {
  method: 'POST',
  body: JSON.stringify({
    message: "Create a user profile card",
    mode: "vibecoding"
  })
});
```

---

## **Key Endpoints**

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/mrblue/chat` | POST | Standard chat | ❌ |
| `/api/mrblue/stream` | POST | SSE streaming (vibecoding) | ❌ |
| `/api/mrblue/conversations` | GET/POST | Manage conversations | ✅ |
| `/api/mrblue/messages` | POST | Save messages | ✅ |
| `/api/mrblue/vibecoding/apply` | POST | Apply code changes | ❌ |
| `/api/mrblue/analyze-page` | POST | Autonomous self-healing | ❌ |

---

## **Live Vibecoding Demo**

**Request:**
```json
POST /api/mrblue/stream
{
  "message": "Create a login form with email, password, and Google OAuth",
  "mode": "vibecoding"
}
```

**SSE Response:**
```
event: progress
data: {"type":"thinking","message":"Planning component..."}

event: fileChange
data: {
  "filePath": "client/src/components/LoginForm.tsx",
  "action": "create",
  "newContent": "import { Button } from '@/components/ui/button'..."
}

event: complete
data: {"filesChanged":1,"summary":"Created LoginForm.tsx"}
```

**Result:** Real-time updates in Visual Editor with live preview! 🎬

---

## **Authentication**

1. **Login:**
```bash
curl -X POST https://[URL]/api/auth/login \
  -d '{"email":"test@example.com","password":"password123"}'
```

2. **Use Token:**
```javascript
fetch('/api/mrblue/conversations', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
```

---

## **Testing the Fix**

### **Test 1: Auth Loop Fixed ✅**
1. Login to the app
2. Wait 16+ minutes (access token expires in 15min)
3. Refresh the Visual Editor page
4. **Expected:** Token auto-refreshes, no redirect to login
5. **Check console:** Should see `[Auth] Access token expired, attempting refresh...`

### **Test 2: Chat Memory Persistence ✅**
1. Login and open Mr. Blue chat
2. Send a few messages
3. Refresh the page
4. **Expected:** Previous conversation loads automatically
5. **Check console:** Should see `[MrBlue] Loaded conversation history: X messages`

### **Test 3: Live Vibecoding Streaming 🎬**
1. Open Visual Editor
2. Trigger vibecoding: "Create a button component"
3. **Expected:** SSE events stream to chat, preview updates in real-time
4. **Check console:** Should see `[SSE] fileChange`, `[SSE] progress`, `[SSE] complete`

---

## **Next Steps**

- ✅ **Phase 1:** Auth fix complete
- ✅ **Phase 2:** Chat memory complete
- ✅ **Phase 3:** API integration documented
- 🚧 **Phase 4:** MB.MD learning (Free Energy Principle, Active Inference)
- 🚧 **Phase 5:** Apply MB.MD to Mr. Blue (Bayesian belief updating, Expected Free Energy)
- 🚧 **Phase 6:** Quality gates & Playwright tests (95%+ coverage)

---

## **Full Documentation**

See `docs/REPLIT_AI_MRBLUE_INTEGRATION.md` for:
- Complete API reference
- Autonomous agent orchestration
- Security & rate limiting
- Monitoring & observability
- MB.MD Protocol v9.2 integration
