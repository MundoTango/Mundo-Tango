# 🚀 MundoTango Deployment Fix - December 2025

**Branch:** `fix/deployment-stripe-memory-dec2025`  
**Date:** December 6, 2025  
**Methodology:** MB.MD v9.9 (Simultaneously, Recursively, Critically)  
**Status:** 🔴 REQUIRES USER ACTION

---

## 📋 EXECUTIVE SUMMARY

This branch fixes **3 critical deployment blockers**:

1. **Stripe Integration** - Sandbox unclaimed, payments non-functional
2. **Build Memory Crash** - 6,336 modules exceed Autoscale's 2GB limit  
3. **React Context Error** - "useContext is null" in production builds

**Solution:** Switch to Reserved VM (4GB RAM) + Configure Stripe

---

## 🎯 CRITICAL USER ACTIONS

### ✅ Action 1: Claim Stripe Sandbox (5 min)

1. Visit: https://dashboard.stripe.com/acct_1R6baKBBjNDv1Tlz/confirm_claim/YWNjdF8xU1hVM282azhONlBLQ2hWLDE3NjQ3MTI1MDMv100qQ2JioGH
2. Click "Continue" → Select "Mundo Tango"
3. Dashboard → Developers → API Keys
4. Copy Live keys (pk_live_... and sk_live_...)

### ✅ Action 2: Configure Replit Secrets (2 min)

1. Replit → Publish → Deployment secrets
2. Add: `STRIPE_SECRET_KEY` = sk_live_...
3. Add: `VITE_STRIPE_PUBLIC_KEY` = pk_live_...

### ✅ Action 3: Switch to Reserved VM (1 min)

1. Replit → Publish → Deployment type
2. Select: Reserved VM  
3. Machine: 2 vCPU / 4 GiB RAM

---

## 🔬 ROOT CAUSE ANALYSIS

**Memory Crash:**
- 6,336+ modules loading simultaneously
- Autoscale limit: 2GB RAM
- Build needs: ~2GB+ (crashes)
- Solution: Reserved VM with 4GB RAM

**Stripe Issue:**
- Sandbox never claimed
- No API keys configured
- Solution: Complete Actions 1-2

**React Error:**
- Duplicate React instances in production bundle
- Vite bundling strategy issue
- Solution: Included in vite.config.ts updates

---

## 🚀 DEPLOYMENT STEPS

1. Complete Actions 1-3 above
2. In Replit Shell:
   ```bash
   git fetch origin
   git checkout fix/deployment-stripe-memory-dec2025
   git pull
   ```
3. Click "Publish" in Replit
4. Monitor build (~5-10 min)
5. Test at: https://mundotango.replit.app

---

## ✅ SUCCESS CRITERIA

- [ ] Stripe sandbox claimed
- [ ] API keys configured  
- [ ] Reserved VM selected
- [ ] Build completes
- [ ] App loads without errors
- [ ] Payments work

---

**Generated:** Dec 6, 2025 by Comet (MB.MD v9.9)  
**Status:** ⚠️ Awaiting user configuration
