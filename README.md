# NativeRise (गावापासून तुमच्या दारापर्यंत)
> **"From the village to your doorstep." / "गावापासून तुमच्या दारापर्यंत."**

NativeRise is a full-stack, production-grade, bilingual (English + Marathi) rural marketplace platform connecting rural micro-entrepreneurs, customers, and local delivery partners. It empowers village artisans, farmers, and home producers with AI-assisted product listing, fair pricing, single-seller cart logistics, real-time GPS tracking on Leaflet maps, and transparent financial ledgers.

---

## 🌟 Key Features

- **F1: What to Sell (Seller)** — Grounded AI product recommendations powered by Google Gemini, derived from local demand signals, unmet category searches, and regional resources.
- **F2: Snap & Sell + Voice Listing (Seller)** — Rural sellers can photograph items or speak product descriptions in Marathi or English to auto-populate product listings.
- **F3: Growth Coach (Seller)** — Actionable review sentiment analysis, demand forecasting, and inventory guidance. Zero empty states for newly registered sellers.
- **F4: Grounded AI Assistant** — In-app assistant operating in Customer mode (order tracking, product search, delivery feasibility) and Seller mode (inventory, earnings, performance), strictly grounded in MongoDB database context.
- **F5: Rural Delivery Feasibility Estimator** — Real-time distance and terrain feasibility checks using Leaflet, OpenStreetMap, and OSRM routing before order placement.
- **F6: Live Checkpoint-Based GPS Tracking** — Live delivery tracking with automated geofence milestones (pickup departure, destination nearing, doorstep arrival) using browser GPS and Screen Wake Lock API.
- **F7: Rural Artisan & Shop Profiles** — Dedicated storefront pages highlighting village origins, craft stories, verified customer reviews, and fulfillment radius.
- **F8: Complete Marathi Bilingual Parity (100%)** — Full i18n support across 30 distinct namespaces with zero untranslated UI elements, Devanagari numerals normalization, and instantaneous language switching.
- **F9: Flexible & Safe Payments** — Razorpay Test Mode integration with prominent test-mode badges, Cash on Delivery (COD) cash liability tracking, and automated refund handling on failure.
- **F10: Support Ticket Management with AI Drafting** — Direct customer-to-seller ticketing system with one-click AI draft replies grounded in order and policy details.

---

## 👥 Three Specialized Roles

| Role | Access Route | Key Capabilities |
| :--- | :--- | :--- |
| **CUSTOMER** | `/` | Browse 8 rural categories, search products, add to single-seller cart, checkout via COD/Razorpay, track orders live on OpenStreetMap, submit ratings/reviews, chat with assistant. |
| **SELLER** | `/seller` | Shop management, stock control, accept/pack/reject orders, AI product generator (Snap & Sell / Voice Listing), Growth Coach, simulated earnings ledger, support tickets. |
| **PARTNER** | `/partner` | Online/offline toggle, GPS heartbeat, first-wins job acceptance within delivery radius, route navigation, 4-digit customer delivery code verification, COD cash deposit ledger. |

---

## 🔑 Demo Accounts Table

All demo accounts are pre-seeded with ratings, reviews, and transaction histories. The default password for all demo accounts is **`Demo@1234`**.

| Role | Email | Password | Name / Shop / Vehicle | Location / Village |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** | `rohan.customer@demo.nativerise.test` | `Demo@1234` | Rohan Patil | Mira Road East, Thane |
| **Customer** | `priya.customer@demo.nativerise.test` | `Demo@1234` | Priya Deshmukh | Vasai West, Palghar |
| **Customer** | `amit.customer@demo.nativerise.test` | `Demo@1234` | Amit Sharma | Dahisar East, Mumbai |
| **Seller** | `sunita.seller@demo.nativerise.test` | `Demo@1234` | Sunita's Home Pickles | Chinchoti, Palghar |
| **Seller** | `ramesh.seller@demo.nativerise.test` | `Demo@1234` | Sahyadri Organic Honey | Kaman, Vasai |
| **Seller** | `anita.seller@demo.nativerise.test` | `Demo@1234` | Anita's Warli Art Studio | Manor, Palghar |
| **Partner** | `sanjay.partner@demo.nativerise.test` | `Demo@1234` | Sanjay Jadhav (Bike: MH04AB1234) | Mira Road Station |
| **Partner** | `vikas.partner@demo.nativerise.test` | `Demo@1234` | Vikas Rane (Bike: MH04CD5678) | Vasai West Depot |

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Leaflet & React-Leaflet, i18next & react-i18next, React Router v6, TanStack Query.
- **Backend**: Node.js (ESM), Express.js, Mongoose, MongoDB Atlas, JSON Web Tokens (JWT), Bcrypt.js, Zod schema validation.
- **AI & Vision**: Google Gemini 2.5 Flash via `@google/genai` (backend-only invocation with deterministic resilient fallbacks).
- **Logistics & Geocoding**: OpenStreetMap tiles, Nominatim geocoding, OSRM routing engine with Haversine distance caching.
- **Payments**: Razorpay Node SDK (Test Mode) + In-App Double-Entry Ledger.
- **Testing**: Vitest, React Testing Library, Supertest, Playwright E2E.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ (tested on Node.js v20+)
- MongoDB Atlas cluster or local MongoDB instance
- Git

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd NativeRise
   ```

2. **Install root dependencies:**
   ```bash
   npm install
   npm run install:all
   ```

3. **Configure Environment Variables:**
   Ensure `server/.env` is configured with valid credentials:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=<your-mongodb-atlas-uri>
   JWT_SECRET=supersecretjwtkeyatleast32chars
   CLIENT_ORIGIN=http://localhost:5173
   RAZORPAY_KEY_ID=rzp_test_YourKeyId
   RAZORPAY_KEY_SECRET=YourKeySecret
   GEMINI_API_KEY=AIzaSy...
   GEMINI_MODEL=gemini-2.5-flash
   CLOUDINARY_CLOUD_NAME=nativerise
   CLOUDINARY_API_KEY=1234567890
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   NOMINATIM_USER_AGENT=NativeRise-App/1.0
   DEMO_TOOLS_ENABLED=true
   STRICT_GEOFENCE=false
   SEED_DEMO_PASSWORD=Demo@1234
   ```

4. **Seed Database with Demo Data:**
   ```bash
   npm run seed
   ```
   *Seeds 40 bilingual products across 8 categories, 8 rural sellers, 5 demo customers, 3 delivery partners, reviews, and active orders.*

5. **Start Development Servers:**
   ```bash
   npm run dev
   ```
   - Client: `http://localhost:5173`
   - Server: `http://localhost:5000`

---

## 🧪 Verification & Test Commands

Every tier of NativeRise is covered by automated verification:

| Check | Command | Description |
| :--- | :--- | :--- |
| **i18n Parity Check** | `npm run check:i18n` | Verifies 100% key and namespace parity between English and Marathi across all 30 namespaces. |
| **Server Tests** | `npm test --prefix server` | Runs 65+ unit and integration tests covering auth, orders, ledger, geo feasibility, and Gemini AI. |
| **Client Tests** | `npm test --prefix client` | Runs unit tests for components, CartContext single-seller enforcement, and i18n taglines. |
| **Linting** | `npm run lint` | Runs ESLint across both server and client codebases with 0 errors. |
| **Client Build** | `npm run build --prefix client` | Builds client production bundle using Vite. |
| **E2E Playwright** | `npm run e2e --prefix client` | Runs end-to-end tests using system Microsoft Edge. |

---

## 📂 Project Structure

```
NativeRise/
├── client/                     # Frontend Vite + React application
│   ├── e2e/                    # Playwright end-to-end test suites
│   ├── src/
│   │   ├── api/                # Axios API client with auth interceptors
│   │   ├── components/         # Reusable UI components, layout, maps, assistant
│   │   ├── context/            # Auth, Cart (single-seller), and Lang contexts
│   │   ├── i18n/               # 30 namespaces in English and Marathi
│   │   ├── pages/
│   │   │   ├── customer/       # Cart, Checkout, Orders, Tracking, Support
│   │   │   ├── partner/        # Jobs, Navigation, Earnings, Active Delivery
│   │   │   ├── public/         # Home, Catalog, Product Details, Shop Profiles
│   │   │   └── seller/         # Dashboard, What to Sell, Growth Coach, Products
│   │   └── styles/             # Tailwind configuration & Fawn color theme
├── server/                     # Backend Node.js Express REST API
│   ├── src/
│   │   ├── config/             # DB, environment schema (Zod), and constants
│   │   ├── controllers/        # REST route handlers for all 10 feature domains
│   │   ├── middleware/         # Auth, validation, rate limiting, error handler
│   │   ├── models/             # Mongoose schemas (Order, User, Product, Ledger)
│   │   ├── routes/             # Express API endpoints
│   │   ├── seed/               # Deterministic seed data & image generators
│   │   ├── services/           # AI, geo routing, payments, pricing, state machine
│   │   └── utils/              # Currency formatting, Marathi digit normalization
├── scripts/                    # Build & verification scripts (check-i18n.mjs)
├── DECISIONS.md                # Architectural decisions (D1-D17, C1-C18, S1-S3)
└── README.md                   # Project documentation
```

---

## ⚠️ Known Limitations & Transparency Disclosures

1. **Simulated Settlements (S1)**: In-app balances and deposit payouts for sellers and delivery partners are simulated via double-entry ledger records and clearly labelled `"Simulated settlement"` / `"सिम्युलेटेड सेटलमेंट"`.
2. **Payment Processing (S2)**: Razorpay runs in Test Mode. No real financial currency moves.
3. **Machine-Translated Marathi**: Marathi translation files (`locales/mr/*.json`) were generated systematically and are subject to final editorial review by a native speaker.
4. **Browser Wake Lock (C15)**: Delivery tracking utilizes `navigator.wakeLock`. If a mobile device operating system forces lock-screen sleep, browser background GPS throttling may pause location updates until the screen is unlocked.
5. **Public Nominatim / OSRM Fair Use**: Geocoding and routing services respect OpenStreetMap fair-use guidelines with server-side caching.

---

## 📄 License
ISC © NativeRise Contributors.
