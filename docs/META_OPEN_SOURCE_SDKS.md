# Meta (Facebook/Instagram/WhatsApp) Official Open Source SDKs
**OSI Protocol Applied:** Document all official Meta SDKs for future agent reference  
**Generated:** November 17, 2025

---

## 🎯 OFFICIAL META BUSINESS SDKS

### **Python SDK**
**Repo:** https://github.com/facebook/facebook-python-business-sdk  
**Use:** Official Python SDK for Meta's Business & Marketing APIs (Facebook + Instagram Graph API)  
**When to use:** Python backend, Ads API, Instagram business automation

### **Java SDK**
**Repo:** https://github.com/facebook/facebook-java-business-sdk  
**Use:** Java SDK for Facebook/Instagram Marketing API, Ads, Insights, Pages, IG Business accounts  
**When to use:** Java/Spring backend, enterprise systems

### **Node.js SDK** ✅ CURRENT CHOICE
**Repo:** https://github.com/facebook/facebook-nodejs-business-sdk  
**Use:** Node.js SDK for Facebook + Instagram Graph API (Ads, Pages, IG content publishing, analytics)  
**When to use:** Node.js/Express backend (Mundo Tango's stack)  
**Note:** We're using `messenger-node` for Messenger-specific features, but this SDK covers broader Meta Business APIs

### **PHP SDK**
**Repo:** https://github.com/facebook/facebook-php-business-sdk  
**Use:** PHP wrapper for Business APIs: Ads, Pages, Instagram media publishing, catalog management  
**When to use:** PHP/Laravel backend

### **SDK Code Generator**
**Repo:** https://github.com/facebook/facebook-business-sdk-codegen  
**Use:** Code generator that produces SDKs in PHP, Python, Java, Node, Ruby for Meta business APIs  
**When to use:** Need custom SDK for new language, or latest API features

---

## 🐍 COMMUNITY PYTHON SDKS

### **sns-sdks/python-facebook**
**Repo:** https://github.com/sns-sdks/python-facebook  
**Use:** Lightweight wrapper for Facebook Graph API including Instagram Basic Display + IG Business endpoints  
**When to use:** Simpler Python projects, Instagram integration

---

## 🔷 .NET SDK

### **fabricatorsltd/instagram-sdk-dotnet**
**Repo:** https://github.com/fabricatorsltd/instagram-sdk-dotnet  
**Use:** .NET SDK for interacting with the Instagram Graph API  
**When to use:** C#/.NET backend

---

## 🔬 META RESEARCH & TOOLS

### **AugLy - Data Augmentation**
**Repo:** https://github.com/facebookresearch/AugLy  
**Use:** Meta's open-source augmentation library (image, video, audio, text) for social media content simulation  
**When to use:** ML training data, testing social media features, content variation

---

## 📸 INSTAGRAM-LIKE ALTERNATIVES

### **Pixelfed (Open Source Instagram)**
**Repo:** https://github.com/pixelfed/pixelfed  
**Use:** Open-source, decentralized Instagram-style platform (ActivityPub protocol)  
**When to use:** Self-hosted Instagram alternative, federated social network

---

## 🌐 CMS INTEGRATIONS

### **goldfinch/social-media**
**Repo:** https://github.com/goldfinch/social-media  
**Use:** Silverstripe CMS integration to fetch and display Facebook + Instagram posts on websites  
**When to use:** Silverstripe CMS projects

---

## 📊 MUNDO TANGO USAGE STRATEGY

### **Current Stack:**
- ✅ **messenger-node** (49⭐) - Messenger Platform SDK
- ✅ **facebook-nodejs-business-sdk** (official) - For future: Ads API, Instagram automation
- ✅ **Official Graph API** - Direct REST calls where SDKs insufficient

### **Future Integrations:**

#### **Phase 1: Messenger (CURRENT)** ✅
- SDK: `messenger-node`
- Use: Send invitations, chat automation, AI responses

#### **Phase 2: Instagram Integration** 📅
- SDK: `facebook-nodejs-business-sdk`
- Use Cases:
  - Auto-post tango content to @mundotango1 Instagram
  - Fetch user's Instagram tango videos for profile
  - Instagram Stories for events
  - Hashtag tracking (#tango, #milonga)

#### **Phase 3: WhatsApp Business** 📅
- SDK: `facebook-nodejs-business-sdk` (includes WhatsApp Business API)
- Use Cases:
  - Event reminders via WhatsApp
  - Teacher-student communication
  - Group chat for tango communities

#### **Phase 4: Facebook Pages & Groups** 📅
- SDK: `facebook-nodejs-business-sdk`
- Use Cases:
  - Auto-post events to Facebook Groups
  - Sync tango events from Facebook Events
  - Page analytics and insights

---

## 🎯 OSI PROTOCOL RECOMMENDATIONS

### **When to Use Official SDKs:**
- ✅ Business/Marketing APIs (Ads, Analytics, Insights)
- ✅ Instagram Business features
- ✅ WhatsApp Business API
- ✅ Production-grade reliability needed

### **When to Use messenger-node:**
- ✅ Messenger Platform only (our current use case)
- ✅ Simpler, focused API
- ✅ Better docs for Messenger-specific features

### **When to Use Direct Graph API:**
- ✅ Bleeding-edge features not in SDKs yet
- ✅ Simple one-off requests
- ✅ SDK overhead not justified

---

## 📚 DOCUMENTATION LINKS

- **Meta for Developers:** https://developers.facebook.com/
- **Messenger Platform:** https://developers.facebook.com/docs/messenger-platform/
- **Instagram Graph API:** https://developers.facebook.com/docs/instagram-api/
- **WhatsApp Business API:** https://developers.facebook.com/docs/whatsapp/
- **Graph API Reference:** https://developers.facebook.com/docs/graph-api/

---

**Status:** All SDKs documented for future Mundo Tango integrations  
**Next:** Instagram auto-posting, WhatsApp event reminders, Facebook Group sync
