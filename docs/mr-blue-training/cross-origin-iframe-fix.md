# Mr. Blue Training: Cross-Origin Iframe Errors

## Error Pattern Recognition

**When you see these errors:**
```
SecurityError: Failed to read a named property 'document' from 'Window': Blocked a frame with origin...
SecurityError: Blocked a frame with origin "..." from accessing a cross-origin frame
DOMException: Permission denied to access property "document"
```

**This means:** Browser security (Same-Origin Policy) is blocking JavaScript from accessing iframe content.

---

## Common Scenarios

### ❌ **What Doesn't Work:**
```typescript
// FAILS: Direct iframe access is blocked
const iframe = document.querySelector('iframe');
const iframeDoc = iframe.contentDocument; // ❌ SecurityError
iframeDoc.addEventListener('click', handler); // ❌ Blocked
```

### ✅ **What Works:**
**Use postMessage API for cross-frame communication**

---

## Fix Pattern: postMessage Communication

### Step 1: Create Injector Script
```typescript
// lib/iframeInjector.ts
export const IFRAME_SELECTION_SCRIPT = `
  (function() {
    // Code that runs INSIDE the iframe
    document.addEventListener('click', (e) => {
      const data = {
        type: 'ELEMENT_SELECTED',
        element: e.target.tagName,
        id: e.target.id
      };
      
      // Send to parent via postMessage
      window.parent.postMessage(data, '*');
    });
  })();
`;

export function injectScript(iframe: HTMLIFrameElement) {
  try {
    const doc = iframe.contentDocument;
    if (!doc) return;
    
    const script = doc.createElement('script');
    script.textContent = IFRAME_SELECTION_SCRIPT;
    doc.head.appendChild(script);
  } catch (error) {
    console.error('Injection failed:', error);
  }
}
```

### Step 2: Listen in Parent Page
```typescript
// Parent page component
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'ELEMENT_SELECTED') {
      console.log('Element clicked:', event.data.element);
      // Handle the event
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);

// Inject script when iframe loads
const handleIframeLoad = () => {
  injectScript(iframeRef.current);
};

<iframe src="/page" onLoad={handleIframeLoad} />
```

---

## Why This Works

**postMessage API:**
- ✅ Explicitly designed for cross-frame communication
- ✅ Works across origins (even different domains)
- ✅ Browser security approved
- ✅ Bi-directional communication

**Script Injection:**
- ✅ Script runs in iframe's context (not blocked)
- ✅ Can access iframe's DOM fully
- ✅ Sends data to parent via postMessage

---

## Security Considerations

1. **Validate Message Origin:**
```typescript
if (event.origin !== 'https://expected-domain.com') return;
```

2. **Validate Message Type:**
```typescript
if (event.data?.type !== 'EXPECTED_TYPE') return;
```

3. **Sanitize Data:**
```typescript
const safeData = DOMPurify.sanitize(event.data.content);
```

---

## Common Use Cases

### Use Case 1: Element Selection in Iframe
**Problem:** Visual editor needs to detect clicks inside iframe
**Solution:** Inject click handler script via postMessage

### Use Case 2: Iframe-to-Parent Communication
**Problem:** Iframe needs to notify parent of events
**Solution:** Use `window.parent.postMessage(data, '*')`

### Use Case 3: Parent-to-Iframe Commands
**Problem:** Parent needs to trigger actions in iframe
**Solution:** iframe listens to `window.addEventListener('message', handler)`

---

## Diagnostic Steps

When debugging iframe errors:

1. **Check Console for SecurityError**
   - Look for "Blocked a frame" messages
   - Note which property access failed

2. **Verify Same-Origin**
   - Check if parent and iframe URLs match protocol/domain/port
   - Even same-origin can fail with certain sandbox attributes

3. **Check iframe Sandbox**
   - `<iframe sandbox="allow-scripts">` can block access
   - Remove or adjust sandbox attributes

4. **Test postMessage**
   - Add console.log in message handlers
   - Verify messages are sent/received

---

## Quick Fix Checklist

✅ Create iframe injector script
✅ Use postMessage for communication  
✅ Add message listener in parent
✅ Inject script on iframe load
✅ Validate message origin/type
✅ Test in browser console

---

## Examples in Codebase

**Reference Implementation:**
- `client/src/lib/iframeInjector.ts` - Script injection utility
- `client/src/pages/VisualEditorPage.tsx` - postMessage usage

**Key Functions:**
- `injectSelectionScript()` - Injects script into iframe
- `handleMessage()` - Receives postMessage events
- `IFRAME_SELECTION_SCRIPT` - Code that runs in iframe

---

## When to Use This Pattern

✅ **Use postMessage when:**
- Accessing iframe content
- Communicating between windows/frames
- Building visual editors with iframe previews
- Cross-domain widget integration

❌ **Don't use postMessage for:**
- Same-page component communication (use props/state)
- Server communication (use fetch/axios)
- Simple parent-child React components (use context/props)

---

## Training Complete ✅

Mr. Blue can now:
1. ✅ Recognize cross-origin iframe SecurityErrors
2. ✅ Implement postMessage communication pattern
3. ✅ Inject scripts safely into iframes
4. ✅ Debug iframe access issues
5. ✅ Apply security best practices

**Next time this error appears, Mr. Blue will:**
1. Identify it as a cross-origin issue
2. Suggest the postMessage solution
3. Generate the fix code automatically
