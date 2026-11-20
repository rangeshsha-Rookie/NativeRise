=====================================================================
NATIVERISE - MASTER BUILD SPECIFICATION
PART 1 OF 3: FOUNDATIONS
(rules, decisions, stack, structure, design system, i18n, database,
 order state machine, formulas, error codes)
=====================================================================

---------------------------------------------------------------------
0. READ THIS FIRST (RULES OF ENGAGEMENT FOR THE BUILDER)
---------------------------------------------------------------------
0.1  This specification has 3 parts.
     PART 1: foundations (this file).
     PART 2: backend (every API endpoint, AI features, jobs, seed data).
     PART 3: frontend (every page and every button for every role),
             tests, deployment, build phases, final report.
0.2  Read ALL THREE PARTS completely before writing any code.
0.3  This specification is the single source of truth. Do not swap
     libraries, rename collections or fields, skip items, or "improve"
     the design. Do not ask for permission to follow the spec.
0.4  If something is genuinely impossible, implement the closest correct
     behaviour, write one line about it in /DECISIONS.md, and list it in
     the final report. Never silently fake it.
0.5  If a tiny detail is not specified, choose the simplest option that is
     consistent with the spec and log it in /DECISIONS.md (one line).
0.6  Build in the phases listed in PART 3. After each phase run the
     verification commands. Fix every failure before the next phase.
0.7  Never leave: TODO comments, "coming soon", lorem ipsum, console.log-only
     handlers, href="#", empty onClick handlers, hardcoded business data in
     the frontend, dead buttons, dead links, or placeholder pages.
0.8  The product must be FULLY FUNCTIONAL, FULL STACK, AI-INTEGRATED.
     Every visible button, link, form, tab, filter, toggle and section must
     do exactly what this spec says. If a control cannot be made to work, do
     not render it.
0.9  Everything that a user does must be saved on the server and must show
     correctly everywhere else on the site (see section 3).
0.10 Final deliverable: a deployed website (client + server + database),
     a README, a /DECISIONS.md, a passing test suite, and the final report
     described in PART 3.

---------------------------------------------------------------------
1. PRODUCT OVERVIEW
---------------------------------------------------------------------
Name: NativeRise.
Tagline (EN): "From the village to your doorstep."
Tagline (MR): "गावापासून तुमच्या दारापर्यंत."
Problem statement:
  Rural entrepreneurs have no single digital platform that combines
  sales, payments, logistics and customer support. They juggle separate
  tools, or none at all, which limits their reach and income.
Solution:
  One marketplace with three user roles where a rural entrepreneur can
  list products, get paid, ship orders and handle customers in one place,
  with AI help that works for low digital literacy and Marathi language.

Roles:
  CUSTOMER  - browses, sets own location, orders, pays, tracks, reviews,
              raises support queries, chats with the AI assistant.
  SELLER    - rural entrepreneur. Registers a shop with story and location,
              gets AI help deciding what to sell, lists products by photo
              or voice, handles orders, sees earnings, reads Growth Coach
              insights, answers support tickets, uses the AI assistant.
  PARTNER   - delivery partner. Goes online, accepts ready orders nearby,
              picks up, shares real GPS, delivers with a customer code,
              handles COD cash, sees earnings.

Features (all must be built):
  F1  What to Sell (seller): AI product ideas from real platform signals.
  F2  Snap & Sell + Voice listing (seller): photo and/or voice to listing.
  F3  Growth Coach (seller): review analyzer + sales-demand insights.
  F4  AI assistant: customer mode and seller mode, grounded in real data.
  F5  Rural delivery feasibility estimator (customer).
  F6  Checkpoint-based live delivery tracking on a real map (customer).
  F7  Seller story / shop profile pages (customer).
  F8  Marathi language option for every word (all roles).
  F9  Razorpay test-mode payments and Cash on Delivery (customer).
  F10 Support tickets: customer to seller with AI-drafted replies.

EXPLICITLY NOT BUILT (do not add them):
  - True Profit Calculator / profit page. It was removed by the owner.
    The seller earnings page shows a simple net-earnings breakdown only.
  - Admin role or admin UI. (Demo reset is a command-line script.)
  - Email or SMS OTP, Google login, push notifications, native apps.
  - Real money movement. Razorpay runs in TEST mode only.
  - Multi-seller carts, order batching for partners.

---------------------------------------------------------------------
2. DECISION LOG AND CORRECTIONS (what was decided, and mistakes fixed)
---------------------------------------------------------------------
These were decided with the owner. Treat them as requirements.

2.1 Decisions
  D1  Stack: React + Node/Express + MongoDB. Free services only.
  D2  Real map: Leaflet + OpenStreetMap. Customer enters their OWN location
      (address search, current-location GPS, or draggable pin).
  D3  Payments: Razorpay TEST mode (looks real, no real money) plus Cash
      on Delivery. Seller settlement is SIMULATED via an in-app ledger and
      must be labelled as simulated.
  D4  AI: Google Gemini free tier, called only from the backend.
  D5  The catalog is preloaded: 40 products, 8 categories, 8 demo sellers,
      5 demo customers, 3 demo delivery partners, bilingual, with ratings,
      reviews and order history. All seeded documents have isDemo = true.
  D6  Two demo modes must both work:
      Mode 1: show the preloaded data and every feature.
      Mode 2: create new things live (register a seller, add a product,
      order it as a customer, accept it, deliver it, review it) and see
      them appear everywhere instantly.
  D7  One seller per cart.
  D8  Delivery pricing is seller-controlled. Default INCLUDED in product
      price (customer sees "Free delivery"; cost is deducted from seller
      earnings and paid to the partner). Optional CUSTOMER_PAYS mode.
  D9  Delivery confirmation uses a 4-digit delivery code shown to the
      customer and entered by the partner.
  D10 Tracking uses the partner phone's real GPS. Checkpoints are detected
      automatically. No fake movement.
  D11 Order lifecycle: see section 10 (server enforced).
  D12 The Marathi toggle is ONE component, shown on each role's home page
      and on login/register pages only. See section 8.
  D13 Theme: Fawn colour theme (cream, dark brown, sky blue) plus extra
      colours that suit it. See section 7.
  D14 Social proof must be real. No fake "X bought this" popups.
  D15 Growth Coach has no "not enough orders yet" screen: demo data exists,
      and brand-new sellers see insights from similar platform products.
  D16 AI assistant must reliably answer simple questions from real data
      (orders, products, delivery estimates, tickets).
  D17 Money is stored as integer paise. Never use floating point for money.

2.2 Corrections made during design (do NOT regress these)
  C1  Location must exist BEFORE the delivery check: customers save an
      address with lat/lng; the check runs on product pages and checkout.
  C2  Multi-seller carts rejected: one seller per cart.
  C3  Manual checkpoint marking rejected: checkpoints are detected from GPS
      (geofence milestones) and the real travelled trail is drawn.
  C4  "Anyone can mark delivered" fixed: delivery code required.
  C5  Missing delivery fee fixed by seller-controlled delivery pricing.
  C6  Seller could lose money on small far orders: per-seller minimum
      order value and a server check that seller net is never negative.
  C7  Two partners accepting one order: atomic first-wins update.
  C8  No failure path: DELIVERY_FAILED status with reason and refund.
  C9  COD cash untracked: ledger entries and "cash to deposit" balance.
  C10 Overselling: stock is reserved atomically when an order is created
      and restored on cancel/reject/fail.
  C11 Double-click duplicate orders: Idempotency-Key header.
  C12 Client-trusted prices: the server recomputes every amount.
  C13 Customer closes the Razorpay popup after paying: the order page
      reconciles payment status with Razorpay and fixes the order.
  C14 Fake social proof removed (see D14).
  C15 Browser GPS stops when the phone screen locks: use the Screen Wake
      Lock API on the partner page and show a clear instruction. This is a
      documented limitation, not hidden.
  C16 Demo geography: seeded sellers are near the demo customers so the
      delivery check passes. Do not seed sellers 70+ km away.
  C17 Devanagari digits typed by users must be normalised to Latin digits
      before validation (phone, price, stock, delivery code).
  C18 Seller earnings are shown with a per-order breakdown so there are no
      surprises (item total, platform fee, delivery cost, net).

2.3 Allowed, clearly labelled simulations (the ONLY ones)
  S1  Seller/partner settlement ledger: label "Simulated settlement".
  S2  Razorpay checkout: show a "Test mode - no real money moves" badge.
  S3  Partner "Demo drive (simulated)" button: off by default, visible only
      when DEMO_TOOLS_ENABLED=true, labelled on screen, and its points are
      stored with a flag simulated=true.
  Everything else is real.

---------------------------------------------------------------------
3. NON-NEGOTIABLE ACCURACY RULES (apply to every line of code)
---------------------------------------------------------------------
3.1  MongoDB is the single source of truth. The UI shows what the server
     returns. The frontend keeps no business data of its own.
3.2  Every action follows: click -> API call -> server validation ->
     database write -> UI updates from the server response/refetch.
     No optimistic "fake success". On failure show the translated error.
3.3  Every button has loading, success and error states and is disabled
     while its request is running (prevents double submits).
3.4  Server enforces everything: authentication, role checks, ownership
     checks, order state machine, stock, prices, payment verification.
     Never trust amounts, roles, statuses or ids sent by the client.
3.5  Atomic updates: stock reservation, partner accept, delivery code
     attempts and ledger posting use single-document atomic operations or
     unique indexes so races cannot corrupt data.
3.6  Prices and stock are re-validated at checkout and at order creation.
     If something changed, return PRICE_CHANGED or INSUFFICIENT_STOCK with
     the fresh values; the UI shows what changed.
3.7  After every mutation the frontend invalidates the affected queries
     (TanStack Query) so every screen shows fresh data.
3.8  Live screens poll every 5 seconds (POLL_INTERVAL_MS) and pause when
     the browser tab is hidden. Live screens: seller orders, partner job
     list, partner active order, customer order tracking, customer order
     list, seller support inbox, customer ticket thread.
3.9  Derived numbers are computed from data (counts, averages, earnings).
     Store them twice only where the spec says so (ratingSum/ratingCount).
3.10 All money is integer paise. Format only at display time.
3.11 All timestamps are stored in UTC. Display in Asia/Kolkata (IST).
3.12 Server messages are error CODES. The client translates them. No
     English sentence from the server is ever shown to users.
3.13 Every list screen has loading skeletons, an empty state and an error
     state with a retry button. No blank screens, no infinite spinners.
3.14 Validate every request body with Zod. Reject unknown fields.
3.15 Security basics: bcrypt (cost 10), JWT with expiry, helmet, CORS limited
     to CLIENT_ORIGIN, input sanitising, no secrets in the client, the
     delivery code is never returned to partner endpoints, users can only
     read/write their own data.
3.16 No fake data anywhere in the UI. Seeded data is real database data.
3.17 Social proof (stock left, verified buyer, recent purchase) must be
     computed from real data or not shown.

---------------------------------------------------------------------
4. TECH STACK (fixed; do not substitute)
---------------------------------------------------------------------
Runtime/Language: Node.js 20 LTS, JavaScript (ES modules). No TypeScript.
Server:
  express 4, mongoose 8, zod, bcryptjs, jsonwebtoken, helmet, cors,
  express-rate-limit (login/register routes only), multer (memory storage),
  cloudinary (image hosting), razorpay (official Node SDK), nanoid,
  pino (logging), dotenv, node-cron is NOT used (use setInterval jobs),
  official Google Gen AI SDK for Node (check npm for the current package,
  expected "@google/genai"; verify the model name in Google AI Studio docs
  and set GEMINI_MODEL accordingly; use a Flash-class model on the free
  tier), supertest + vitest for tests.
Database: MongoDB Atlas free tier (M0).
Client:
  react 18, vite, react-router-dom 6, tailwindcss 3, @tanstack/react-query 5,
  axios, react-i18next + i18next, leaflet + react-leaflet, zod (forms),
  react-hook-form, lucide-react (icons), clsx, dayjs is NOT used (use Intl),
  vitest + @testing-library/react (light component tests),
  playwright (i18n crawl + end-to-end).
Lint: eslint + eslint-plugin-react-hooks + eslint-plugin-i18next
  (rule i18next/no-literal-string = error in client/src).
Maps: Leaflet with OpenStreetMap tiles. Geocoding: Nominatim via our
  backend. Routing: OSRM public server via our backend.
Payments: Razorpay Checkout (checkout.js loaded on demand) in TEST mode.
AI: Gemini API, backend only. Voice input: browser Web Speech API.
Auth: JWT sent in the Authorization header (Bearer). Stored in
  localStorage key "nr_token". 7 day expiry. (Chosen because the client and
  server are on different domains.)
Hosting: client on Vercel, server on Render (free), DB on Atlas.
Real-time: polling only (no websockets).
Fonts: Google Fonts (see section 7).

---------------------------------------------------------------------
5. REPOSITORY STRUCTURE (create exactly this)
---------------------------------------------------------------------
/
  README.md                 setup, env, scripts, deploy, demo accounts
  DECISIONS.md              builder's log of small decisions/limitations
  SPEC/                     PART1.md PART2.md PART3.md (this spec)
  design-reference/fawn.png colour reference supplied by the owner
  package.json              root scripts (concurrently) for dev/test
  server/
    package.json
    .env.example
    src/
      index.js              starts HTTP server, connects DB, starts jobs
      app.js                express app, middleware, routes
      config/
        env.js              validates env with zod, exports config
        constants.js        every constant from section 6.2
        db.js               mongoose connection
      middleware/
        auth.js             requireAuth, requireRole(...roles)
        error.js            notFound + central error handler
        validate.js         zod body/query/params validator
        idempotency.js      Idempotency-Key handling for POST /orders
        upload.js           multer config (images)
      models/
        User.js SellerProfile.js PartnerProfile.js Category.js
        Product.js Cart.js Order.js Review.js SupportTicket.js
        LedgerEntry.js SearchMiss.js TranslationCache.js
        GrowthReport.js Counter.js Idempotency.js
      routes/
        index.js            mounts all routers under /api/v1
        auth.routes.js me.routes.js geo.routes.js
        catalog.routes.js   categories, products, sellers (public)
        cart.routes.js orders.routes.js payments.routes.js
        reviews.routes.js support.routes.js assistant.routes.js
        seller.routes.js    shop, products, orders, earnings, support
        partner.routes.js   profile, jobs, active order, tracking, earnings
        ai.routes.js        what-to-sell, snap-and-sell, growth coach
      controllers/          one file per router, thin
      services/
        orders.service.js   create order, transitions, stock, refunds
        pricing.service.js  delivery fee, platform fee, net, ETA
        payments.service.js razorpay create/verify/refund/reconcile
        geo.service.js      haversine, nominatim, osrm, caching
        tracking.service.js location ingest, trail, milestones
        ledger.service.js   post earnings exactly once
        reviews.service.js  create review, recompute ratings, classify
        translate.service.js gemini translate/transliterate + cache
        ai/
          gemini.client.js  wrapper, JSON-mode helper, timeouts, retries
          assistant.service.js  tool-calling loop + tool implementations
          growth.service.js  stats aggregation + Gemini advice
          whatToSell.service.js
          snapSell.service.js
          prompts.js        all system prompts (section in PART 2)
        jobs.js             setInterval jobs (payment timeout, auto-reject)
      utils/
        money.js (paise helpers) digits.js (normalizeDigits) pick.js
        codes.js (error codes) httpError.js asyncHandler.js ids.js
      seed/
        seed.js reset.js    npm run seed / npm run seed:reset
        data/               sellers.json partners.json customers.json
                            products.json reviews.json (bilingual)
        images/             downloaded product images (or see PART 2)
    tests/
      lifecycle.test.js pricing.test.js stock.test.js auth.test.js
      payments.test.js i18n-keys.test.js (server-side bilingual checks)
  client/
    package.json index.html vite.config.js tailwind.config.js
    postcss.config.js .env.example
    public/
      favicon.svg logo.svg seed-images/ (if used)
    src/
      main.jsx App.jsx router.jsx
      api/
        client.js           axios instance, token, error normaliser
        hooks/              one file per domain using TanStack Query
      i18n/
        index.js            i18next setup
        locales/en/*.json   namespaces (see section 8)
        locales/mr/*.json
        format.js           formatINR, formatNumber, formatDateTime...
        digits.js           normalizeDigits, toDevanagari
      context/
        AuthContext.jsx LangContext.jsx
      components/
        ui/                 Button Input Select Textarea Badge Card Modal
                            Drawer Toast Skeleton EmptyState ErrorState
                            Tabs Stepper Timeline RatingStars Pagination
                            Table StatCard Chip QuantityStepper Switch
        layout/             Header Footer BottomNav RoleLayout
        LanguageToggle.jsx
        map/                MapView LocationPicker RouteMap TrackingMap
        product/            ProductCard ProductGrid PriceTag DeliveryCheck
        order/              OrderCard OrderTimeline PaymentBadge
        assistant/          AssistantWidget
        ai/                 SnapSellForm VoiceInput
      pages/
        public/ customer/ seller/ partner/ auth/ (see PART 3)
      hooks/ usePolling.js useGeolocation.js useWakeLock.js useDebounce.js
      styles/ index.css (design tokens as CSS variables)
    tests/
      e2e/ i18n-crawl.spec.js lifecycle.spec.js
  scripts/
    check-i18n.mjs          key parity + Latin-letter scan for mr values

---------------------------------------------------------------------
6. ENVIRONMENT AND CONSTANTS
---------------------------------------------------------------------
6.1 server/.env.example (create with comments)
  NODE_ENV=development
  PORT=5000
  MONGODB_URI=mongodb+srv://...            (Atlas)
  JWT_SECRET=change-me-long-random
  JWT_EXPIRES_IN=7d
  CLIENT_ORIGIN=http://localhost:5173      (comma-separated list allowed)
  RAZORPAY_KEY_ID=rzp_test_xxx
  RAZORPAY_KEY_SECRET=xxx
  RAZORPAY_WEBHOOK_SECRET=                 (optional)
  GEMINI_API_KEY=xxx
  GEMINI_MODEL=                            (free-tier Flash model; verify)
  CLOUDINARY_CLOUD_NAME=
  CLOUDINARY_API_KEY=
  CLOUDINARY_API_SECRET=
  NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
  NOMINATIM_USER_AGENT=NativeRise/1.0 (contact: your-email)
  OSRM_BASE_URL=https://router.project-osrm.org
  DEMO_TOOLS_ENABLED=true
  STRICT_GEOFENCE=false
  SEED_DEMO_PASSWORD=Demo@1234
  If a required variable is missing the server must refuse to start and
  print exactly which variable is missing.
6.2 server/src/config/constants.js (exact values)
  PLATFORM_FEE_PERCENT = 5
  PARTNER_BASE_FEE_PAISE = 1500          (Rs 15)
  PARTNER_PER_KM_PAISE = 400             (Rs 4 per km)
  PARTNER_MIN_PAYOUT_PAISE = 2500        (Rs 25)
  AVG_SPEED_KMPH = 25
  OSRM_DETOUR_FACTOR = 1.3               (fallback if OSRM fails)
  NEARING_KM = 1
  DROP_GEOFENCE_METERS = 300             (advisory unless STRICT_GEOFENCE)
  DEFAULT_MAX_DELIVERY_KM = 30
  DEFAULT_PREP_MINS = 120
  DEFAULT_MIN_ORDER_PAISE = 15000        (Rs 150)
  PARTNER_DEFAULT_RADIUS_KM = 20
  PAYMENT_TIMEOUT_MINS = 30
  AUTO_REJECT_HOURS = 6
  DELIVERY_CODE_LENGTH = 4
  DELIVERY_CODE_MAX_ATTEMPTS = 5
  DELIVERY_CODE_LOCK_MINS = 5
  TRACK_POINT_MIN_INTERVAL_SEC = 10
  TRAIL_MAX_POINTS = 500
  LOCATION_STALE_SECONDS = 120
  POLL_INTERVAL_MS = 5000
  MAX_CART_QTY_PER_ITEM = 50
  MAX_IMAGES_PER_PRODUCT = 5
  IMAGE_MAX_MB = 5
  PAGE_SIZE_DEFAULT = 12
  PAGE_SIZE_MAX = 50
  GEO_CACHE_TTL_MINUTES = 60
  ASSISTANT_HISTORY_MAX_MESSAGES = 10
  AI_TIMEOUT_MS = 25000
6.3 client/.env.example
  VITE_API_BASE_URL=http://localhost:5000/api/v1
  VITE_RAZORPAY_KEY_ID=rzp_test_xxx
  VITE_DEMO_TOOLS_ENABLED=true
  VITE_DEFAULT_MAP_LAT=19.2813
  VITE_DEFAULT_MAP_LNG=72.8686

---------------------------------------------------------------------
7. DESIGN SYSTEM (theme: Fawn colour theme, bold and earthy)
---------------------------------------------------------------------
7.1 Reference: /design-reference/fawn.png is the colour reference. Sample
    exact values from it. If it is missing, use the fallback hex below.
    Only the COLOUR THEME comes from it. Layout and type are defined here.
7.2 Colour tokens (CSS variables on :root, mirrored in tailwind.config.js)
  --nr-cream        #F4ECDF   page background
  --nr-cream-2      #EDE2D1   alternate sections, hover surfaces
  --nr-surface      #FBF7F0   cards, inputs
  --nr-ink          #1E1712   primary text
  --nr-ink-2        #5B4D42   secondary text (contrast >= 4.5:1 on cream)
  --nr-line         #DCCFBD   borders, dividers
  --nr-primary      #8DBBFA   main buttons (text on it is --nr-ink)
  --nr-primary-600  #5E9BEA   hover/active
  --nr-primary-soft #D3E5FD   soft badges, selected rows
  --nr-clay         #A4542B   warm accent: links, highlights, price tags
  --nr-bark         #2A1F18   dark bands (hero strips, footer, stat bands)
  --nr-on-bark      #F4ECDF   text on dark bands
  --nr-success      #2F7D4F   --nr-success-soft #DCEFE2
  --nr-warning      #B7791F   --nr-warning-soft #F6E7C8
  --nr-danger       #B3402F   --nr-danger-soft  #F6D9D2
  Star rating colour: --nr-ink (filled), --nr-line (empty).
  Status colour mapping (used by Badge everywhere):
    AWAITING_PAYMENT warning, PLACED primary-soft, ACCEPTED primary-soft,
    PACKED primary-soft, ASSIGNED primary-soft, PICKED_UP clay,
    DELIVERED success, REJECTED danger, CANCELLED danger,
    DELIVERY_FAILED danger. Payment: PAID success, COD_PENDING warning,
    COD_COLLECTED success, REFUNDED primary-soft, FAILED danger.
  Never use pure white or pure black. Never use gradients except a subtle
  cream-to-cream-2 section fade. No glassmorphism, no heavy blur.
7.3 Typography
  Latin display (headings): "Fraunces" (serif), weights 600-800.
  Latin body/UI: "DM Sans", weights 400-700.
  Devanagari display: "Tiro Devanagari Marathi" (fallback "Noto Serif
    Devanagari"), used for headings when lang=mr.
  Devanagari body/UI: "Noto Sans Devanagari", weights 400-700.
  Switch fonts with CSS :lang(mr). Set <html lang> on every language change.
  Scale (desktop / mobile): display 64/40, h1 44/32, h2 32/26, h3 24/20,
    body 18/17, small 15/14, caption 13. Base body size is 17-18px because
    users read on cheap phones outdoors. Line-height 1.6 for Devanagari,
    1.5 for Latin. Never use italics for emphasis (Devanagari has none):
    emphasise with weight or the --nr-clay colour.
  Load fonts with display=swap and subset latin + devanagari.
7.4 Shape, spacing, elevation
  Radius: cards 24px, inputs 16px, buttons pill (9999px), badges pill,
    images 20px. Spacing scale 4/8/12/16/24/32/48/64/96.
  Container max-width 1200px; page gutters 16px mobile, 32px desktop.
  Shadows: very soft only: 0 6px 24px rgba(42,31,24,0.08).
  Borders: 1px solid --nr-line. Focus ring: 3px --nr-primary-600 with 2px
  offset on every focusable element.
  Tap targets: minimum 48x48px. Primary buttons 52px tall on mobile.
7.5 Boldness rules
  - Headlines are large. Hero and section titles use display/h1 sizes.
  - Use full-width --nr-bark bands with cream text for hero stats, "how it
    works", and the footer to create strong contrast.
  - Product photography is large (4:5 or 1:1) with 20px radius.
  - One primary action per screen section, always the sky-blue pill.
  - Icons: lucide-react, stroke 2, size 20-24, always with a text label
    on primary actions.
7.5.1 Brand mark: wordmark "NativeRise" in Fraunces 700 with a small
    sprout glyph (inline SVG, 2 leaves, --nr-clay). Provide logo.svg and
    favicon.svg. In Marathi mode the wordmark stays Latin (allowed).
7.6 Components (build once in components/ui, reuse everywhere)
  Button: variants primary (sky-blue, ink text), secondary (outline ink),
    danger (danger bg, cream text), ghost (text only). Sizes md(48) lg(52)
    sm(40, desktop only). States: hover, active, focus, disabled, loading
    (spinner + label kept, width does not jump).
  Input/Textarea/Select: 52px height, surface bg, 1px line border,
    16px radius, label above, helper text below, error text in danger with
    icon, aria-invalid, aria-describedby. Numeric inputs use
    inputMode="numeric" and accept Devanagari digits (section 8.7).
  Checkbox/Radio/Switch: 24px minimum, label clickable.
  Badge/Chip: pill, 13-14px, soft background, medium weight.
  Card: surface bg, 24px radius, 1px line border, 20-24px padding.
  ProductCard: 4:5 image, wishlist NOT included, seller shop name and
    village, name (2 lines max), price (clay, bold), unit, rating stars
    with count, stock chip only when stock <= 5 ("Only N left" computed
    from real stock), delivery badge from DeliveryCheck when a customer
    location exists ("Free delivery" or "Delivery Rs X" or "Out of range").
  StatCard: dark (--nr-bark) or surface variant, big number, label, delta.
  Table: on mobile each row becomes a Card (no horizontal scroll).
  Modal: centered on desktop, bottom sheet on mobile, focus trapped,
    closes on Esc and backdrop click (unless busy).
  Toast: bottom-center, 4s, success/error/info, translated, aria-live.
  Skeleton: shimmer disabled when prefers-reduced-motion.
  EmptyState: simple inline SVG illustration (leaf/box/map), title,
    one-line help, one action button when meaningful.
  ErrorState: message from error code + "Try again" button (refetch).
  Stepper/Timeline: vertical, dots + connecting line, current step in
    primary, done in success, failed in danger.
  RatingStars: display (read-only, half stars) and input (keyboard
    accessible radio group).
  Tabs, Pagination (numbered + prev/next), QuantityStepper (- qty +,
    min 1, max min(stock, MAX_CART_QTY_PER_ITEM)).
7.7 Layout and responsiveness
  Mobile-first. Breakpoints: sm 640, md 768, lg 1024, xl 1280.
  Customer and partner have a bottom navigation bar on mobile
  (< md). Seller uses a top bar + left sidebar on desktop and a bottom
  bar on mobile. Header is sticky. Footer shows on customer pages only.
  Wide content scrolls inside its own container; the page body never
  scrolls sideways. Test widths: 360, 414, 768, 1024, 1440.
7.8 Motion
  150-200ms ease for hovers, modals, toasts. No parallax, no autoplay
  carousels. Respect prefers-reduced-motion (disable all transitions).
7.9 Accessibility
  Semantic HTML, landmarks (header/main/nav/footer), skip link,
  alt text on every image (from translated product name), aria-labels
  through t(), visible focus, colour never the only signal (status badges
  always have text), forms announce errors, contrast >= 4.5:1.

---------------------------------------------------------------------
8. INTERNATIONALISATION: ENGLISH + MARATHI (EVERY WORD)
---------------------------------------------------------------------
8.1 Library: i18next + react-i18next. Languages: "en" (default), "mr".
8.2 THE TOGGLE (one component: components/LanguageToggle.jsx)
  - A segmented pill: [ English | मराठी ]. Current language highlighted.
  - It is rendered ONLY on: the customer home page "/", the seller home
    "/seller", the partner home "/partner", and the login and register
    pages of all roles. Do NOT render it anywhere else. Do NOT add a
    second toggle in menus or settings.
  - Switching is instant, no page reload. It updates: i18next language,
    <html lang>, fonts, number/date formatting, and refetches any
    language-dependent API data (AI outputs, bilingual content picks).
  - Persistence: localStorage "nr_lang" (applies before login) and, when
    logged in, PATCH /me/language saves user.preferredLang. On login the
    saved preferredLang is applied.
  - Initial language: saved nr_lang, else "en". Do not auto-detect.
8.3 What must be translated (nothing may stay English except 8.9)
  Every visible string: buttons, labels, placeholders, helper text,
  tooltips, page titles (document.title), meta description, alt text,
  aria-labels, toasts, confirm dialogs, validation messages, error
  messages (from codes), empty states, loading text, 404 page, status
  names, category names, units, table headers, badge texts, email-like
  receipts, map UI labels we control, assistant welcome/suggestion chips,
  Growth Coach card titles, onboarding hints, footer text.
8.4 Namespaces (one JSON file per namespace per language)
  common, nav, auth, home, catalog, product, cart, checkout, orders,
  tracking, reviews, support, assistant, account, seller, sellerOrders,
  sellerProducts, snap, whatToSell, growth, earnings, partner, partnerJobs,
  map, status, units, errors, validation, a11y, footer.
  Keys are dot paths, snake or camel consistently (camelCase). Example:
  "checkout.payNow", "status.PICKED_UP", "errors.INSUFFICIENT_STOCK".
8.5 Rules for code
  - Every string goes through t(). ESLint rule i18next/no-literal-string
    is an error in client/src (allow only punctuation/numbers/css).
  - Plurals use i18next plural keys (_one/_other; Marathi uses the same
    two forms). Interpolation uses {{name}}.
  - Never concatenate translated fragments into sentences. Use full
    sentence keys with interpolation (Marathi word order differs).
  - Status and category and unit display always use keys:
    t("status."+status), category.name[lang], t("units."+unit).
8.6 Marathi translation quality
  - Write natural, simple Marathi (conversational, respectful "आपण").
    Not word-for-word machine output. Use common Marathi words for
    commerce: ऑर्डर, कार्ट, पेमेंट, डिलिव्हरी, विक्रेते, ग्राहक,
    रिव्ह्यू/परीक्षण (use "रिव्ह्यू"), रेटिंग, पत्ता, स्थान, कोड.
  - Generate locales/mr/*.json yourself with the same keys as en.
    The build must fail if any key exists in en and not in mr, or if any
    mr value is empty or identical to its English value (except allowlist).
  - Add a note at the top of /DECISIONS.md that the owner will review the
    Marathi files because they were machine-generated.
8.7 Numbers, dates, digits
  - formatINR(paise, lang): uses Intl.NumberFormat with locale
    "mr-IN" for mr (Devanagari digits) and "en-IN" for en; currency INR;
    no decimals when whole rupees.
  - formatNumber, formatDate, formatTime, formatDateTime,
    formatRelativeTime use Intl with the same locale and
    timeZone "Asia/Kolkata".
  - normalizeDigits(str): converts Devanagari digits (०-९) to 0-9. Call it
    on EVERY numeric input (phone, price, stock, qty, delivery code, pin)
    before validation and before sending to the server. The server also
    normalises as a second guard.
  - The delivery code is shown in the current language digits but accepted
    in either.
8.8 Bilingual content stored in the database
  Pattern: { en: String, mr: String }. Helper pick(obj, lang) returns the
  requested language and falls back to the other language only if empty.
  Bilingual fields: User.name, SellerProfile.shopName/story/village,
  Product.name/description, Category.name, Review.text, ticket messages.
  - Seeded data: both languages written in the seed files.
  - New content (seller adds product/story, customer writes review or
    ticket message, any new user name/village): on save, the server calls
    translate.service to produce the other language (Gemini), stores both,
    and caches by hash in TranslationCache. Names of people/places are
    TRANSLITERATED to Devanagari (not translated). If Gemini fails, store
    the original in both fields and set translationStatus="PENDING"; a job
    retries every 5 minutes (max 5 tries) and fixes it.
  - Seller can edit the Marathi/English version in the listing form
    before publishing (SnapSellForm shows both).
  - Search matches both languages (text index on both).
8.9 Allowed to stay in Latin letters (allowlist)
  NativeRise, Razorpay, UPI, COD (shown as "कॅश ऑन डिलिव्हरी (COD)"),
  OpenStreetMap, Leaflet (map credit required by licence), unit symbols
  kg/g/ml/l only if shown as symbols, email addresses, URLs, order and
  ticket numbers (NR-..., TK-...), Rs symbol. Everything else is Marathi.
  AI shown as "एआय". Third-party popups we cannot control may stay
  English: the Razorpay payment popup (check Razorpay docs for a language
  option and use Marathi if supported) and the browser's GPS permission
  prompt. Everything before and after them is Marathi.
8.10 Fonts and layout
  Marathi text is longer than English. Layouts must not break: no fixed
  widths on buttons/labels, allow wrapping, min-height instead of height,
  test every page in both languages at 360px width.
8.11 Completeness tooling
  scripts/check-i18n.mjs: (1) key parity between en and mr per namespace;
  (2) every mr value contains Devanagari and no Latin letters except the
  allowlist; (3) no unused or missing keys (scan t("...") calls).
  Playwright i18n-crawl (PART 3): switches to Marathi and visits every
  route of every role, reads all visible text, alt, placeholder, title and
  aria-label values, and fails if Latin letters appear outside the
  allowlist. Run both scripts in CI and before deploy.

---------------------------------------------------------------------
9. DATABASE (MongoDB via Mongoose). ALL MODELS, FIELDS, INDEXES
---------------------------------------------------------------------
Conventions: timestamps:true on every schema; isDemo:Boolean (default
false) on seeded/demo docs; money fields end in "Paise" (Integer >= 0,
use Number with validate Number.isInteger); ids are ObjectId; "BI" means
bilingual object { en: String, mr: String }.

9.1 users
  role: "customer" | "seller" | "partner"  (required, immutable)
  name: BI (required)
  email: String unique lowercase trimmed (required)
  phone: String, 10 digits, regex ^[6-9]\d{9}$ (required)
  passwordHash: String (required, select:false)
  preferredLang: "en" | "mr" (default "en")
  addresses: [ { _id, label: String (e.g. Home), line: String (full
     address text), landmark: String, lat: Number, lng: Number,
     isDefault: Boolean } ]   (customers; max 5; exactly one default)
  isDemo, lastLoginAt: Date
  Indexes: email unique; role.
9.2 sellerprofiles
  user: ObjectId users, unique (required)
  shopName: BI (required)
  story: BI (required, 40-600 chars each language)
  village: BI (required); district: String; state: String (default
    "Maharashtra"); pincode: String (6 digits)
  location: { lat: Number, lng: Number, line: String } (required)
  maxDeliveryKm: Number (default DEFAULT_MAX_DELIVERY_KM, 3-100)
  prepTimeMins: Number (default DEFAULT_PREP_MINS, 15-1440)
  minOrderPaise: Integer (default DEFAULT_MIN_ORDER_PAISE)
  deliveryMode: "INCLUDED" | "CUSTOMER_PAYS" (default "INCLUDED")
  isAcceptingOrders: Boolean (default true)
  photoUrl: String; coverUrl: String
  ratingSum: Number (default 0); ratingCount: Number (default 0);
  ratingAvg: Number (default 0, 1 decimal)
  Indexes: user unique; "location" 2dsphere is NOT used (we compute
    haversine in code); district; state.
9.3 partnerprofiles
  user: ObjectId users unique (required)
  vehicleType: "BIKE" | "CYCLE" | "ON_FOOT" | "AUTO"
  vehicleNumber: String (optional, uppercase)
  baseLocation: { lat, lng, line } (required)
  serviceRadiusKm: Number (default PARTNER_DEFAULT_RADIUS_KM, 3-60)
  isOnline: Boolean (default false)
  lastLocation: { lat, lng, accuracy, at: Date }
  activeOrder: ObjectId orders | null
  Indexes: user unique; isOnline.
9.4 categories (fixed, seeded, not user-editable)
  slug: String unique; name: BI; icon: String (lucide icon key);
  sortOrder: Number
  The 8 categories (slug: English / Marathi):
   pickles-preserves: Pickles & Preserves / लोणची आणि मुरांबे
   spices-masalas: Spices & Masalas / मसाले
   millets-grains: Millets & Grains / भरडधान्ये आणि धान्य
   handloom-textiles: Handloom & Textiles / हातमाग आणि कापड
   pottery-terracotta: Pottery & Terracotta / मातीची भांडी
   bamboo-cane-craft: Bamboo & Cane Craft / बांबू आणि वेत हस्तकला
   jaggery-sweets: Jaggery & Sweets / गूळ आणि मिठाई
   honey-oils: Honey & Cold-pressed Oils / मध आणि घाणीचे तेल
9.5 products
  seller: ObjectId sellerprofiles (required)
  category: String slug (required)
  name: BI (required, 3-80)
  description: BI (required, 20-800)
  pricePaise: Integer (required, >= 1000 i.e. Rs 10)
  quantityValue: Number (required >0); quantityUnit: "g" | "kg" | "ml" |
    "l" | "piece" | "dozen" | "metre" | "set"
  stock: Integer >= 0 (required)
  images: [String url] (1-5, required)
  searchKeywords: [String] (lowercase, both languages)
  status: "ACTIVE" | "PAUSED" | "ARCHIVED" (default ACTIVE)
  ratingSum, ratingCount, ratingAvg (same rules as seller)
  soldCount: Integer (incremented when an order is DELIVERED)
  translationStatus: "OK" | "PENDING"
  Indexes: text index on name.en, name.mr, description.en, description.mr,
    searchKeywords (weights name 5, keywords 3, description 1);
    { category:1, status:1, ratingAvg:-1 }; { seller:1, status:1 };
    { status:1, soldCount:-1 }.
  Visibility: customers see only status ACTIVE and stock>0 listed as
  available; stock 0 shows "Out of stock" (still visible, not purchasable).
9.6 carts
  user: ObjectId unique (customers)
  seller: ObjectId sellerprofiles | null
  items: [ { product: ObjectId, qty: Integer 1..MAX_CART_QTY_PER_ITEM } ]
  The cart stores NO prices. Prices come from products at read time.
  Rule: all items belong to one seller. Adding from another seller returns
  CART_DIFFERENT_SELLER unless client sends replace=true.
9.7 orders
  orderNo: String unique ("NR-YYMMDD-0001", daily counter, section 9.14)
  customer: ObjectId users; seller: ObjectId sellerprofiles
  items: [ { product, name: BI, image: String, unitPricePaise,
      qty, quantityValue, quantityUnit } ]            (snapshot)
  itemsTotalPaise: Integer
  deliveryMode: "INCLUDED" | "CUSTOMER_PAYS"          (snapshot)
  customerDeliveryChargePaise: Integer (0 when INCLUDED)
  totalPayablePaise: Integer = itemsTotal + customerDeliveryCharge
  partnerPayoutPaise: Integer (computed at creation, section 11)
  platformFeePaise: Integer
  sellerNetPaise: Integer (computed at creation; final at delivery)
  address: { name, phone, line, landmark, lat, lng }  (snapshot)
  pickup: { lat, lng, line }                          (seller snapshot)
  roadDistanceKm: Number (1 decimal); distanceEstimated: Boolean
  etaMins: Integer (estimate shown to customer)
  paymentMethod: "RAZORPAY" | "COD"
  payment: { status: "PENDING"|"PAID"|"FAILED"|"REFUNDED"|
      "COD_PENDING"|"COD_COLLECTED", razorpayOrderId, razorpayPaymentId,
      razorpaySignature, paymentInstrument (e.g. "upi"), paidAt,
      refundId, refundedAt, refundReason }
  status: "AWAITING_PAYMENT"|"PLACED"|"ACCEPTED"|"REJECTED"|"PACKED"|
      "ASSIGNED"|"PICKED_UP"|"DELIVERED"|"DELIVERY_FAILED"|"CANCELLED"
  statusHistory: [ { status, at, byUser, byRole, note } ]
  partner: ObjectId users | null; partnerAssignedAt, pickedUpAt,
      deliveredAt: Date
  deliveryCode: String (4 digits, generated at creation, select:false)
  codeAttempts: Number; codeLockedUntil: Date
  liveLocation: { lat, lng, accuracy, at, simulated: Boolean }
  trail: [ { lat, lng, at, simulated } ]  (cap TRAIL_MAX_POINTS)
  milestones: { nearingAt: Date, arrivedAt: Date }
  deliveredFarFromDrop: Boolean (advisory flag)
  failure: { reason: "CUSTOMER_UNREACHABLE"|"ADDRESS_NOT_FOUND"|
      "CUSTOMER_REFUSED"|"OTHER", note, at }
  cancellation: { by: "customer"|"system"|"seller"|"partner", reason, at }
  ledgerPosted: Boolean (default false)
  stockRestored: Boolean (default false)
  idempotencyKey: String
  isDemo
  Indexes: orderNo unique; { customer:1, createdAt:-1 };
    { seller:1, status:1, createdAt:-1 };
    { status:1, partner:1 }; { status:1, "pickup.lat":1 };
    { "payment.razorpayOrderId":1 }.
9.8 reviews
  order, product, customer, seller: ObjectIds (required)
  rating: Integer 1..5; text: BI; originalLang: "en"|"mr"
  themes: [ "taste"|"quality"|"freshness"|"packaging"|"delivery"|
            "price"|"quantity"|"service" ]
  sentiment: "positive"|"neutral"|"negative"
  isDemo
  Unique index: { order:1, product:1 }. Index { product:1, createdAt:-1 },
  { seller:1, createdAt:-1 }.
9.9 supporttickets
  ticketNo: "TK-00001" (counter); customer, seller: ObjectIds;
  order: ObjectId | null; subject: String (max 120);
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdVia: "MANUAL" | "ASSISTANT";
  messages: [ { sender: "customer"|"seller", text: BI, originalLang,
      at } ]
  unreadForSeller: Boolean; unreadForCustomer: Boolean
  Indexes: { customer:1, updatedAt:-1 }, { seller:1, status:1, updatedAt:-1 }
9.10 ledgerentries
  user: ObjectId (seller or partner); role: "seller"|"partner";
  order: ObjectId | null;
  type: "SELLER_EARNING"|"PARTNER_EARNING"|"COD_CASH_COLLECTED"|
        "COD_CASH_DEPOSITED"
  amountPaise: Integer (positive)
  breakdown: { itemsTotalPaise, platformFeePaise, deliveryCostPaise,
      netPaise }  (seller entries)
  note: String
  Unique index { order:1, type:1, user:1 } where order exists, so an
  earning can never be posted twice. Label in UI: "Simulated settlement".
9.11 searchmisses
  queryNormalized: String; lang; count: Number; lastAt: Date
  Unique { queryNormalized:1 }. Written when a catalog search returns 0
  results. Used by What to Sell as an unmet-demand signal.
9.12 translationcaches
  hash: String unique (sha256 of from|to|text); result: String;
  createdAt (TTL not set).
9.13 growthreports
  seller: ObjectId; lang: "en"|"mr"; fingerprint: String (hash of data
  counts); content: Object (section PART 2); stats: Object;
  generatedAt: Date. Unique { seller:1, lang:1 }.
9.14 counters and idempotency
  counters: { _id: String, seq: Number }. Atomic $inc via findOneAndUpdate
  upsert. Keys: "order-YYMMDD" (IST date), "ticket".
  idempotency: { key: String, user: ObjectId, orderId: ObjectId,
  createdAt } with TTL index 24h and unique { key:1, user:1 }.

---------------------------------------------------------------------
10. ORDER STATE MACHINE (server enforced, in orders.service.js)
---------------------------------------------------------------------
Only these transitions are allowed. Anything else returns
ORDER_INVALID_TRANSITION. Every transition appends to statusHistory
(status, at, byUser, byRole, note) and runs inside one atomic update that
includes the expected current status in the filter (compare-and-set).

From AWAITING_PAYMENT:
  -> PLACED     by system after payment verification (prepaid only)
  -> CANCELLED  by customer, or by system after PAYMENT_TIMEOUT_MINS
From PLACED (visible to seller):
  -> ACCEPTED   by seller
  -> REJECTED   by seller (reason required) or system after AUTO_REJECT_HOURS
  -> CANCELLED  by customer
From ACCEPTED:
  -> PACKED     by seller ("Ready for pickup")
  -> REJECTED   by seller (allowed with reason, stock restored, refund)
From PACKED (visible to partners in range):
  -> ASSIGNED   by partner (atomic first-wins; see 10.2)
From ASSIGNED:
  -> PICKED_UP  by the assigned partner
  -> PACKED     by the assigned partner "release" (partner cleared)
From PICKED_UP (customer label "Out for delivery"):
  -> DELIVERED       by the assigned partner with the correct code
  -> DELIVERY_FAILED by the assigned partner with a reason
Terminal: DELIVERED, REJECTED, CANCELLED, DELIVERY_FAILED.

10.1 Side effects
  Create order: stock reserved atomically (10.3); cart cleared only after
    the order is created; delivery code generated; amounts computed.
  -> PLACED (COD): payment.status="COD_PENDING".
  -> PLACED (prepaid): payment.status="PAID", paidAt set.
  -> CANCELLED/REJECTED/DELIVERY_FAILED: restore stock exactly once
    (stockRestored flag); if payment.status="PAID" create a Razorpay
    refund (test mode) and set payment.status="REFUNDED"; if the refund
    call fails, keep payment.status="PAID", log REFUND_FAILED and retry
    from a job every 5 minutes.
  -> ASSIGNED: set partner, partnerAssignedAt, partner.activeOrder.
  -> PACKED by release: clear partner/partnerAssignedAt and activeOrder.
  -> PICKED_UP: pickedUpAt set.
  -> DELIVERED: deliveredAt; if COD set payment.status="COD_COLLECTED"
    and post COD_COLLECTED ledger entry for the partner; post
    SELLER_EARNING and PARTNER_EARNING ledger entries exactly once
    (ledgerPosted); increment soldCount per product; clear
    partner.activeOrder; the customer can now review each item.
  -> DELIVERY_FAILED: no earnings are posted; partner.activeOrder cleared.
10.2 Partner accept (first wins)
  findOneAndUpdate({ _id, status:"PACKED", partner:null }, set ASSIGNED).
  If no document is returned -> ORDER_ALREADY_ASSIGNED. A partner with an
  activeOrder cannot accept (PARTNER_BUSY). A partner must be online and
  within range (PARTNER_OUT_OF_RANGE).
10.3 Stock reservation
  For each item: findOneAndUpdate({ _id, status:"ACTIVE",
  stock:{ $gte: qty } }, { $inc:{ stock:-qty } }). If any item fails,
  re-increment the ones already decremented and return INSUFFICIENT_STOCK
  listing the failing products with their current stock.
10.4 Jobs (setInterval in jobs.js, started by index.js)
  every 5 min: cancel AWAITING_PAYMENT older than PAYMENT_TIMEOUT_MINS
    (first reconcile with Razorpay; if actually paid, mark PLACED);
  every 5 min: auto-reject PLACED older than AUTO_REJECT_HOURS;
  every 5 min: retry pending refunds and PENDING translations;
  every 1 min: mark partners offline if lastLocation older than
    LOCATION_STALE_SECONDS * 3 and no activeOrder.
  Each job is idempotent and logs counts.
10.5 Customer-visible labels (all translated via status.* keys)
  AWAITING_PAYMENT "Waiting for payment", PLACED "Order placed",
  ACCEPTED "Seller accepted", PACKED "Packed, waiting for a delivery
  partner", ASSIGNED "Delivery partner assigned", PICKED_UP "Out for
  delivery", DELIVERED "Delivered", REJECTED "Rejected by seller",
  CANCELLED "Cancelled", DELIVERY_FAILED "Delivery failed".

---------------------------------------------------------------------
11. BUSINESS FORMULAS (pricing.service.js, geo.service.js)
---------------------------------------------------------------------
11.1 Distance
  haversineKm(a,b) for straight-line distance. roadDistanceKm(a,b) calls
  OSRM route (driving, overview=full, geometries=geojson) with a 4 second
  timeout. If OSRM fails: haversine * OSRM_DETOUR_FACTOR and
  distanceEstimated=true. Cache by rounding coordinates to 4 decimals for
  GEO_CACHE_TTL_MINUTES (in-memory Map with expiry).
11.2 Delivery feasibility (F5)
  feasible = roadDistanceKm <= seller.maxDeliveryKm.
  Response: { feasible, distanceKm, estimated, etaMins,
    deliveryMode, deliveryChargePaise, reason }.
  reason: null | "OUT_OF_RANGE" | "SELLER_NOT_ACCEPTING".
11.3 ETA
  etaMins = seller.prepTimeMins + round(roadDistanceKm / AVG_SPEED_KMPH * 60).
  Shown as a range "about N-M mins" where M = N + 20 percent, rounded.
11.4 Partner payout
  raw = PARTNER_BASE_FEE_PAISE + round(PARTNER_PER_KM_PAISE * roadKm);
  payout = max(PARTNER_MIN_PAYOUT_PAISE, round to nearest 100 paise).
11.5 Platform fee
  platformFeePaise = round(itemsTotalPaise * PLATFORM_FEE_PERCENT / 100).
11.6 Customer amounts
  INCLUDED: customerDeliveryChargePaise = 0;
            totalPayable = itemsTotal.
  CUSTOMER_PAYS: customerDeliveryChargePaise = partnerPayout;
            totalPayable = itemsTotal + partnerPayout.
11.7 Seller net
  INCLUDED:       sellerNet = itemsTotal - platformFee - partnerPayout
  CUSTOMER_PAYS:  sellerNet = itemsTotal - platformFee
  Rule: sellerNet must be >= 0. If INCLUDED and sellerNet < 0, checkout is
  blocked with MIN_ORDER_NOT_MET and the response includes the amount
  needed. Also itemsTotal must be >= seller.minOrderPaise.
11.8 Ledger postings at DELIVERED (once)
  seller: SELLER_EARNING amount = sellerNet with breakdown.
  partner: PARTNER_EARNING amount = partnerPayout.
  COD: partner COD_COLLECTED amount = totalPayable.
  Seller earnings page = sum of SELLER_EARNING (simulated settlement).
  Partner "cash to deposit" = sum COD_COLLECTED - sum COD_COLLECTED
  deposits (COD_CASH_DEPOSITED).
11.9 Ratings
  On review create: recompute ratingSum, ratingCount, ratingAvg for the
  product and the seller from the reviews collection (aggregate), set in
  one update. ratingAvg rounded to 1 decimal. Display stars from ratingAvg.
11.10 Trending and nearby
  Trending = ACTIVE products ordered by units delivered in the last 14
  days (from orders), then ratingAvg desc, then soldCount desc.
  Sellers near you = sellers sorted by haversine from the customer's
  default address, only those where the customer is within maxDeliveryKm.
11.11 Milestones from GPS (tracking.service.js)
  On each partner location update for a PICKED_UP order:
   distance to drop <= NEARING_KM and nearingAt empty -> set nearingAt.
   distance to drop <= DROP_GEOFENCE_METERS and arrivedAt empty -> set
   arrivedAt. These become timeline steps "Nearing you" and "Arrived".
   Append to trail only if at least TRACK_POINT_MIN_INTERVAL_SEC since the
   last stored point or moved > 25 m. Cap trail length.
11.12 Delivery code check
  Compare after normalizeDigits. Wrong code increments codeAttempts; at
  DELIVERY_CODE_MAX_ATTEMPTS set codeLockedUntil = now + LOCK_MINS and
  return DELIVERY_CODE_LOCKED. Correct code resets attempts. If distance
  to drop > DROP_GEOFENCE_METERS: when STRICT_GEOFENCE=true block with
  PARTNER_OUT_OF_RANGE; else allow and set deliveredFarFromDrop=true.

---------------------------------------------------------------------
12. API CONVENTIONS AND ERROR CODES
---------------------------------------------------------------------
12.1 Base path /api/v1. JSON only (multipart only for image upload).
12.2 Success: { ok:true, data: ..., meta?: { page, pageSize, total } }
12.3 Error:   { ok:false, error:{ code:"CODE", message:"english fallback
     for logs only", details?:{...} } } with proper HTTP status.
12.4 Auth header: Authorization: Bearer <jwt>. JWT payload { sub, role }.
12.5 Pagination: ?page=1&pageSize=12 (max PAGE_SIZE_MAX).
12.6 POST /orders requires header Idempotency-Key (uuid from client).
12.7 Language: client sends header Accept-Language: en|mr on every
     request; AI endpoints and bilingual picks use it.
12.8 Error codes (client has errors.<CODE> keys in both languages):
  AUTH_REQUIRED, AUTH_INVALID_CREDENTIALS, AUTH_EMAIL_TAKEN,
  AUTH_TOKEN_EXPIRED, FORBIDDEN_ROLE, FORBIDDEN_OWNERSHIP,
  VALIDATION_FAILED, NOT_FOUND, RATE_LIMITED, INTERNAL_ERROR,
  PRODUCT_NOT_FOUND, PRODUCT_UNAVAILABLE, INSUFFICIENT_STOCK,
  PRICE_CHANGED, CART_DIFFERENT_SELLER, CART_EMPTY,
  CART_QTY_INVALID, MIN_ORDER_NOT_MET, SELLER_NOT_ACCEPTING,
  OUT_OF_DELIVERY_RANGE, ADDRESS_REQUIRED, ADDRESS_LIMIT,
  LOCATION_REQUIRED, GEOCODE_FAILED, ROUTE_FAILED,
  ORDER_NOT_FOUND, ORDER_INVALID_TRANSITION, ORDER_CANNOT_CANCEL,
  ORDER_ALREADY_ASSIGNED, PARTNER_BUSY, PARTNER_OFFLINE,
  PARTNER_OUT_OF_RANGE, PAYMENT_NOT_CONFIGURED, PAYMENT_FAILED,
  PAYMENT_SIGNATURE_INVALID, REFUND_FAILED,
  DELIVERY_CODE_INVALID, DELIVERY_CODE_LOCKED,
  REVIEW_NOT_ALLOWED, REVIEW_DUPLICATE,
  TICKET_NOT_FOUND, TICKET_CLOSED,
  AI_UNAVAILABLE, AI_BAD_OUTPUT, TRANSLATION_FAILED,
  UPLOAD_FAILED, UPLOAD_TOO_LARGE, UPLOAD_BAD_TYPE,
  IDEMPOTENCY_CONFLICT, DEMO_ONLY, SHOP_INCOMPLETE.
