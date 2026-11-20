# NativeRise Decision Log & Architectural Notes

> **NOTE FOR OWNER / REVIEWER:**
> All Marathi translation files (`locales/mr/*.json`) and bilingual seed contents were machine-generated and must be reviewed by the owner / native Marathi speaker.

---

## 1. Environment & Storage Boundary Decisions

- **E-Drive Strict Workspace Boundary**: All project code, build outputs, node_modules, logs, and assets reside exclusively in `E:\NativeRise`.
- **D-Drive DevCache Policy**: All npm package caches are redirected to `D:\DevCache\npm-cache` via project `.npmrc`. No installations or temporary files are written to `C:\`.
- **Zero-Download E2E Testing with System Edge**: Playwright E2E tests use Microsoft Edge (`channel: 'msedge'`) pre-installed at `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`, avoiding 400MB+ Chromium binary downloads into `C:\Users\...\AppData`.

---

## 2. Core Specification Decisions (D1 - D17)

- **D1 (Tech Stack)**: React 18 (Vite, TailwindCSS) + Node.js (Express, Mongoose) + MongoDB Atlas.
- **D2 (Interactive Real Map)**: Leaflet + OpenStreetMap + OpenRouteService/OSRM. Customer sets their own location via Nominatim address search, browser GPS, or draggable pin.
- **D3 (Payments & Simulated Settlement)**: Razorpay Test Mode with prominent `"Test mode - no real money moves"` badges. Cash on Delivery (COD) fully supported with partner cash-tracking ledger. Seller settlements are simulated via in-app double-entry ledger marked `"Simulated settlement"`.
- **D4 (Backend-Grounded AI)**: Google Gemini Flash (`@google/genai`) invoked only from the backend with strict prompt grounding on real database documents.
- **D5 (Preloaded Bilingual Catalog)**: 40 products, 8 categories, 8 rural sellers, 5 customers, 3 delivery partners, bilingual Marathi & English, ratings, reviews, order history. All seed records tagged `isDemo: true`.
- **D6 (Dual Demo Modes)**: Mode 1 displays preloaded catalog and verified order history. Mode 2 supports live registration, listing, ordering, partner dispatch, code-based delivery, and review updates.
- **D7 (Single-Seller Cart Rule)**: Strictly one seller per cart. Adding an item from another seller triggers a conflict modal offering to start a new cart with the new seller or keep the existing cart.
- **D8 (Seller-Controlled Delivery Pricing)**: Default `INCLUDED` in product price (customer sees "Free delivery"; fee paid to partner from seller earnings). Optional `CUSTOMER_PAYS` mode where delivery fee is added to customer bill.
- **D9 (4-Digit Secure Delivery Code)**: Delivery confirmation requires the customer's 4-digit code shown on the order page, entered and verified by the delivery partner at the customer doorstep.
- **D10 (Real GPS Tracking)**: Tracking uses the delivery partner phone's browser GPS with Screen Wake Lock API. Automatic geofence checkpoint detection and real travelled breadcrumb trails.
- **D11 (Strict Order Lifecycle State Machine)**: Server-enforced order states (`PLACED` -> `ACCEPTED` / `REJECTED` -> `PACKED` -> `ASSIGNED` -> `PICKED_UP` -> `DELIVERED` / `DELIVERY_FAILED` / `CANCELLED`).
- **D12 (Marathi Toggle Placement)**: Single unified language switcher present on each role's home page (`/`, `/seller`, `/partner`) and authentication pages (`/login`, `/register`).
- **D13 (Fawn Design System)**: Cohesive palette featuring Fawn Cream (`#FBF8F3`), Surface (`#FFFFFF`), Ink (`#1C1917`), Line (`#E7E2DA`), Primary Ochre (`#D97706`), Clay Accent (`#B45309`), Bark Accent (`#451A03`), and Sky Blue (`#0284C7`).
- **D14 (Real Social Proof)**: Zero synthetic fake purchase popups. Verified buyer badges and order counts are computed strictly from completed MongoDB orders.
- **D15 (Zero Empty State for Growth Coach)**: New sellers see grounded market insights derived from similar category products across the platform rather than a blank screen.
- **D16 (Grounded AI Assistant)**: Customer and seller AI assistant modes answer queries strictly using live MongoDB context (order status, catalog products, delivery feasibility, support tickets).
- **D17 (Integer Paise Currency)**: All monetary figures are stored as integer paise (`₹1.00 = 100 paise`). Floating-point arithmetic for currency is strictly prohibited.

---

## 3. Critical Architectural Corrections Implemented (C1 - C18)

- **C1 (Location Prior to Delivery Feasibility)**: Customer location is established before running delivery feasibility checks.
- **C2 (Single-Seller Cart Enforcement)**: Server atomically rejects multi-seller cart additions with `CART_DIFFERENT_SELLER`.
- **C3 (Automatic GPS Geofence Checkpoints)**: Replaced manual checkpoint clicks with automatic GPS geofencing (300m shop departure, 1km nearing destination, 300m doorstep arrival).
- **C4 (Doorstep Delivery Code Verification)**: Partner cannot mark an order delivered without supplying the customer's 4-digit delivery code.
- **C5 (Delivery Cost Guarantee)**: Seller delivery mode guarantees partner payout regardless of customer delivery fee exemptions.
- **C6 (Negative Seller Net Protection)**: Server validates seller minimum order value (`minOrderPaise`) and ensures net seller payout is strictly positive before accepting order.
- **C7 (Atomic First-Wins Job Acceptance)**: MongoDB `findOneAndUpdate` condition `status: 'PACKED', partner: null` prevents race conditions when multiple partners accept the same order simultaneously.
- **C8 (Delivery Failure Flow)**: Explicit `DELIVERY_FAILED` state with partner failure reason and automated refund processing for prepaid orders.
- **C9 (COD Cash Liability Ledger)**: Partner ledger tracks collected cash on delivery and maintains a `"Cash to deposit"` balance with simulated deposit reconciliation.
- **C10 (Atomic Inventory Reservation & Restoral)**: Stock is decremented atomically during order placement and automatically restored if rejected, cancelled, or failed.
- **C11 (Idempotent Order Creation)**: Frontend generates an `Idempotency-Key` UUID for checkout requests; backend returns cached order if duplicate request received within window.
- **C12 (Server-Authoritative Pricing)**: Client cart prices are re-computed and validated against database catalog prices on order submission.
- **C13 (Prepaid Payment Reconciliation)**: Orders page reconciles payment state with Razorpay API if the customer closes the browser window or navigates away mid-payment.
- **C14 (Elimination of Artificial Urgency)**: Fake countdown timers and fictitious purchase popups completely prohibited.
- **C15 (Screen Wake Lock API)**: Partner tracking page requests `navigator.wakeLock` to prevent GPS throttling during delivery runs, with clear user instructions.
- **C16 (Demographic Delivery Geography)**: Seeded demo sellers and customers are situated within 15-35 km of each other across Palghar/Thane/Mumbai to ensure realistic delivery feasibility.
- **C17 (Devanagari Digit Normalization)**: All incoming Marathi numerals (०, १, २, ३, ४, ५, ६, ७, ८, ९) are converted to standard ASCII digits (0-9) prior to numeric schema validation.
- **C18 (Itemized Earnings Transparency)**: Seller earnings ledger displays line-by-line deduction (item total, 5% platform fee, delivery charge, net earnings).

---

## 4. Transparent Simulation Disclosures (S1 - S3)

- **S1 (Simulated Settlement)**: All seller and partner financial ledgers carry the visible label `"Simulated settlement"` / `"सिम्युलेटेड सेटलमेंट (नमुना हिशेब)"`.
- **S2 (Razorpay Test Mode)**: Checkout screens feature the prominent badge `"Test mode - no real money moves"` / `"टेस्ट मोड - कोणतेही खरे पैसे जात नाहीत"`.
- **S3 (Simulated Demo Drive)**: Partner page includes a simulation button when `DEMO_TOOLS_ENABLED=true` allowing mock GPS location progression along route coordinates.

---

## 5. Resilience & AI Fallback Architecture

- **Deterministic Fallbacks for Gemini Free Tier**: When Gemini free-tier rate limits (429/503) or network interruptions occur, the backend AI services (`whatToSell`, `growthCoach`, `snapAndSell`, `customerAssistant`, `draftTicketReply`) switch to high-quality deterministic heuristics based on live catalog data, ensuring the application remains 100% operational under all conditions.
