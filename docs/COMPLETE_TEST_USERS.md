# COMPLETE TEST USER INVENTORY

## **🎯 PRIMARY TEST USERS (Scott's Tour - Created Today)**
| ID | Email | Username | Role | Purpose |
|----|-------|----------|------|---------|
| 186 | scottplan@test.com | scottplan | user | **Primary tour user** |
| 187 | teacher@test.com | teachertest | user | Teacher role testing |
| 188 | venue@test.com | venuetest | user | Venue management testing |
| 189 | user@test.com | regularuser | user | Regular member testing |
| 190 | premium@test.com | premiumuser | user | Premium subscriber testing |

**Password:** `testpass123` (scottplan uses TEST_ADMIN_PASSWORD secret)

---

## **🔐 RBAC/ABAC TEST USERS (8 Tier System)**
Created Nov 12, 2025 for comprehensive role testing
| ID | Email | Username | Purpose |
|----|-------|----------|---------|
| 127 | test-free@rbac.test | testuser1 | Tier 1 - Free user |
| 128 | test-premium@rbac.test | testuser2 | Tier 2 - Premium member |
| 129 | test-community-leader@rbac.test | testuser3 | Tier 3 - Community leader |
| 130 | test-admin@rbac.test | testuser4 | Tier 4 - Admin |
| 131 | test-platform-contributor@rbac.test | testuser5 | Tier 5 - Platform contributor |
| 132 | test-platform-volunteer@rbac.test | testuser6 | Tier 6 - Platform volunteer |
| 133 | test-super-admin@rbac.test | testuser7 | Tier 7 - Super admin |
| 134 | test-god@rbac.test | testuser8 | Tier 8 - God (owner) |

**Password:** `testpass123`

---

## **👥 FRIENDSHIP TEST USERS (Social Graph Testing)**
Created Nov 1, 2025 for social feature validation
| ID | Email | Username | Character |
|----|-------|----------|-----------|
| 77 | alice@test.com | alice_tango | Alice - Social connector |
| 78 | bob@test.com | bob_milonga | Bob - Event organizer |
| 79 | carol@test.com | carol_abrazo | Carol - Teacher |
| 80 | david@test.com | david_vals | David - Venue owner |
| 81 | eve@test.com | eve_gancho | Eve - Premium member |

**Password:** `testpass123`  
**Use Case:** Friendship requests, mutual friends, social graph, recommendations

---

## **🔧 ADMIN & GOD USERS (Full Platform Access)**
| ID | Email | Username | Role | Created |
|----|-------|----------|------|---------|
| 15 | admin@mundotango.life | admin | god | Sep 11, 2025 |
| 106 | admin@mundotango.test | testadmin | god | Nov 3, 2025 |
| 138 | admin@test.com | admin-test-yKKsZw | super_admin | Nov 14, 2025 |
| 139 | reg-test-dUDM_m@test.com | regtest_dudm_m | super_admin | Nov 14, 2025 |
| 140 | admin-e2e@test.com | admin-e2e-OVTu | god | Nov 14, 2025 |
| 143 | playwright-god@test.com | playwright-god-test | god | Nov 15, 2025 |
| 147 | admin+5@mundotango.life | admin5mundotangol | god | Nov 18, 2025 |

---

## **📰 FEED TESTING USERS (Real-time Features)**
Created Oct 1, 2025 - 10 users in tester/friend pairs
| IDs | Email Pattern | Purpose |
|-----|---------------|---------|
| 16-17 | memfeed-tester/friend-1759329823* | Feed pair 1 |
| 18-19 | memfeed-tester/friend-1759329845* | Feed pair 2 |
| 20-21 | memfeed-tester/friend-1759329863* | Feed pair 3 |
| 22-23 | memfeed-tester/friend-1759329881* | Feed pair 4 |
| 24-25 | memfeed-tester/friend-1759329899* | Feed pair 5 |

**Use Case:** Real-time feed updates, WebSocket testing, concurrent posts

---

## **🏠 HOUSING TEST USERS (Marketplace Features)**
Created Nov 10, 2025
| IDs | Email Pattern | Purpose |
|-----|---------------|---------|
| 114-117 | housingtest*@example.com | Housing listings, bookings |
| 126 | test+seller+n9GXJJ@mundo.tango | Marketplace seller |

---

## **💰 PAYMENT TEST USERS (Stripe Integration)**
| ID | Email | Purpose |
|----|-------|---------|
| 92 | pricingadmin@test.com | Pricing management (super_admin) |
| 93 | testadmin@pricing.com | Pricing tests |
| 94 | stripetest@checkout.com | Stripe checkout flow |
| 95 | stripefinal@test.com | Stripe final validation |

---

## **🧪 E2E TEST USERS (Playwright/Automated)**
| ID | Email | Purpose |
|----|-------|---------|
| 72 | e2etest@example.com | General E2E tests |
| 108 | e2e+1762690919098@mtango.test | E2E user flows |
| 110 | test@example.com | Automated test runner |

---

## **📊 TOTAL TEST USERS: 75+**
- **RBAC/Role Testing:** 8 users (complete tier system)
- **Social Features:** 5 users (Alice, Bob, Carol, David, Eve)
- **Feed/Real-time:** 10 users (5 pairs)
- **Admin/God:** 7 users (full platform access)
- **Primary Tour:** 5 users (Scott + 4 roles)
- **Specialized:** 40+ users (housing, payments, E2E, misc)

---

## **🔑 DEFAULT PASSWORDS**
- **Most users:** `testpass123`
- **scottplan@test.com:** Uses `TEST_ADMIN_PASSWORD` secret
- **Admin users:** May use different passwords (check secrets)

---

## **✅ READY FOR TESTING**
All users verified, active, and ready for:
- ✅ Scott's 50-page tour
- ✅ Multi-user concurrent testing
- ✅ RBAC validation (8 tiers)
- ✅ Social graph testing
- ✅ Payment flows
- ✅ Real-time features
- ✅ E2E automation
