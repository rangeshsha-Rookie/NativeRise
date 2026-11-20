=====================================================================
NATIVERISE - MASTER BUILD SPECIFICATION
PART 3 OF 3: FRONTEND, TESTS, DEPLOYMENT, BUILD PHASES, FINAL REPORT
=====================================================================
Part 3 uses everything defined in PART 1 and PART 2. Every page below
lists its route, purpose, sections, EVERY control and what it does, the
API calls, and the loading/empty/error states. If a control is not listed
here, do not invent one. If a listed control cannot work, tell me in the
final report; never leave it dead.

---------------------------------------------------------------------
19. FRONTEND FOUNDATIONS
---------------------------------------------------------------------
19.1 Routing (react-router 6). Guards: RequireAuth(role).
  PUBLIC (any visitor, any role):
    /                     customer home (language toggle shown)
    /products             catalog
    /products/:id         product detail
    /shops                sellers list
    /shops/:id            seller shop page
    /login  /register     auth (language toggle shown)
    *                     404 page
  CUSTOMER (role customer, else redirect to own home):
    /cart  /checkout  /orders  /orders/:id  /account
    /account/addresses  /support  /support/:id
  SELLER (role seller):
    /seller               home dashboard (language toggle shown)
    /seller/orders  /seller/orders/:id
    /seller/products  /seller/products/new  /seller/products/:id/edit
    /seller/what-to-sell  /seller/growth  /seller/earnings
    /seller/reviews  /seller/support  /seller/support/:id
    /seller/shop  /seller/assistant  /seller/account
  PARTNER (role partner):
    /partner              home (language toggle shown)
    /partner/jobs  /partner/active  /partner/history
    /partner/earnings  /partner/profile
  Redirects: logged-out user opening a protected route goes to
  /login?next=<path>. After login go to next (if allowed for the role)
  else the role home (customer "/", seller "/seller", partner
  "/partner"). A logged-in user opening /login goes to their home.
  A seller/partner opening a customer-only route goes to their home.
  Language toggle is rendered by the layout only when the current path
  is one of: "/", "/seller", "/partner", "/login", "/register".
19.2 Layouts
  CustomerLayout: Header + <main> + Footer + BottomNav (< md) +
    AssistantWidget (only when logged in).
  SellerLayout: top bar (logo + "Seller" badge, accepting-orders chip,
    account menu) + sidebar (>= lg) / BottomNav (< lg) + AssistantWidget.
  PartnerLayout: top bar (logo, online switch, account menu) + BottomNav.
  AuthLayout: minimal header (logo + toggle) + centered card.
  Customer Header: logo; search box with suggestions; location chip;
    cart icon with count badge; orders link; account menu (or Login and
    Register buttons when logged out). Seller/partner users on public
    pages see a header button "Go to my dashboard".
  Nav items (all labels via t()):
    Customer BottomNav: Home, Shop (/products), Orders, Cart, Account.
    Seller sidebar: Home, Orders, Products, What to sell, Growth Coach,
      Earnings, Reviews, Support, Assistant, Shop settings, Account.
      Seller BottomNav: Home, Orders, Products, Growth, More (drawer with
      the rest + Logout).
    Partner BottomNav: Home, Jobs, Active, Earnings, Profile.
  Header badges come from GET /me/badges (19.6) via polling:
    customer: unread tickets, active orders; seller: new orders, unread
    tickets; partner: available jobs (when online), active order dot.
19.3 API client (api/client.js)
  axios instance baseURL VITE_API_BASE_URL. Request interceptor adds
  Authorization (token from localStorage "nr_token") and Accept-Language
  (current lang). Response interceptor unwraps { ok, data, meta } and
  throws ApiError { status, code, details }. AUTH_TOKEN_EXPIRED or
  AUTH_REQUIRED on a protected call: clear token, go to /login?next=...
  with toast "Session expired". Network failure -> code NETWORK_ERROR.
  Unknown code -> errors.UNKNOWN. helper errorText(code, details, t).
19.4 TanStack Query conventions
  Defaults: staleTime 15s, retry 1 (never retry 4xx), refetchOnWindowFocus
  true. Live screens add refetchInterval POLL_INTERVAL_MS and
  refetchIntervalInBackground false.
  Query keys ALWAYS include the language when the response is language
  dependent: ["home", lang, lat, lng], ["products", lang, params],
  ["product", lang, id], ["order", lang, id], ["growth", lang] etc, so
  toggling the language refetches correctly.
  Key list: me, badges, home, products, product, productReviews, sellers,
  seller, cart, cartQuote, orders, order, tracking, route, tickets, ticket,
  addresses, s-dashboard, s-orders, s-orderCounts, s-order, s-products,
  s-product, s-earnings, s-reviews, s-tickets, s-ticket, growth,
  p-dashboard, p-jobs, p-active, p-history, p-earnings, p-profile.
  Invalidation map (after a successful mutation invalidate):
    cart mutation -> cart, cartQuote, badges
    create order -> cart, cartQuote, orders, order, badges, product(s)
    verify/reconcile/cancel -> order, orders, tracking, badges
    review create -> order, productReviews, product, products
    ticket create/message/status -> tickets, ticket, badges
    seller accept/reject/pack -> s-orders, s-orderCounts, s-order,
      s-dashboard, badges
    seller product create/update/stock/status/archive -> s-products,
      s-product, s-dashboard, products, product, home
    seller shop update -> s-dashboard, products, seller, home, me
    partner online/accept/release/pickup/deliver/fail -> p-dashboard,
      p-jobs, p-active, p-history, p-earnings, badges
    address change -> addresses, cartQuote, me, home, products
    language change -> invalidate EVERYTHING language dependent.
19.5 Shared hooks and utilities
  useCustomerLocation(): returns { lat, lng, label, source:"address"|
    "guest"|null, setGuestLocation(loc), needsLocation }.
    Logged-in customer: default saved address. Visitor: localStorage
    "nr_guest_loc". After login, if the customer has no saved address and
    a guest location exists, show a one-time modal "Save this location as
    your address?" (buttons Save / Not now).
  useGeolocation({ watch }): wraps navigator.geolocation with
    enableHighAccuracy true, timeout 10000, maximumAge 5000; exposes
    { position, error, status } and translated error messages for
    denied, unavailable, timeout, insecure-context.
  useWakeLock(active): requests navigator.wakeLock "screen" while active,
    re-requests on visibilitychange, returns { supported, held }.
  useDebounce, usePolling (thin wrapper), useDocumentTitle(key) sets
    document.title from t(), useOnlineStatus (banner "You are offline").
  useRazorpay(): loads https://checkout.razorpay.com/v1/checkout.js once.
  Global ErrorBoundary page with a "Reload" button. Toast provider.
19.6 Backend additions required by the frontend (implement with PART 2)
  A1 GET /me/badges [auth] -> customer { unreadTickets, activeOrders };
     seller { newOrders, unreadTickets }; partner { availableJobs,
     hasActive }.
  A2 GET /seller/pricing-preview?itemsTotalPaise=&km=&deliveryMode=
     [public] -> { platformFeePaise, partnerPayoutPaise,
     customerDeliveryChargePaise, sellerNetPaise } using pricing.service
     (shop settings page and register form show real numbers).
  A3 PUT /seller/shop also accepts isAcceptingOrders, photoUrl, coverUrl.
  A4 Steps contract for GET /orders/:id, /orders/:id/tracking,
     /seller/orders/:id, /partner/active: steps:[{ key, state, at }].
     Keys in order: paymentPending (prepaid only, shown only while
     AWAITING_PAYMENT), placed, accepted, packed, assigned, pickedUp,
     nearing, arrived, delivered. state: done (timestamp exists), current
     (first not done while the order is live), pending, failed. When the
     order ends early replace all remaining pending steps with ONE final
     step { key: "rejected"|"cancelled"|"failed", state:"failed", at }.
     Timestamps come from statusHistory and milestones.
  A5 GET /orders/:id also returns createdAt and paymentTimeoutAt.
  A6 GET /seller/orders/counts -> { new, active, completed, closed }.
  A7 All list endpoints return meta { page, pageSize, total, totalPages }.
19.7 Maps (components/map)
  Leaflet with tile layer https://tile.openstreetmap.org/{z}/{x}/{y}.png,
  maxZoom 19, attribution "© OpenStreetMap contributors" (required).
  Do not use Leaflet's default marker images (they break under Vite);
  use L.divIcon with inline SVG pins: shop (clay), home (ink), partner
  (primary-600 bike glyph), pin (ink). Map height 280 mobile, 420
  desktop; scrollWheelZoom disabled until focused (prevents page-scroll
  trap on mobile); keyboard accessible zoom control with translated
  aria-labels.
  MapView(props: markers, polylines, fitBounds, onClick).
  LocationPicker: see 20.14.  TrackingMap: see 20.9.
  RouteMap: planned route (dashed clay) + markers.
19.8 Static copy provided here (builder writes all other copy following
  section 8 rules; keep tone simple and warm)
  Home headline EN: Buy directly from village makers.
       MR: गावातील कारागिरांकडून थेट खरेदी करा.
  Home subline EN: Pickles, masalas, handloom, pottery and more,
       delivered to your door.
       MR: लोणची, मसाले, हातमाग, मातीची भांडी आणि बरेच काही, तुमच्या
       दारापर्यंत.
  How it works (EN | MR):
   1 Choose | निवडा: Pick products from village sellers. | गावातील
     विक्रेत्यांकडून वस्तू निवडा.
   2 Pay safely | सुरक्षित पेमेंट: Pay online in test mode or choose cash
     on delivery. | टेस्ट मोडमध्ये ऑनलाइन पैसे द्या किंवा कॅश ऑन
     डिलिव्हरी निवडा.
   3 Track live | थेट मागोवा: Follow your order on the map. | नकाशावर
     तुमच्या ऑर्डरचा मागोवा घ्या.
   4 Rate | रेटिंग द्या: Review after delivery to help other buyers. |
     डिलिव्हरीनंतर रिव्ह्यू देऊन इतर खरेदीदारांना मदत करा.
  Footer EN: NativeRise is a project prototype. Payments run in test
       mode and no real money is charged.
       MR: नेटिव्हराईज हा एक प्रकल्प प्रोटोटाइप आहे. पेमेंट टेस्ट मोडमध्ये
       चालते आणि कोणतेही खरे पैसे आकारले जात नाहीत.
       (Marathi brand name inside running text may be written in Latin.)
  Test-mode badge EN: Test mode - no real money moves
       MR: टेस्ट मोड - कोणतेही खरे पैसे जात नाहीत
  Simulated-settlement label EN: Simulated settlement
       MR: सिम्युलेटेड सेटलमेंट (नमुना हिशेब)
  Seller dashboard greeting EN: Welcome back, {{name}}
       MR: पुन्हा स्वागत, {{name}}

---------------------------------------------------------------------
20. CUSTOMER PAGES (every control, every state)
---------------------------------------------------------------------
20.1 Header search (all customer pages)
  Input with placeholder. Typing (debounce 300ms, min 2 chars) calls
  GET /search/suggest; dropdown lists up to 6 products and 3
  categories with keyboard navigation (Arrow keys, Enter, Esc).
  Click a product -> /products/:id. Click a category ->
  /products?category=slug. Enter or the search button -> /products?q=.
  Clear (x) button empties the field. Empty result shows "No
  suggestions". Error shows nothing (silent) but does not break typing.
20.2 Location chip (Header)
  Shows the label of the active location or "Set your location".
  Click opens LocationPicker (modal). Logged-in: saving adds an address
  and makes it default (POST /me/addresses). Visitor: "Use this
  location" stores a guest location. After saving everything that
  depends on location refetches (home nearby, product delivery badges,
  delivery check, cart quote).
20.3 HOME  "/"  (toggle visible)
  Data: GET /home?lat&lng. Sections in order:
  1 Hero (bark band): headline, subline, big search box (same behaviour
    as 20.1), location chip, primary button "Explore products" ->
    /products, secondary "See village shops" -> /shops. Right side shows
    3 real product images from trending (links to the products).
  2 Categories: 8 chips with icon and translated name -> /products?
    category=slug.
  3 Delivery strip: if no location: text + button "Set your location"
    (opens picker). With location: "Delivering to <label>" and the count
    of nearby sellers that can deliver (from nearbySellers feasible) and
    a "Change" button (opens picker).
  4 Trending products (8 ProductCards) + "View all" -> /products?sort=
    popular. ProductCard actions: card click -> product page;
    "Add to cart" quick button (customers only; see 20.5 for rules).
  5 How it works (bark band; copy in 19.8).
  6 Sellers near you (only with location): up to 6 shop cards with
    distance and a badge "Delivers to you" or "Too far"; click ->
    /shops/:id. If none: EmptyState "No shops deliver to this location
    yet" with a "Change location" button.
  7 Seller stories: 4 cards (shop name, village, excerpt) -> /shops/:id.
  8 Top rated (8 ProductCards).
  9 Recent verified reviews (3 cards, "Verified buyer" label, links to
    the product).
  10 Real stats band: sellers, products, delivered orders (counts from
    the API, formatted per language).
  Footer. All sections show skeletons while loading and ErrorState with
  Retry if /home fails. Sections with no data are hidden (never fake).
20.4 CATALOG "/products"
  URL query is the source of truth: q, category, minPrice, maxPrice,
  minRating, inStock, sort, page. Changing any control updates the URL.
  Controls: search input; category list (single select with "All");
  price min/max inputs (rupees, numeric, Devanagari digits accepted)
  with "Apply" button; rating select (Any, 3+, 4+); "In stock only"
  switch; sort select (Relevance when q, Popular, Price low-high, Price
  high-low, Top rated, Newest); "Clear all" button; active filter chips
  each removable. Mobile: filters open in a bottom-sheet with "Show N
  results" button. Results grid of ProductCards, pagination (12 per
  page), result count line. Empty state: "No products found" with
  "Clear filters" button and, when q exists, 3 category suggestions.
  If q is used and nothing is found the server records the miss.
20.5 ProductCard rules and quick add
  Quick "Add to cart" calls PUT /cart/items qty 1 (or +1 if present).
  Not logged in: go to /login?next=<current>&add=<productId> and after
  login perform the add automatically. Logged in as seller/partner:
  button replaced by a small note (translated) "Use a customer account
  to order". Out of stock: button disabled with text "Out of stock".
  CART_DIFFERENT_SELLER: modal "Start a new cart?" explaining the
  current cart is from <shop>; buttons "Keep my cart" and "Start new
  cart" (replace=true). Success toast "Added to cart" with a "View cart"
  action. Errors via error codes.
20.6 PRODUCT DETAIL "/products/:id"
  Sections: breadcrumb (Home / Category / Product); gallery (main image,
  thumbnails, keyboard arrows, alt text); title; rating stars + count
  (click scrolls to reviews); price; unit; stock label ("In stock",
  "Only N left", "Out of stock" from real stock); seller card (shop,
  village, rating) -> /shops/:id; description; DeliveryCheck panel
  (component below); quantity stepper; buttons "Add to cart" and "Buy
  now" ("Buy now" adds then navigates to /cart); reviews block;
  "More from this shop" and "Similar products" rows.
  DeliveryCheck (components/product/DeliveryCheck): uses
  useCustomerLocation and GET /geo/feasibility. States: no location ->
  button "Set your location"; loading skeleton; feasible -> "Delivers to
  <label>: Free delivery" or "Delivery Rs X", "about N-M mins", "D km"
  (with "approx." when estimated); not feasible -> "Too far: this shop
  delivers within N km" and the Add to cart button stays enabled but a
  warning is shown (the server blocks checkout with OUT_OF_DELIVERY_
  RANGE); seller not accepting -> message and Add to cart disabled;
  error -> Retry button.
  Reviews: rating breakdown bars (5..1 with counts), sort select (Newest,
  Highest, Lowest), list of review cards (stars, text, "First L.",
  date, "Verified buyer"), "Load more" button (pagination). No reviews
  -> EmptyState "No reviews yet". PAUSED/ARCHIVED product -> page shows
  "This product is not available" with a link to the shop.
20.7 SHOPS "/shops" and "/shops/:id"
  /shops: search input (q), category select, grid of shop cards (photo,
  name, village, rating, distance and delivery badge if location). Click
  -> shop page. Empty state.
  /shops/:id: cover + photo, shop name, village/district, rating, "Since
  <month year>", story (full), facts (delivers within N km, prep time,
  minimum order, delivery: "Free delivery" or "Customer pays delivery"),
  DeliveryCheck for the shop, products grid with pagination. Not
  accepting orders -> banner.
20.8 CART "/cart" (customer)
  Data: GET /cart and GET /cart/quote?addressId.
  Header: shop name (link). Each line: image, name, unit, price, stock
  hint, QuantityStepper (calls PUT /cart/items; disabled while saving),
  line total, "Remove" button. Line issues from the quote show a red
  note per line (out of stock, only N left, unavailable) with a "Fix"
  button that sets the quantity to the available stock or removes the
  line. Buttons: "Clear cart" (confirm modal -> DELETE /cart);
  "Continue shopping" -> /products. Summary card: items total,
  delivery ("Free" or charge), estimated total, ETA range, address block
  with "Change" (modal listing addresses, radio select, "Add new
  address" opens LocationPicker). Feasibility message when out of range
  or minimum order not met (shows the amount still needed:
  details.neededPaise). "Proceed to checkout" is disabled when
  canCheckout=false and shows the reason text beneath it. Empty cart:
  EmptyState with "Browse products". No address: block asking to set a
  location (opens picker).
20.9 CHECKOUT "/checkout" (customer)
  Guard: cart not empty and canCheckout else back to /cart with toast.
  Sections: 1 Delivery address (selected, "Change"); 2 Delivery details
  (ETA range, "Free delivery" or charge line); 3 Payment method radios:
  "Pay online (UPI / Card / Netbanking)" with the test-mode badge,
  and "Cash on Delivery"; 4 Order summary (items, delivery, total).
  Button "Place order" (disabled while busy). Flow:
   - Generate idempotencyKey (uuid) when the page mounts; keep it until
     success or until the cart changes.
   - POST /orders { addressId, paymentMethod, expectedTotalPaise } with
     the Idempotency-Key header.
   - COD: navigate to /orders/:id?placed=1.
   - RAZORPAY: call useRazorpay and open Checkout with { key: keyId,
     amount, currency, order_id, name "NativeRise", description orderNo,
     prefill { name, email, contact }, theme { color "#8DBBFA" },
     modal.ondismiss, handler }. handler -> POST /orders/:id/payment/
     verify then navigate to /orders/:id?placed=1. ondismiss -> navigate
     to /orders/:id (order page offers "Pay now"). payment.failed event
     -> POST /orders/:id/payment/failed, toast "Payment failed, you can
     try again", stay on the order page.
  Error handling: PRICE_CHANGED / INSUFFICIENT_STOCK / MIN_ORDER_NOT_MET
  / OUT_OF_DELIVERY_RANGE open a modal listing exactly what changed
  (from details) with a "Review cart" button. PAYMENT_NOT_CONFIGURED
  disables the online option with a note and keeps COD usable.
20.10 ORDERS LIST "/orders"
  Tabs: Active, Completed, Closed (GET /orders?status=). Each card:
  order number, date (IST), shop, thumbnail, item count, total, status
  badge, payment badge; click -> /orders/:id. Active tab polls every 5s.
  Empty states per tab. Pagination.
20.11 ORDER DETAIL "/orders/:id"  (polls every 5s while not terminal)
  On load, if status is AWAITING_PAYMENT call POST /orders/:id/reconcile
  once (fixes "paid but popup closed").
  Sections:
  - Header: order number, status badge, placed date, payment badge, a
    success banner when ?placed=1.
  - AWAITING_PAYMENT panel: countdown to paymentTimeoutAt, buttons "Pay
    now" (POST /payment/retry then open Razorpay as in 20.9) and "Cancel
    order".
  - Timeline (steps from the server, section 19.6 A4) with times.
  - Tracking map (when status is ASSIGNED, PICKED_UP or DELIVERED):
    TrackingMap polls GET /orders/:id/tracking every 5s only while
    PICKED_UP. Shows pickup (shop), drop (home), planned route (dashed),
    travelled trail (solid), partner marker with "Updated N sec ago".
    stale=true shows "Location not updated for N min". While ASSIGNED
    show "Delivery partner is heading to the shop" with no live marker.
    After DELIVERED show the final trail. Remaining distance and ETA
    shown while PICKED_UP.
  - Partner card (from ASSIGNED): name, vehicle, "Call" (tel: link).
  - Delivery code card (only ASSIGNED/PICKED_UP): big digits, text
    "Share this code only with the delivery partner at your door".
  - Items list, address block, amounts (items total, delivery "Free" or
    charge, total, payment method).
  - Payment receipt card: Paid by (instrument), Paid to "NativeRise
    (Razorpay test)", Payment ID, Order ID, time, status; button "Print
    receipt" (window.print with @media print CSS showing only the
    receipt). COD shows "Cash on delivery".
  - Cancel button (only when canCancel): modal with reason select +
    optional note -> POST /orders/:id/cancel. Success toast shows
    "Refund started" when prepaid.
  - DELIVERED: per item "Rate this product" button -> ReviewForm modal
    (RatingStars input required, textarea optional 600 chars, submit ->
    POST /reviews). After saving show "Your rating" with stars. Duplicate
    prevented by the server and by hiding the button.
  - Help: "Raise a query" -> NewTicketModal (subject select: Delay,
    Damaged item, Wrong item, Payment, Other; message textarea) -> POST
    /support/tickets then navigate to /support/:id. "Ask the assistant"
    opens the widget with the order number prefilled.
  - Terminal failure states show a clear banner with the reason
    (rejected/cancelled/delivery failed) and refund status.
20.12 SUPPORT "/support" and "/support/:id"
  List: status filter tabs (All, Open, In progress, Resolved), ticket
  cards (ticket no., subject, order no., status, last update, unread
  dot). Empty state. Polls every 5s.
  Thread: header (subject, status badge, order link), message bubbles
  (customer right, seller left, time), reply textarea + "Send" (POST
  messages), "Mark as resolved" button (PATCH status), resolved banner
  with "Reopen by sending a message". Polls every 5s.
20.13 ACCOUNT "/account" and "/account/addresses"
  Account: edit name and phone (PATCH /me), change password form
  (current/new/confirm -> PATCH /me/password), links to Addresses,
  Orders, Support, "Log out" button. NO language toggle here.
  Addresses: list (label, line, landmark, default badge), buttons
  "Set as default", "Edit" (opens picker prefilled), "Delete" (confirm),
  "Add address" (max 5, otherwise button disabled with text). 
20.14 LOCATIONPICKER (shared component; modal on desktop, full-screen
  sheet on mobile). The customer ENTERS THEIR OWN REAL LOCATION.
  Controls:
  - Search input (debounce 500ms, min 3 chars) -> GET /geo/search; result
    list; choose one to move the pin. No results message; error retry.
  - "Use my current location" button -> getCurrentPosition; moves pin;
    errors: denied ("Allow location access in your browser settings"),
    unavailable, timeout, insecure context. 
  - Map: draggable pin; clicking the map moves the pin; zoom controls.
  - After each pin move call GET /geo/reverse and fill "Address"
    (editable textarea). Show village/district/pincode read-only below.
  - "Landmark" input (helper text: "Example: near the temple, behind
    the school"). Strongly encouraged but optional.
  - Label chips (Home, Work, Other).
  - Confirm button "Save this location" (logged-in customer) or "Use this
    location" (visitor). Validates lat/lng inside India bounds.
  - Cancel/close button.
  Also used by seller registration/shop settings (shop location, no
  label/landmark) and partner registration/profile (base location).
20.15 ASSISTANT WIDGET (customers and sellers when logged in)
  Floating round button (above the bottom nav on mobile). Panel: title,
  "New chat" button, close button, message list, suggestion chips shown
  while the chat is empty (customer: "Show products under Rs 300", "Show
  pickles near me", "Where is my order?", "Can you deliver to my
  location?", "What is the cancellation policy?"; seller: "How many
  orders did I get this week?", "Write a description for my mango
  pickle", "What do my customers complain about most?", "Which products
  are low on stock?", "Show my earnings this week"). Each chip sends that
  text. Input + "Send" (Enter sends, Shift+Enter newline), typing
  indicator, retry button on error. Product/order/ticket "cards" from the
  response render as real mini-cards that link to the page.
  suggestedAction CREATE_TICKET renders a "Send to seller" button that
  opens NewTicketModal prefilled and editable (nothing is created until
  the user submits). History: last 10 messages kept in component state
  and sessionStorage per user; sent with each request. The widget uses
  the current language for requests (Accept-Language) and its own labels
  are translated. Seller mode shows the same widget and the full-page
  version at /seller/assistant.

---------------------------------------------------------------------
21. SELLER PAGES (every control, every state)
---------------------------------------------------------------------
21.1 REGISTER (seller tab on /register) fields and rules
  Common: full name, email, phone (10 digits, Devanagari digits ok),
  password (+ confirm, show/hide). Seller: shop name, story (textarea,
  40-600 chars with live counter), location (LocationPicker, required;
  district/pincode/village prefilled from reverse geocode and editable),
  village, district, pincode, delivery radius km (3-100), preparation
  time (minutes, with quick chips 60/120/240/480), minimum order (rupees),
  delivery mode radios:
    "Delivery included in my prices (customers see Free delivery)"
    "Customer pays delivery separately"
  with a live example box from GET /seller/pricing-preview for a Rs 300
  order at 10 km showing "You earn Rs X" so the seller understands the
  money effect. Submit -> POST /auth/register -> auto login -> /seller
  with a welcome card (Add first product, What to sell). Errors map to
  fields via details.path.
  Partner tab: name, email, phone, password, vehicle type (select),
  vehicle number (optional), base location (picker), service radius km.
  Customer tab: name, email, phone, password.
  Language toggle visible on this page.
21.2 LOGIN "/login"
  Email, password, show/hide, "Log in". Error AUTH_INVALID_CREDENTIALS
  shown inline. Link to register. If VITE_DEMO_TOOLS_ENABLED=true show a
  "Demo logins" card with one button per role (Customer, Seller,
  Delivery partner) that fills the form with a seeded account
  (rohan.customer@demo.nativerise.test, sunita.seller@demo.nativerise
  .test, sanjay.partner@demo.nativerise.test and the demo password). 
21.3 SELLER HOME "/seller" (toggle visible)
  Greeting (19.8). "Accepting orders" switch (PUT /seller/shop
  isAcceptingOrders) with confirm when turning off. StatCards from GET
  /seller/dashboard: New orders, In progress, Delivered today, Net
  earnings this week (with "Simulated settlement" label), Rating.
  Pending actions list (links: new orders, low stock, open tickets).
  Low stock list (name, stock, "Update stock" inline: number input +
  Save -> PATCH stock). Recent reviews (5). Quick actions: Add product,
  What to sell, Growth Coach, Open assistant. Polls every 5s.
21.4 ORDERS "/seller/orders" and "/seller/orders/:id" (poll 5s)
  Tabs New, In progress, Completed, Closed with count badges
  (GET /seller/orders/counts). Order card: order no., age ("12 min
  ago"), customer name + locality, items (name x qty), items total,
  "You earn Rs X" (sellerNetPaise) with an info popover showing
  breakdown (items total, platform fee, delivery cost if INCLUDED, net),
  payment label (Paid online / Cash on delivery), status badge. Buttons:
    New: "Accept" (POST accept) and "Reject" (modal: reason select
      Out of stock / Cannot prepare in time / Other + note; POST reject).
    Accepted: "Mark ready for pickup" (POST pack).
    Packed: text "Waiting for a delivery partner" (live).
    Assigned/Picked up: partner name, vehicle, "Call partner" (tel:) and
      status text.
  Detail page: timeline (steps), items, customer name, phone and "Call"
  (from ACCEPTED), delivery area (no full address), amounts breakdown
  labelled "Simulated settlement", partner info, support tickets for the
  order. Accept shows a confirm dialog repeating the net earning so the
  seller knows what they accept. All errors via codes.
21.5 PRODUCTS "/seller/products"
  Tabs Active, Paused, Archived; search; list/cards: image, name, price,
  stock, rating, status. Controls per product: inline stock editor
  (input + "Save"), status switch Active/Paused, "Edit" -> edit page,
  "Archive" (confirm; DELETE). Low stock (<=5) highlighted. Button "Add
  product" -> /seller/products/new. Empty state with the same button.
21.6 ADD/EDIT PRODUCT "/seller/products/new" and ".../:id/edit"
  (Snap & Sell + Voice listing; uses components/ai/SnapSellForm)
  Top: two big actions.
   "Snap a photo": file input (accept image/*, capture environment on
     phones) -> client resizes to max 1024px JPEG 0.8 -> shows preview
     -> POST /ai/snap-and-sell (with transcript if present) -> prefills
     the form. While loading show a progress state. recognized=false ->
     message "We could not recognise this item. Please fill in the
     details." keep the image attached.
   "Speak the details": language select (Marathi / Hindi / English; this
     is the VOICE language only, not the site language) + mic button.
     Uses the Web Speech API (SpeechRecognition / webkitSpeechRecognition,
     lang mr-IN, hi-IN, en-IN). Shows live transcript in an editable box,
     "Fill the form" button -> POST /ai/voice-to-listing -> prefills
     missing fields only. If the browser lacks speech support: show the
     message "Voice input works in Chrome or Edge" in place of the mic.
     Mic errors (not-allowed, no-speech, network) shown translated.
  Form fields: images (up to 5, upload via POST /uploads/image, remove
  button each, first image is the cover), category select (8), name EN
  and MR, description EN and MR each with a "Write for me" button (POST
  /ai/describe), price (rupees; shows the suggested range chip from AI:
  "Similar items: Rs min - max"), quantity value + unit select, stock,
  keywords (optional tag input). A notice: "We translated the other
  language for you. Please check both." Buttons: "Publish" (POST/PUT),
  "Cancel". Validation inline with translated messages; unsaved-changes
  prompt on leaving. After publishing: toast and redirect to
  /seller/products; the product is immediately visible on the customer
  site (cache invalidation per 19.4). Query params from What to Sell
  (?title=&category=) prefill the form.
21.7 WHAT TO SELL "/seller/what-to-sell" (F1)
  Form: resources (multi-select chips: Land, Orchard, Livestock, Spare
  time, Weaving, Pottery, Cooking, Woodwork, Other), skills textarea
  (optional, 300 chars), budget select (Under Rs 5,000 / 5,000-20,000 /
  20,000-50,000 / Above 50,000), hours per day (number 1-12). Button "Get
  ideas" -> POST /ai/what-to-sell. Result: 4 idea cards (title, why it
  fits, demand signal text, startup cost range, first step, selling tip,
  button "Use this idea" -> /seller/products/new?title=&category=).
  "Market signals" panel lists the real numbers used (top categories,
  unmet searches) so it is transparent. "Try again" button regenerates.
  Loading and error states. Output is in the current language.
21.8 GROWTH COACH "/seller/growth" (F3)
  GET /ai/growth-coach. Shows: summary card; badge "Generated with AI"
  or "Generated from templates" (aiGenerated flag); if basis is PLATFORM
  the label "Based on similar products on NativeRise"; "Make more of"
  cards (product image/title, why with real numbers, action, buttons
  "Update stock" -> inline stock editor and "Open product" -> edit
  page); "Improve" cards (title, why, action; theme items show the
  related reviews link -> /seller/reviews?theme=); weekly tip; charts
  built with dependency-free SVG components: weekly units for the top 3
  products (line chart, 8 weeks) and review themes (horizontal bars,
  positive vs negative). Button "Refresh insights" -> ?refresh=1 with
  loading state and the generated-at time shown. Empty sections are
  hidden, never filled with fake text.
21.9 EARNINGS "/seller/earnings"
  Banner "Simulated settlement - no real money is transferred". Range
  tabs (7 days, 30 days, All). StatCards: net earnings, items total,
  platform fee, delivery cost, delivered orders. Bar chart per day (SVG).
  Table of orders: order no., delivered date, items total, platform fee,
  delivery cost, net (cards on mobile) with pagination.
21.10 REVIEWS "/seller/reviews"
  Filters: product select, rating select (all, 1-2, 3, 4-5), theme chip
  (from query). List: product, stars, text (current language), theme
  chips, date, "Verified buyer". Pagination. Empty state.
21.11 SUPPORT INBOX "/seller/support" and ".../:id"
  List (unread first, status filter tabs, poll 5s). Thread: messages,
  order summary panel (order no., status, items, timeline), reply box,
  buttons "Draft with AI" (POST draft-reply, fills the box, editable,
  never auto-sends), "Send reply", "Mark in progress", "Mark resolved".
21.12 SHOP SETTINGS "/seller/shop"
  Edit all shop fields from 21.1 (name, story, village, district,
  pincode, location picker, radius, prep time, min order, delivery mode
  with live pricing preview), photo and cover upload, "Accepting orders"
  switch, "Save changes" (PUT /seller/shop). Success toast; changes
  appear on customer pages immediately.
21.13 ASSISTANT "/seller/assistant" full-page AssistantWidget (seller
  mode) with the seller chips from 20.15.
21.14 ACCOUNT "/seller/account": name, phone, password change, Logout.
  NO language toggle here.

---------------------------------------------------------------------
22. DELIVERY PARTNER PAGES (mobile-first, big buttons)
---------------------------------------------------------------------
22.1 PARTNER HOME "/partner" (toggle visible)
  Top: Online/Offline switch (also in the top bar). Turning ON: request
  GPS via useGeolocation -> PATCH /partner/online { isOnline:true, lat,
  lng, accuracy }; on success start the heartbeat and Wake Lock. Errors:
  LOCATION_REQUIRED/denied -> message with how to allow location.
  Turning OFF: confirm; blocked with PARTNER_BUSY text when an order is
  active. While online show a card "Keep this screen on to share your
  live location" (translated) and a visible status "Location sharing
  active / paused" with last sent time. If the page becomes hidden and
  returns, show "Location sharing was paused while the screen was off".
  StatCards (GET /partner/dashboard): Delivered today, Earnings today,
  Total earnings, Cash to deposit (with "Simulated settlement" label).
  Active order card (if any) -> /partner/active. Button "See available
  orders" -> /partner/jobs (with count badge). Polls every 5s.
  HEARTBEAT: while online (or with an active order), POST /partner/
  location every 10 seconds with the latest position; on failure retry
  next tick and show the paused status after 2 failures.
22.2 JOBS "/partner/jobs" (poll 5s)
  Requires online (else EmptyState with a "Go online" button). Cards:
  shop name, pickup address line, distance to pickup, pickup-to-drop
  distance, drop locality, payout (Rs), items count, COD badge with
  amount if COD, packed time. Button "Accept" -> POST accept: success
  -> /partner/active; ORDER_ALREADY_ASSIGNED -> toast and refresh;
  PARTNER_BUSY -> text "Finish your current delivery first" and the
  Accept buttons are disabled when an active order exists. Empty state:
  "No orders are ready nearby. This list updates automatically."
22.3 ACTIVE "/partner/active" (poll 5s)
  Empty state if none. Otherwise: StepIndicator (Assigned, Picked up,
  Delivered), RouteMap (partner live position from own GPS, pickup, drop
  and the planned route from GET /partner/orders/:id/route), details
  card (pickup shop + phone + address; drop customer name + phone +
  address + landmark; items; payout; COD amount).
  Actions by status:
   ASSIGNED: "Call seller" (tel:), "Navigate to shop" (opens https://www.
    google.com/maps/dir/?api=1&destination=lat,lng in a new tab),
    "Mark picked up" (POST pickup), "Release order" (confirm -> POST
    release).
   PICKED_UP: "Call customer" (tel:), "Navigate to customer", COD
    banner "Collect Rs X cash before handing over", delivery code input
    (4 numeric boxes, Devanagari digits accepted, auto-advance) and
    "Mark delivered" (POST deliver); wrong code shows DELIVERY_CODE_
    INVALID with attempts left; locked shows DELIVERY_CODE_LOCKED with
    the unlock time. "Cannot deliver" opens a modal (reasons: Customer
    not reachable, Address not found, Customer refused, Other + note ->
    POST fail).
   On success show a completion screen: earnings added, COD amount
   collected reminder, buttons "Back to home" and "See jobs".
  "Demo drive (simulated)" button: rendered ONLY when
  VITE_DEMO_TOOLS_ENABLED=true, with a visible "Simulated" badge. It
  replays the planned route by sending POST /partner/location with
  simulated=true every 3 seconds, moving along the route, until stopped
  ("Stop demo" button). Off by default; never auto-starts.
22.4 HISTORY "/partner/history": list of delivered/failed orders with
  date, shop, payout or "Failed" with reason, pagination, empty state.
22.5 EARNINGS "/partner/earnings"
  Banner "Simulated settlement". Range tabs (7d/30d/all). Totals: payout,
  deliveries. Cash to deposit card with "Record deposit" button (modal:
  amount input defaults to the balance, validation <= balance -> POST
  /partner/cash-deposit). Daily bars (SVG) and a rows table.
22.6 PROFILE "/partner/profile": edit name, phone, vehicle type, vehicle
  number, base location (picker), service radius (PUT /partner/profile
  and PATCH /me), change password, Logout. NO language toggle here.

---------------------------------------------------------------------
23. GLOBAL UI BEHAVIOUR (every page)
---------------------------------------------------------------------
23.1 Every page sets document.title via t(). Every image has alt text.
23.2 Loading: skeletons that match the final layout. Buttons show a
  spinner and stay the same width. No full-page spinners except the
  first auth restore (GET /auth/me) which shows the logo.
23.3 Errors: inline ErrorState with Retry for page data; toast for action
  failures; field errors under inputs.
23.4 Offline: banner "You are offline" and actions disabled.
23.5 Currency always via formatINR; dates via Intl IST; digits follow the
  current language.
23.6 Confirm dialogs for destructive actions: clear cart, cancel order,
  reject order, archive product, delete address, turn off accepting
  orders, go offline, release order.
23.7 Print stylesheet only for the order receipt.
23.8 No page may show data that is not returned by the API.
23.9 Responsive checks at 360, 414, 768, 1024, 1440 for every route in
  both languages (see section 25.4).

---------------------------------------------------------------------
24. TESTS (must exist and pass)
---------------------------------------------------------------------
24.1 Worked numeric examples (pricing.test.js must assert all of them)
  Rounding: money values are integers; round half up with Math.round.
  A) items Rs 400 (40000), road 10 km, INCLUDED:
     payout = 1500 + 400*10 = 5500 (Rs 55); fee = 2000 (Rs 20);
     customer pays 40000; sellerNet = 40000-2000-5500 = 32500 (Rs 325).
  B) same, CUSTOMER_PAYS: customerDeliveryCharge 5500; total 45500;
     sellerNet = 40000-2000 = 38000.
  C) items Rs 150 (15000), road 30 km, INCLUDED: payout 1500+12000 =
     13500; fee 750; sellerNet 750 (allowed, >= 0).
  D) items Rs 150, road 40 km, INCLUDED: payout 17500; fee 750; net
     -3250 -> MIN_ORDER_NOT_MET with neededPaise = ceil(payout /
     (1 - 0.05) / 100) * 100 = 18500.
  E) road 0.5 km: raw 1700 -> payout 2500 (minimum).
  F) ETA: prep 120, 10 km -> 120 + round(10/25*60=24) = 144 minutes;
     range 144 to round(144*1.2)=173.
  G) fee: items 33300 -> round(1665) = 1665.
24.2 Backend integration tests (vitest + supertest + mongodb-memory-
  server): full lifecycle (COD and prepaid with computed test HMAC),
  every invalid transition, wrong roles, ownership, price changed,
  insufficient stock, concurrent last-item purchase (two parallel
  requests, exactly one succeeds), concurrent partner accept (exactly one
  succeeds), duplicate POST /orders with the same Idempotency-Key
  (returns the same order), delivery code wrong x5 lock and unlock, stock
  restored on cancel/reject/fail, refund state, ledger posted exactly
  once, review rules (only delivered, once per item), rating recompute,
  privacy rules (15.6), minimum order and negative-net blocking,
  tracking milestones (nearing/arrived), search miss recording,
  translation fallback when Gemini is unavailable, error code mapping.
24.3 AI tests (run only when RUN_AI_TESTS=true and keys exist): the 10
  demo questions (PART 2 16.4) asserting the right tool calls and that
  the reply references real seeded data; What to Sell returns 4 valid
  ideas; Snap & Sell with a sample image returns a valid schema; Growth
  Coach output contains no number outside the facts.
24.4 Frontend unit tests: normalizeDigits, formatINR (en and mr),
  pick(), error code -> text mapping, QuantityStepper limits,
  LanguageToggle visibility rule (only on the 5 allowed routes).
24.5 End-to-end (Playwright, three browser contexts: customer, seller,
  partner; use context geolocation permissions and setGeolocation to
  provide real browser coordinates; no app-side mocking):
  E1 seller registers (Marathi mode), picks a location, publishes a
     product manually, it appears in the customer catalog.
  E2 customer logs in, sets a location, finds the product by searching
     in Marathi, adds to cart, checks out with COD.
  E3 seller sees the order within 5 seconds, accepts, marks ready.
  E4 partner goes online, sees the job, accepts, picks up, sets
     coordinates along a path, customer tracking page shows the live
     marker, partner enters the delivery code, order becomes DELIVERED.
  E5 seller earnings and partner earnings show the new amounts; customer
     leaves a review; product rating updates.
  E6 prepaid flow using Razorpay test mode if the iframe can be driven
     (UPI success@razorpay); otherwise cover the server verification with
     the integration test and report the limitation.
  E7 cancel-before-accept flow with stock restoration.
24.6 i18n crawl (tests/e2e/i18n-crawl.spec.js): see section 25.

---------------------------------------------------------------------
25. MARATHI COMPLETENESS AND LAYOUT QA
---------------------------------------------------------------------
25.1 scripts/check-i18n.mjs (npm run check:i18n) per PART 1 8.11. It
  must pass in CI and before deploy.
25.2 i18n crawl: log in as each demo role, switch to Marathi using the
  toggle on the allowed pages, visit EVERY route in section 19.1 (using
  seeded ids for dynamic routes), open the main modals (location picker,
  new ticket, review form, reject order, cancel order, release order),
  and collect: all visible text nodes, placeholder, title, alt,
  aria-label, document.title. Fail the run if any contains Latin letters
  outside the allowlist (PART 1 8.9). Print the offending route and text.
25.3 AI outputs: assistant, Growth Coach, What to Sell, Snap & Sell and
  translations must respect the language header; check that Marathi
  responses contain Devanagari.
25.4 Layout QA: Playwright screenshots of every route in both languages
  at widths 360, 768, 1440 saved to /qa-screenshots; fail if a page has
  horizontal scroll (document.scrollWidth > innerWidth) or if any button
  text is clipped (scrollWidth > clientWidth on buttons/badges).
25.5 The owner will read the Marathi files; list in the final report the
  50 strings you are least sure about.

---------------------------------------------------------------------
26. DEPLOYMENT (free tiers)
---------------------------------------------------------------------
26.1 Inputs the owner must provide (ask for these ONLY if missing; do not
  ask anything else): MongoDB Atlas connection string; Cloudinary cloud
  name, API key, API secret; Razorpay TEST key id and secret; Gemini API
  key; the Fawn reference screenshot at /design-reference/fawn.png.
26.2 Steps
  1 Atlas: M0 cluster, database user, Network Access 0.0.0.0/0.
  2 Push the repo to GitHub.
  3 Render: new Web Service from the repo, root directory server, build
    "npm install", start "npm start", health check /health, free plan,
    all server env vars from PART 1 6.1, CLIENT_ORIGIN = the Vercel URL
    (add the localhost URL too).
  4 Run "npm run seed" against the Atlas database (locally with
    MONGODB_URI or in the Render shell). Verify counts printed.
  5 Vercel: import the repo, root directory client, framework Vite,
    env vars from PART 1 6.3 with VITE_API_BASE_URL set to the Render URL
    + /api/v1. Add client/vercel.json with a rewrite of all paths to
    /index.html so deep links work.
  6 Update CLIENT_ORIGIN on Render with the final Vercel URL and
    redeploy.
  7 Optional Razorpay webhook: <render-url>/api/v1/payments/webhook with
    the secret in RAZORPAY_WEBHOOK_SECRET.
  8 Cold start note: Render free sleeps after about 15 minutes idle and
    takes about 50 seconds to wake. Add the owner instruction in the
    README: open the site 2 minutes before a demo, or add a free
    uptime monitor that pings /health every 5 minutes.
  9 GPS and voice need HTTPS: Vercel and Render provide it. Remind the
    owner to test the partner flow on a real phone with the deployed URL.
26.3 Smoke test on the deployed site (script it in Playwright against
  the production URL with demo accounts; also list it as a manual
  checklist in the README): home loads with 40 products; Marathi toggle
  works on the 3 homes; customer location picker works; add to cart;
  COD order; seller accepts; partner accepts and delivers; customer
  review; assistant answers a question; Growth Coach loads; What to Sell
  returns ideas; Snap & Sell with an uploaded photo returns a draft.
26.4 README must contain: setup, env, scripts, demo accounts table, the
  two demo modes (preloaded and live), how to reset (seed:reset), cold
  start note, the limitations list, and how to run all tests.

---------------------------------------------------------------------
27. SCRIPTS (package.json)
---------------------------------------------------------------------
  root: dev (server + client together), test, lint, check:i18n, e2e,
    seed, seed:reset
  server: start, dev, test, seed, seed:reset
  client: dev, build, preview, lint, test, e2e
  Husky/pre-commit is NOT required. CI file optional.

---------------------------------------------------------------------
28. BUILD PHASES (do them in order; verify each before the next)
---------------------------------------------------------------------
Phase 0 Scaffold: repo structure (PART 1 section 5), env validation,
  constants, DB connection, health route, lint config.
  Verify: server starts and refuses to start with a missing env var;
  client builds; eslint passes.
Phase 1 Data and catalog: models, indexes, utils (money, digits, pick),
  auth, me, addresses, geo, catalog, categories, cart, quote, seed
  (accounts, sellers, products, images, reviews, history, open orders,
  tickets, search misses).
  Verify: npm run seed prints the expected counts (8 sellers, 40
  products, 5 customers, 3 partners, about 160 reviews, history, open
  orders); unit tests for pricing and money pass.
Phase 2 Orders and logistics: orders service, state machine, payments
  (create, verify, reconcile, refund, webhook), seller order endpoints,
  partner endpoints, tracking, ledger, jobs, all addendum endpoints.
  Verify: backend integration tests (24.2) pass, including concurrency.
Phase 3 AI: gemini client, translation service, assistant, What to Sell,
  Snap & Sell, voice parse, describe, review classification, support
  draft, Growth Coach.
  Verify: RUN_AI_TESTS=true npm test passes; the 10 demo questions work.
Phase 4 Frontend foundation: design tokens, Tailwind config, UI
  components, i18n setup (en first, then mr files), layouts, router,
  auth pages, API client, query setup, LanguageToggle, maps components,
  hooks. Verify: lint, build, unit tests, check:i18n.
Phase 5 Customer app: sections 20.1 to 20.15.
Phase 6 Seller app: sections 21.1 to 21.14.
Phase 7 Partner app: sections 22.1 to 22.6.
Phase 8 Marathi and layout completion: finish every mr namespace, run
  check:i18n, i18n crawl, layout QA; fix everything they report.
Phase 9 End-to-end tests (24.5), polish, README, DECISIONS.md.
Phase 10 Deploy (section 26), run the production smoke test, fix.
Rules for all phases: no phase is "done" while its verification fails;
fix root causes (do not weaken tests or checks); keep commits small
with clear messages; if blocked by a missing secret ask the owner once
for ALL missing items together.

---------------------------------------------------------------------
29. FINAL REPORT FORMAT (your last message)
---------------------------------------------------------------------
  1 Live URLs (client, server health) and demo accounts table.
  2 What was built per role (3 short lists), mapped to features F1-F10.
  3 Test results: counts and any failing/skipped tests and why.
  4 i18n results: check:i18n, crawl output summary, the 50 least-sure
    Marathi strings.
  5 DECISIONS.md highlights (deviations from this spec, each with the
    reason).
  6 Known limitations (be honest; include at least): Razorpay popup and
    GPS permission prompt language; map credit and tile labels; phone
    screen lock can stop GPS even with Wake Lock; machine-translated
    Marathi needs owner review; Render free cold start; settlement is
    simulated; seeded reviews and orders are demo data; voice input
    needs a Chromium browser and accuracy varies by accent; public
    Nominatim/OSRM servers have fair-use limits.
  7 Anything in this spec NOT completed, listed plainly. Do not claim
    completion for anything that is not working.

=====================================================================
END OF SPECIFICATION (PARTS 1, 2 AND 3). BEGIN AT PHASE 0.
=====================================================================
