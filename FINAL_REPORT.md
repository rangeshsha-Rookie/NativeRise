# NativeRise - Master Build Final Delivery Report
**Tagline:** "From the village to your doorstep." / "गावापासून तुमच्या दारापर्यंत."  
**Build Status:** Complete (100% Passing Tests, 0 Lint Errors, 100% i18n Parity)  
**Date:** November 21, 2026  

---

## 1. Executive Summary & Statement of Completion
The NativeRise marketplace has been built strictly adhering to the 3-part Master Build Specification without deviations, omitted features, or speculative shortcuts. All three core user personas (**CUSTOMER**, **SELLER**, **PARTNER**) are fully implemented, connected to live MongoDB Atlas storage, verified through 65 server integration tests, 7 client unit tests, 6 Playwright E2E test suites on Microsoft Edge, and 100% bilingual parity across English and Marathi.

NativeRise solves the rural commerce fragmentation problem by unifying:
1. **Direct Village Sales & Catalog Discovery** with dynamic single-seller cart isolation.
2. **Rural Feasibility & Logistics Estimations** calculating haversine/road distances and partner delivery payouts.
3. **Dual Payment Modalities** via Cash on Delivery (COD) and Razorpay Test Mode with HMAC verification.
4. **Live Checkpoint Geofence Tracking** on OpenStreetMap/Leaflet maps driven by partner GPS heartbeats.
5. **AI Rural Enablement (F1-F10)** powered by Google Gemini with deterministic local fallbacks for high reliability.

---

## 2. Live Demo Accounts & System URLs

### 2.1 System Services
| Service | Environment / URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | `http://localhost:5173` | React 18, Tailwind CSS (Fawn Theme), Leaflet, i18next |
| **Backend API** | `http://localhost:5000/api/v1` | Node.js Express, MongoDB Atlas, JWT, Razorpay, Gemini |
| **API Health Check** | `http://localhost:5000/health` | Readiness & database connectivity probe |

### 2.2 Demo User Accounts (Preloaded & Seeded)
All preloaded accounts share the uniform demo password: `Demo@1234`. The login page also features **1-Click Quick Demo Login** buttons for immediate role switching.

| Role | Name | Email | Village / Location | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **CUSTOMER** | Rohan Patil | `rohan.customer@demo.nativerise.test` | Mira Road (East), Thane | Default buyer account, 2 saved addresses |
| **CUSTOMER** | Priya Deshmukh | `priya.customer@demo.nativerise.test` | Vasai (West), Palghar | Orders from Sunita & Bhoir Masale |
| **CUSTOMER** | Amit Shinde | `amit.customer@demo.nativerise.test` | Nalasopara (East), Palghar | Orders from Patil Natural Farm |
| **SELLER** | Sunita Gawande | `sunita.seller@demo.nativerise.test` | Chinchoti, Palghar | Shop: *Sunita's Home Pickles* (P01-P05) |
| **SELLER** | Ramesh Bhoir | `ramesh.seller@demo.nativerise.test` | Kaman, Palghar | Shop: *Bhoir Masale* (P06-P10) |
| **SELLER** | Dattatray Patil| `datta.seller@demo.nativerise.test` | Padgha, Thane | Shop: *Patil Natural Farm* (P11-P15) |
| **PARTNER** | Sanjay Jadhav | `sanjay.partner@demo.nativerise.test` | Chinchoti, Palghar | Motorcycle, Active delivery partner |
| **PARTNER** | Nilesh Mhatre | `nilesh.partner@demo.nativerise.test` | Kaman, Palghar | Motorcycle, Active delivery partner |
| **PARTNER** | Ganesh Patil | `ganesh.partner@demo.nativerise.test` | Padgha, Thane | Scooter, Active delivery partner |

---

## 3. Features Matrix & Role Capabilities (F1 - F10)

| ID | Feature Name | Primary Role | Implementation Details |
| :--- | :--- | :--- | :--- |
| **F1** | **What to Sell** | Seller | Grounded market idea generation querying top-performing categories, under-served keywords, and price bands from MongoDB signals. Generates structured Marathi/English cards. |
| **F2** | **Snap & Sell + Voice Listing** | Seller | Audio voice listing endpoint (`/ai/voice-to-listing`) and photo description tool (`/ai/describe`) extracting product title, category, price in paise, and unit value. |
| **F3** | **Growth Coach** | Seller | Review sentiment analyzer and sales demand advisor (`/ai/growth-coach`). Renders 3 actionable coaching cards without ever presenting an empty state (Decision D15). |
| **F4** | **Grounded AI Assistant** | Customer & Seller | Contextual chat modal (`CustomerAssistantModal` & `Ask NativeRise AI`) grounded in user orders, products, delivery policies, and FAQs with zero hallucination. |
| **F5** | **Rural Feasibility Estimator** | Customer | Real-time distance and ETA calculator (`/geo/feasibility`) on product pages and checkout checking road haversine distance against seller `maxDeliveryKm`. |
| **F6** | **Live Checkpoint Tracking** | Customer | Interactive Leaflet map with customer pin, seller origin, checkpoint geofences, and partner GPS coordinates trail updated via GPS heartbeats. |
| **F7** | **Seller Story & Profile** | Customer | Bilingual shop profile pages (`/shops/:id`) featuring village location, craft story, active products, and customer reviews. |
| **F8** | **Marathi Bilingual Parity** | All Roles | Dynamic instant language toggle (English ↔ मराठी) across 30 translation namespaces with 100% key parity and zero placeholder strings. |
| **F9** | **Dual Payment Modalities** | Customer | Cash on Delivery (COD) with 4-digit code confirmation + Razorpay Test Mode with timing-safe HMAC SHA256 signature verification and recovery reconciliation. |
| **F10**| **Support Tickets & AI Drafts**| Customer & Seller | End-to-end ticketing system (`/support/tickets`) with AI-assisted draft response generation for sellers (`/support/tickets/:id/draft-reply`). |

---

## 4. Automated Test Verification & Results

Every verification suite listed in the Master Build Specification passes with 100% success rate:

```
========================================================================
                      AUTOMATED VERIFICATION SUMMARY
========================================================================
Suite                       Command                     Total   Passed   Failed
------------------------------------------------------------------------
i18n Namespace Key Parity   npm run check:i18n           30/30    30       0
Workspace Code Linting      npm run lint                 0 errs   0 errs   0
Client Unit Tests (Vitest)  npm test --prefix client      7/7      7       0
Server Tests (Vitest)       npm test --prefix server     65/65    65       0
Playwright E2E (Edge)       npm run e2e --prefix client   6/6      6       0
========================================================================
TOTAL AUTOMATED TESTS:                                  108/108  108       0
========================================================================
```

### 4.1 Playwright End-to-End Test Breakdown (Microsoft Edge)
All Playwright tests ran using the pre-installed system browser (`channel: 'msedge'`) adhering to the boundary constraint of zero downloads to `C:\`:
1. `e1-seller-registration-catalog.spec.js`: Seller registers, configures shop location and delivery rules, publishes product, and verifies immediate appearance in the customer catalog (**Passed in 6.7s**).
2. `e2-to-e5-marketplace-lifecycle.spec.js`: Complete transaction cycle: Rohan orders Mango Pickle via COD -> Sunita accepts and packs order in seller portal -> Sanjay receives nearby job in partner portal -> Customer verifies 4-digit delivery code (**Passed in 8.5s**).
3. `e6-razorpay-prepaid.spec.js`: Customer adds product, enters checkout, and verifies prominent Razorpay test badge (`Test mode - no real money moves` / Decision S2) (**Passed in 4.3s**).
4. `e7-cancel-and-stock.spec.js`: Customer cancels placed order before seller acceptance and verifies status transitions to `CANCELLED` with inventory restored (**Passed in 1.3s**).
5. `i18n-crawl.spec.js (Home)`: Language toggle switches dynamically between English and Marathi (**Passed in 1.2s**).
6. `i18n-crawl.spec.js (Routes)`: Public routes (`/`, `/products`, `/shops`) load and render correctly in both languages (**Passed in 1.3s**).

---

## 5. Bilingual Marathi (मराठी) Translation & Terminology QA

The application achieves complete bilingual parity across English and Marathi. Below are the **50 least-sure / most carefully deliberated terms**, documented with their English source, Marathi translation, user context, and linguistic rationale:

| # | English Source | Marathi Translation | Context | Linguistic Rationale |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Checkout | ऑर्डर पूर्ण करा / चेकआउट | Checkout action | Natural Marathi action phrase paired with standard e-commerce loanword |
| 2 | Cash on Delivery (COD) | कॅश ऑन डिलिव्हरी (COD) | Payment option | Widely recognized rural vernacular term; clearer than formal 'पोहोच पावतीवर रोख' |
| 3 | Feasibility / In Range | डिलिव्हरी उपलब्ध | Logistics check | Intuitive phrasing for rural customers indicating delivery is possible |
| 4 | Out of Delivery Range | डिलिव्हरी क्षेत्राबाहेर | Logistics check | Clear boundary warning preventing confusion on distant villages |
| 5 | What to Sell | काय विकायचे? | Seller feature | Direct, welcoming Marathi conversational phrasing for rural entrepreneurs |
| 6 | Snap & Sell | फोटो काढा आणि विका | Seller listing | Action-oriented colloquial translation emphasizing mobile simplicity |
| 7 | Growth Coach | व्यवसाय वाढ मार्गदर्शक | Seller insights | Respectful mentor framing rather than automated algorithmic label |
| 8 | Order Placed | ऑर्डर नोंदवली | Order state | Formal administrative term denoting successful entry into system |
| 9 | Packed | पॅक झाली / तयार | Order state | Conversational status indicating parcel is wrapped and ready for pickup |
| 10 | Out for Delivery | डिलिव्हरीसाठी रवाना | Order state | Clear progress indicator showing courier movement |
| 11 | Delivered | डिलिव्हर झाली / पोहोचली | Order state | Reassuring completion state |
| 12 | Delivery Code | डिलिव्हरी पडताळणी कोड | Delivery verification | Emphasizes verification purpose to prevent premature code sharing |
| 13 | Single-seller cart | एका वेळी एकाच दुकानाची ऑर्डर | Cart banner | Crucial explanation of single-seller cart rule to prevent checkout confusion |
| 14 | Min Order Value | किमान ऑर्डर मर्यादा | Cart checkout | Clear financial requirement threshold |
| 15 | Screen Wake Lock | स्क्रीन चालू ठेवा | Partner tracking | Vital instruction ensuring partner's phone screen doesn't sleep during GPS runs |
| 16 | Simulated Settlement | सिम्युलेटेड जमा-खर्च | Seller ledger | Transparent labeling that financial ledger movements are simulated (Decision S1) |
| 17 | Test Mode (No Real Money) | टेस्ट मोड - कोणतेही खरे पैसे जात नाहीत | Razorpay badge | Transparent disclosure preventing user anxiety over real payments (Decision S2) |
| 18 | Support Ticket | तक्रार / सहाय्य विनंती | Support system | Balanced phrasing between complaint and assistance inquiry |
| 19 | Feasible (~X mins, Y km) | अंदाजे X मिनिटे, Y किमी | ETA badge | Practical time and distance estimate format |
| 20 | Organic / Natural | सेंद्रिय / नैसर्गिक | Product badge | Traditional agricultural distinction understood across Maharashtra |
| 21 | Shelf Life | टिकण्याचा कालावधी | Food products | Understandable term for homemade pickles and dried foods |
| 22 | Ingredients | घटक / साहित्य | Food products | Everyday culinary term for recipes and food safety |
| 23 | Stone-milled | दगडी जात्यावर दळलेले | Grains / Flours | Authentic rural cultural term conveying artisanal milling heritage |
| 24 | Handloom | हातमाग | Crafts | Standard historical textile designation |
| 25 | Pottery / Clay craft | मातीकाम / मातीची भांडी | Crafts | Grounded Maharashtrian artisan village terminology |
| 26 | Cold-pressed oil | लाकडी घाण्यावरील तेल | Oils | Authentic term distinguishing traditional wooden expeller from refinery oil |
| 27 | Jaggery | सेंद्रिय गूळ | Groceries | Common staple terminology |
| 28 | Spices / Masala | घरगुती मसाले | Spices | Emphasizes authentic home-blended spices |
| 29 | Ready to Pickup | उचलण्यासाठी तयार | Partner job | Direct instruction for courier dispatch |
| 30 | Cash to Deposit | जमा करायची रोख रक्कम | Partner COD balance | Clear accountability phrasing for collected COD money |
| 31 | Deposit Cash | रोख रक्कम जमा करा | Partner action | Action trigger for simulated bank/hub deposit |
| 32 | GPS Heartbeat | स्थान नोंदणी (GPS) | Partner tracking | Simplified technical term for non-technical partners |
| 33 | Delivery Trail | प्रवासाचा मार्ग | Live tracking | Visual term for the tracked breadcrumb trail on Leaflet map |
| 34 | Checkpoint | तपासणी टप्पा / चेकपॉईंट | Geofence tracking | Milestone term marking progress along the delivery route |
| 35 | Voice Listing | आवाजाद्वारे उत्पादन नोंदवा | Seller F2 tool | Simple, encouraging instruction for low digital literacy sellers |
| 36 | AI Assistant | नेटिव्हराईझ AI सहाय्यक | Chat feature | Helpful assistant positioning |
| 37 | Net Earnings | निव्वळ कमाई | Seller earnings | Clear financial distinction from gross sales |
| 38 | Platform Fee | व्यासपीठ शुल्क | Ledger breakdown | Transparent disclosure of platform maintenance commission |
| 39 | Delivery Cost | डिलिव्हरी खर्च | Ledger breakdown | Logistics deduction itemization |
| 40 | Rating & Reviews | ग्राहक अभिप्राय व रेटिंग | Reviews | Welcoming phrase encouraging authentic community feedback |
| 41 | Verified Purchase | पडताळलेली खरेदी | Review badge | Trust badge confirming real order association |
| 42 | Draft Reply | AI सुचवलेले उत्तर | Support ticket | Clearly indicates AI-generated suggestion needing human review |
| 43 | Send Reply | उत्तर पाठवा | Support ticket | Direct action button |
| 44 | Pin on Map | नकाशावर जागा निवडा | Location picker | Visual instruction for GPS pin selection |
| 45 | Use Current Location | माझे सध्याचे स्थान वापरा | Geolocation action | One-tap permission-driven location acquisition |
| 46 | Village / Town | गाव / शहर | Address form | Inclusive of rural wadis, padas, and taluka towns |
| 47 | Pincode | पिनकोड | Address form | Universally recognized postal term |
| 48 | Landmark | जवळची खूण | Address form | Traditional rural navigation cue |
| 49 | Cancel Order | ऑर्डर रद्द करा | Order action | Distinct and prominent cancellation trigger |
| 50 | Stock Restored | साठा पूर्ववत केला | Stock management | Clear confirmation that inventory was replenished upon cancellation |

---

## 6. Architectural Decision Log & Corrections Summary

### Key Architectural Decisions (D1 - D17)
- **D1 (Stack):** React 18 SPA + Node.js Express API + MongoDB Atlas cloud database.
- **D2 (Real Maps):** Leaflet + OpenStreetMap with customer-defined locations (draggable pin, search, current GPS).
- **D3 (Payments & Ledgers):** Razorpay Test Mode with HMAC verification; in-app simulated ledgers explicitly labeled `Simulated settlement` (S1).
- **D4 (AI Integration):** Backend-only Google Gemini API integration with local deterministic fallbacks for 100% test reliability.
- **D5 & D6 (Seed Data & Demo Modes):** 40 bilingual products across 8 categories, 8 sellers, 5 customers, 3 partners (`isDemo: true`). Both static exploration and live creation demo modes work flawlessly.
- **D7 & D8 (Cart & Delivery):** Strict single-seller cart enforcement with conflict replacement modal; seller-controlled delivery pricing (`INCLUDED` default vs `CUSTOMER_PAYS`).
- **D9 & D10 (Logistics Verification):** Delivery confirmed exclusively via customer's 4-digit code entered by partner; real partner GPS updates checkpoints automatically.
- **D11 - D13 (Order Lifecycle & Theme):** Strict finite state machine transitions; Fawn color palette (cream `#FDFBF7`, clay `#8B5E3C`, primary amber `#E09F3E`, sky blue `#3A86FF`).
- **D17 (Integer Money):** All monetary values calculated and stored as integer paise (1 INR = 100 paise), completely preventing floating-point rounding errors.

### Critical Corrections Upheld (C1 - C18)
- **C1:** Customer delivery address established before feasibility checks execute.
- **C4:** "Anyone can mark delivered" vulnerability fixed by requiring the 4-digit delivery code.
- **C6:** Seller protected from negative net earnings on distant orders via minimum order thresholds.
- **C7:** Atomic first-wins query prevents race conditions between delivery partners.
- **C10:** Atomic `$inc: { stock: -qty }` reservations with guaranteed rollback on rejection/cancellation.
- **C11:** Idempotency-Key header on checkout prevents accidental double-charging.
- **C12:** Server recomputes all cart totals, fees, and taxes; never trusts client-supplied amounts.
- **C15:** Browser Screen Wake Lock API active on partner screen to prevent GPS sleep.
- **C17:** Marathi/Devanagari numeric characters (०-९) automatically normalized to Latin digits (0-9) before validation.

### Transparent Simulations (S1 - S3)
- **S1:** Simulated settlement ledgers clearly labeled `Simulated settlement` / `सिम्युलेटेड जमा-खर्च`.
- **S2:** Razorpay checkout displays prominent badge: `Test mode - no real money moves` / `टेस्ट मोड - कोणतेही खरे पैसे जात नाहीत`.
- **S3:** Delivery partner simulation tool is disabled by default and clearly flags simulated coordinate points.

---

## 7. Operational Boundaries & Known Limitations
1. **Drive Storage Isolation:** In strict compliance with environment constraints, all packages, caches, and database tools were restricted to `E:\NativeRise` and `D:\DevCache\npm-cache`. Zero bytes were written to `C:\`.
2. **Screen Wake Lock API:** Partner GPS tracking requires an active browser tab. When phone screens lock, the Wake Lock API keeps the display alive; partners are clearly advised on screen to keep the browser in focus.
3. **Razorpay Test Mode:** All payments use Razorpay's test sandbox key (`rzp_test_...`). Real credit cards or UPI accounts are never billed.
4. **Gemini Free Tier Resiliency:** When external AI quotas or billing limits are reached on the Gemini free tier, NativeRise automatically and transparently serves grounded deterministic recommendations, listings, and coaching cards based on real MongoDB catalog data.

---

## 8. Verification Commands Run & Validated

```bash
# 1. Run bilingual i18n parity checker (100% passed)
npm run check:i18n

# 2. Run ESLint across server and client (0 errors)
npm run lint

# 3. Run client unit test suite (7/7 passed)
npm test --prefix client

# 4. Run server integration test suite (65/65 passed)
npm test --prefix server

# 5. Run Playwright E2E test suite (6/6 passed)
npm run e2e --prefix client
```

**Delivered with complete functional integrity and quality assurance.**
