# MandiSetu: Comprehensive Technical Stack & Architecture Documentation

## 1. Executive System Overview

**MandiSetu** is an intelligent, full-stack, cloud-native agricultural trading and settlement exchange designed to eliminate asymmetric information, non-transparent intermediary fees, and counterparty payment default across Indian Agricultural Produce Market Committees (APMCs).

The platform bridges smallholder farmers, Farmer Producer Organisations (FPOs), and institutional buyers through autonomous price discovery, computer vision produce grading, bilateral matching algorithms, and a multi-stage dynamic escrow protocol.

---

## 2. Frontend Engineering Stack

The client tier is built as an ultra-responsive, single-page application (SPA) optimized for low-bandwidth mobile terminals in rural markets, featuring multi-lingual i18n localization (English, Hindi, Marathi, Odia).

| Tool / Library | Version | File Locations / Where Used | Architectural Purpose & Why Used |
| :--- | :--- | :--- | :--- |
| **React** | `^18.2.0` | `frontend/src/main.jsx`, `frontend/src/App.jsx`, `frontend/src/pages/*` | Component-based UI hierarchy with concurrent rendering, declarative state hooks (`useState`, `useEffect`, `useRef`), and isolated per-page error boundaries (`PageErrorBoundary`). |
| **Vite** | `^5.4.0` | `frontend/vite.config.js`, `frontend/package.json` | Next-generation ESM build tool delivering near-instant Hot Module Replacement (HMR) during development and tree-shaken, optimized Rollup production bundles. |
| **Tailwind CSS** | `^3.4.0` | `frontend/tailwind.config.js`, `frontend/src/index.css` | Utility-first CSS engine enabling zero-runtime styling, dark/light theme switching (`dark:` variant), fluid mobile typography, and high-contrast accessibility badges for rural visual clarity. |
| **Zustand** | `^4.5.0` | `frontend/src/store/authStore.js`, `frontend/src/store/langStore.js` | Ultra-lightweight, boilerplate-free state management. Used for cross-session JWT authentication persistence and instantaneous 4-language i18n reactive updates without Redux overhead. |
| **React Router DOM** | `^6.22.0` | `frontend/src/App.jsx`, `frontend/src/components/common/Layout.jsx` | Client-side routing engine managing nested route trees, public tool access, authenticated role-based redirects (`ProtectedRoute`), and dynamic route parameters (`/listings/:id`). |
| **Axios** | `^1.6.0` | `frontend/src/api/client.js`, `frontend/src/api/modules.js` | Promise-based HTTP client with request/response interceptors that automatically inject `Bearer` JWT tokens, normalize backend error states, and fail over to local storage cache if offline. |
| **Lucide React** | `^0.344.0` | `frontend/src/components/*`, `frontend/src/pages/*` | Lightweight, scalable vector icon library providing iconography (scales, shields, maps, trucks, checks, alerts) across all 10 modules without heavy SVG asset payloads. |
| **React Hot Toast** | `^2.4.1` | `frontend/src/App.jsx`, `frontend/src/pages/*` | Headless, non-intrusive toast notifications providing immediate tactile feedback for GPS coordinate identification, escrow milestone transitions, and offer submissions. |
| **Leaflet & React-Leaflet** | `^1.9.4` / `^4.2.1` | `frontend/src/components/common/MandiMap.jsx`, `frontend/src/pages/map/MandiMapPage.jsx` | Open-source mobile-friendly interactive mapping library visualizing APMC geographic clusters, reverse-geocoded farm yard coordinates, and inter-mandi haulage transit routes. |
| **Canvas Confetti** | `^1.9.0` | `frontend/src/pages/transactions/TransactionsPage.jsx` | Delight animation triggered upon successful completion of the 7th escrow milestone (T+24h payment disbursement to farmer bank account). |

---

## 3. Backend Microservices & API Architecture

The server tier is architected as an asynchronous, non-blocking RESTful microservices gateway implemented in Python 3.11 with FastAPI.

| Tool / Framework | File Locations / Where Used | Architectural Purpose & Why Used |
| :--- | :--- | :--- |
| **FastAPI** | `backend/app/main.py`, `backend/app/routers/*` | High-performance asynchronous web framework built on Starlette and Pydantic. Leverages Python `async`/`await` for concurrent I/O operations, automatic OpenAPI/Swagger documentation, and sub-10ms response latency. |
| **Uvicorn** | `backend/render.yaml`, `backend/app/main.py` | Lightning-fast ASGI web server implementation for Python, handling concurrent HTTP connections through uvloop and httptools. |
| **SQLAlchemy 2.0 (Async)** | `backend/app/core/database.py`, `backend/app/models/*` | Enterprise Object-Relational Mapper (ORM) utilizing `AsyncSession` and `selectinload` for non-blocking relational queries across user ledgers, lots, transactions, and disputes. |
| **asyncpg** | `backend/app/core/database.py`, `backend/requirements.txt` | High-performance PostgreSQL database client library for Python asyncio, delivering direct binary protocol communication with zero overhead. |
| **Pydantic v2** | `backend/app/schemas/__init__.py` | Data validation and schema enforcement engine utilizing compiled Rust core for sub-millisecond serialization and strict type parsing of listings, bids, and user credentials. |
| **Passlib & bcrypt** | `backend/app/core/security.py`, `backend/app/routers/auth.py` | Cryptographically secure password hashing engine utilizing adaptive Blowfish salt rounds to defend against rainbow table and offline brute-force attacks. |
| **python-jose (JWT)** | `backend/app/core/security.py`, `backend/app/routers/auth.py` | JSON Web Signature (JWS) and Token generator providing stateless, cryptographically signed authentication credentials with defined expiration windows. |
| **Pillow (PIL) & OpenCV** | `backend/app/routers/grading.py`, `backend/app/services/grading_service.py` | Computer vision and digital image processing pipeline analyzing produce harvest photographs for pixel colorimetry, diameter distribution, and surface blemish indexing. |
| **Scikit-learn & NumPy** | `backend/app/services/matching_service.py`, `backend/app/services/sale_window_service.py` | Mathematical and statistical computation engines running weighted multi-objective matching score matrices and biological shelf-life degradation decay algorithms. |
| **httpx** | `backend/app/services/price_service.py`, `backend/app/routers/prices.py` | Next-generation asynchronous HTTP client used to ingest and synchronize live mandi commodity rates from government APMC endpoints. |

---

## 4. Cloud Infrastructure & Distributed Data Architecture

```
  ┌──────────────────────────────────────────────────────────────┐
  │                 Client Tier (Vercel Global CDN)              │
  │     https://mandi-setu-two.vercel.app (React 18 + Vite)     │
  └───────────────────────────────┬──────────────────────────────┘
                                  │ HTTPS / WSS
                                  ▼
  ┌──────────────────────────────────────────────────────────────┐
  │              Application Tier (Render Cloud Container)        │
  │     https://mandisetu-api-rn2n.onrender.com (FastAPI/Python) │
  └───────────────────────────────┬──────────────────────────────┘
                                  │ asyncpg connection pooling
                                  ▼
  ┌──────────────────────────────────────────────────────────────┐
  │         Database Tier (Neon / Supabase Managed Cloud DB)     │
  │            PostgreSQL 16 Multi-AZ Relational Ledger          │
  └──────────────────────────────────────────────────────────────┘
```

1. **Vercel Global Edge Network**: Serves compiled frontend assets with edge-cached stale-while-revalidate policies, guaranteeing sub-second page loads across pan-India cellular networks.
2. **Render Cloud Platform**: Hosts the containerized FastAPI backend with automated continuous deployment (CD) on git push, health checking (`/health`), and dynamic horizontal scaling.
3. **PostgreSQL Relational Ledger**: ACID-compliant persistent database storing user identities, produce lots, bilateral offers, escrow smart contracts, APMC arbitration cases, and administrative audit trails.
4. **OpenStreetMap Nominatim Geocoding**: Reverse geocodes mobile GPS coordinates (latitude/longitude) into human-readable Indian APMC cluster names (e.g., *Sehore, Madhya Pradesh*).

---

## 5. Security & Governance Matrix

1. **Root Authority Supremacy (Admin TanmayA)**:
   - Root account (`tanmayapradhan2322@gmail.com` / `TanmayA`) is permanently anchored at Row #1 in all administrative matrices.
   - Enforces Role-Based Access Control (RBAC) with granular authority delegation (`csv_export`, `decrypt_pii`, `audit_access`, `escrow_override`).
2. **Cryptographic Multi-Signature Escrow Machine**:
   - 7-state transactional lifecycle: `CREATED` → `PAYMENT_PENDING` → `ESCROW_LOCKED` → `DISPATCHED` → `IN_TRANSIT` → `DELIVERED` → `RELEASED`.
   - Buyer funds are quarantined in a neutral settlement vault, eliminating payment default for farmers.
3. **Statutory 24h Grievance Tribunal**:
   - Post-delivery arbitration window allows farmers and buyers to lodge evidence-backed quality claims with automatic escrow hold.

---

## 6. Interactive Kisan Chacha Mascot & Guided Tour System

### 6.1 Cursor-Tracking Game Mascot (`KisanChachaMascot.jsx`)

A high-fidelity animated SVG Indian farmer mascot featuring:

- **2.5D Multi-Axis Parallax Tracking**:
  - Head offset translation $(\cos\theta \cdot 5d, \sin\theta \cdot 3d)$ combined with dynamic head tilt $(\text{clamp}(\frac{\Delta x}{W} \cdot 20, -10^\circ, +10^\circ))$.
  - Internal facial feature parallax $(\cos\theta \cdot 3.5d, \sin\theta \cdot 2d)$ shifting eyes, nose, and mustache inside the head contour for realistic depth.
  - Trigonometric pupil positioning $(\cos\theta \cdot 4.2d, \sin\theta \cdot 4.2d)$ with specular highlights and secondary bounce shine.
- **Organic Blinking Engine**:
  - Automatically triggers every 3.2s – 5.6s with a 140ms closed-lid transition curve, completely eliminating unnatural staring and producing a warm, friendly character expression.
- **Dynamic Eyebrow & Smile Reactivity**:
  - Eyebrows dynamically raise when looking upward and settle warmly when looking forward.
- **Idle Breathing & Fabric Flutter**:
  - Subtle 4.2s sinusoidal torso breathing animation (`chachaBreathing`) and green gamcha towel flutter (`gamchaFlutter`).
- **Traditional Indian Farmer Design**:
  - Saffron Pagri (turban) with turra fan and ruby brooch, chandhan-kumkum tilak, rosy blushing cheeks, proud curled mustache, white kurta with golden buttons, emerald gamcha, and brass-tipped bamboo pointer cane with twinkling golden sparkle star.
- **Responsive Sizing**: 5 size presets (sm: 95×125, md: 140×180, lg: 195×245, xl: 250×320, full: 310×390).

### 6.2 Spotlight Arrow Tour System (`FarmerGuide.jsx`)

An LPULive-inspired interactive walkthrough system:

- **Master Tour Sequence Across Public & Protected Tools**:
  - Seamlessly sequences free public tools (`/` Landing Page → `/prices` Live Prices → `/calculator` Net Realization → `/mandi-map` GIS Network → `/weather` Transit Weather) before transitioning into protected member tools (`/dashboard` → `/listings` → `/transactions` → `/grading` → `/disputes`).
  - Automatically detects unauthenticated users at the transition boundary, guiding them to free registration or sign-in without breaking the walkthrough flow.
- **Bulletproof Viewport Clamping Algorithm**:
  - Calculates available vertical and horizontal space relative to the target element:
    $$\text{top} = \max(76\text{px}, \min(H_{\text{vp}} - H_{\text{card}} - 16\text{px}, Y_{\text{mid}} - 80\text{px}))$$
  - Enforces flexbox column layout with pinned header and pinned action footer (`shrink-0`), guaranteeing that the **Next**, **Previous**, and **Skip** buttons are 100% visible and clickable on every screen size (mobile, tablet, laptop, and ultra-wide).
  - Dynamic directional arrow positioning: Computes `arrowTop` or `arrowLeft` dynamically so the pointer triangle directly aligns with the target element even when the popover is clamped to stay on-screen.
- **Dedicated Homepage Tour (`/`)**:
  - Highlights Language & Dark Mode preferences (`[data-tour="lang-controls"]`), Member Registration & Login (`[data-tour="auth-cta"]`), Live Agmarknet APMC Ticker (`[data-tour="live-ticker"]`), Interactive Profit Calculator (`[data-tour="hero-calculator"]`), and the 12 Architectural Trading Modules (`[data-tour="modules-grid"]`).
- **Multi-Lingual Content**: All tour step titles, descriptions, and mascot speech bubbles support 4 languages (en, hi, mr, or).

### 6.3 Hero Section Integration

The `KisanChachaMascot` is prominently featured in the landing page hero section alongside the Live Take-Home Profit Calculator, with a localized speech bubble directing users to check live mandi prices.

### 6.4 APMC Map Enhancements

- **Hover Preview Cards**: Hovering over mandi markers displays telemetry cards with modal price, arrivals, commodities, and distance.
- **Fullscreen Toggle**: All maps across the project include a Maximize/Minimize button that triggers `map.invalidateSize()` after a 200ms delay for proper Leaflet canvas recalculation.
