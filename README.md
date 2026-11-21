# BlindSpot — Travel Risk & Intelligence SaaS Platform

BlindSpot is a tactical travel intelligence application designed to uncover localized safety blindspots, hidden street friction, transit hazards, emergency medical grids, and diplomatic contingencies before you travel.

---

## 🏛️ Architecture Overview

The system is decoupled into two primary layers: a high-performance React 18 Single Page Application and an Express.js API microservice with strict boundary enforcement.

```
Blind spot/
├── backend/                              # Express.js REST API service
│   ├── src/
│   │   ├── config/                       # Environment configuration & validation
│   │   │   └── env.js                    # Server-side keys (SERPAPI_API_KEY, GEMINI_API_KEY)
│   │   ├── controllers/                  # Route controller logic
│   │   │   ├── aiController.js           # Phase 5 Grounded AI Engine Controller
│   │   │   ├── healthController.js
│   │   │   ├── intelligenceController.js # Phase 3 SerpApi 5-Stream Search Controllers
│   │   │   └── locationController.js     # Phase 4 Google Maps Location Controller
│   │   ├── middleware/                   # Centralized middlewares
│   │   │   ├── errorHandler.js          # Centralized error handler
│   │   │   ├── notFoundHandler.js       # 404 handler
│   │   │   └── validate.js              # express-validator runner
│   │   ├── routes/                       # Route endpoints
│   │   │   ├── index.js
│   │   │   ├── aiRoutes.js               # /api/ai endpoints
│   │   │   ├── healthRoutes.js
│   │   │   ├── intelligenceRoutes.js     # SerpApi Search & News Endpoints
│   │   │   └── locationRoutes.js         # /api/location Endpoints
│   │   ├── services/                     # Business & Intelligence services
│   │   │   ├── aiEngineService.js        # Phase 5 Grounded Deterministic & Gemini Engine
│   │   │   ├── aiSchema.js               # Strict JSON schema & category definitions
│   │   │   ├── aiValidator.js            # Strict anti-hallucination citation validator
│   │   │   ├── awarenessIndexService.js  # Phase 6 Transparent 5-Pillar Coverage Index
│   │   │   ├── healthService.js
│   │   │   ├── locationService.js        # SerpApi Google Maps Places Ingestion
│   │   │   ├── reportPersonalizationService.js # Phase 6 4-Persona 7-Section Dossier
│   │   │   └── serpApiService.js         # SerpApi Engine (Google Search & News)
│   │   ├── utils/                        # Standardized response & custom errors
│   │   │   ├── apiError.js
│   │   │   └── apiResponse.js
│   │   ├── app.js                        # Express app (CORS, Helmet, Morgan, JSON)
│   │   └── server.js                     # HTTP server startup & graceful shutdown
│   ├── test/                             # Automated test suites
│   │   ├── aiEngine.test.js              # Unit tests for hallucination & schema rejection
│   │   ├── aiEndpoints.test.js           # Integration tests for /api/ai endpoints
│   │   └── awarenessIndex.test.js        # Phase 6 Awareness Index & Personalization tests
│   ├── .env                              # Private server environment configuration
│   ├── .env.example
│   └── package.json
│
├── frontend/                             # React 18 + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/                       # Phase 5 AI Engine Components
│   │   │   │   ├── AiBlindSpotAnalysis.jsx     # Grounded findings with citation pills
│   │   │   │   ├── EvidenceExplorerModal.jsx   # Interactive provenance ledger modal
│   │   │   │   └── ForgottenChecklistCard.jsx  # 6-dimension uninvestigated audit
│   │   │   ├── report/                   # Phase 6 Report Components
│   │   │   │   └── ExpandableEvidenceCard.jsx  # Expandable ground-truth evidence cards
│   │   │   ├── common/                   # Reusable atomic UI components
│   │   │   │   ├── Alert.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   └── Spinner.jsx
│   │   │   ├── dashboard/                # Intelligence Dashboard Section Cards
│   │   │   │   ├── AiFindingsCard.jsx
│   │   │   │   ├── AwarenessIndexCard.jsx
│   │   │   │   ├── DestinationOverviewCard.jsx
│   │   │   │   ├── EmergencyFacilitiesCard.jsx
│   │   │   │   ├── LiveSerpApiExplorer.jsx   # Phase 3 Live Ingestion Explorer
│   │   │   │   ├── SourceExplorerCard.jsx
│   │   │   │   └── TravelIntelligenceCard.jsx
│   │   │   ├── emergency/                # Phase 4 Location Intelligence
│   │   │   │   └── EmergencyLocationIntelligence.jsx
│   │   │   ├── map/                      # Tactical Map Canvas & Radar Sweep
│   │   │   │   └── InteractiveMapArea.jsx
│   │   │   └── layout/                   # Global layout
│   │   │       ├── Footer.jsx
│   │   │       └── Navbar.jsx
│   │   ├── context/                      # React State & Persistent Storage
│   │   │   └── InvestigationContext.jsx
│   │   ├── data/                         # Verified Sample Intelligence Catalog
│   │   │   └── sampleDestinations.js
│   │   ├── pages/                        # Primary Application Views
│   │   │   ├── LandingPage.jsx           # Landing & Destination Search
│   │   │   ├── InvestigationPage.jsx     # Investigation Form & Scanner Modal
│   │   │   ├── DashboardPage.jsx         # Intelligence Dashboard
│   │   │   ├── ReportPage.jsx            # Detailed Intelligence Dossier
│   │   │   └── HistoryPage.jsx           # Investigation Archive & History
│   │   ├── services/                     # Client API layer
│   │   │   ├── apiClient.js              # Axios client with interceptors
│   │   │   ├── aiService.js              # Client AI engine service
│   │   │   ├── healthService.js
│   │   │   ├── intelligenceService.js    # Client SerpApi Service Methods
│   │   │   └── locationService.js        # Client Location Service Methods
│   │   ├── utils/
│   │   │   └── cn.js
│   │   ├── App.jsx                       # React Router & App Shell
│   │   ├── index.css                     # Tailwind CSS + Glassmorphic Design System
│   │   └── main.jsx
│   ├── .env                              # Public client environment variables
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.cjs
│   ├── tailwind.config.js
│   └── vite.config.js                    # Vite dev server + /api proxy
│
├── package.json                          # Monorepo task orchestration (concurrently)
└── README.md                             # Comprehensive project documentation
```

---

## 🔍 Phase 3 — SerpApi Integration Details

The backend integrates directly with **SerpApi** to provide 5 distinct live intelligence discovery pipelines.

### Implemented Endpoints

| Endpoint | Method | Pipeline | Engine / Parameters |
| :--- | :--- | :--- | :--- |
| `/api/intelligence/status` | `GET` | Credential Health | Verifies backend key configuration & capabilities |
| `/api/intelligence/search` | `GET` | Destination Search | `engine=google`, `q=${dest} travel safety security` |
| `/api/intelligence/news` | `GET` | Google News | `engine=google_news`, `q=${dest} safety incident OR protest` |
| `/api/intelligence/advisories` | `GET` | Consular Advisories | `engine=google`, `q=${dest} ("travel advisory" OR "warning") site:gov...` |
| `/api/intelligence/transit-disruptions` | `GET` | Transit Disruptions | `engine=google_news`, `q=${dest} (transit strike OR airport delay OR metro...)` |
| `/api/intelligence/scams` | `GET` | Scam & Local Concerns | `engine=google`, `q=${dest} (tourist scam OR pickpocket OR taxi scam...)` |
| `/api/intelligence/live-feed` | `GET` | Multi-Stream Aggregator | Parallel fetch across all 5 streams with cross-stream deduplication |

### Requirements & Data Integrity
1. **Actual SerpApi Parameters**: Uses supported parameters (`engine: 'google' | 'google_news'`, `q`, `api_key`, `hl: 'en'`, `gl: 'us'`, `num`).
2. **Server-Side API Key Isolation**: The API key (`SERPAPI_API_KEY`) resides exclusively in `backend/.env`. It is never bundled or sent to the client.
3. **Response Validation**: Validates HTTP status codes, handles 401/403 (unauthorized/missing key), 429 (rate limits), and 504 (10-second timeout).
4. **Normalized Schema**:
   ```json
   {
     "id": "serp-7f8a9b0c",
     "title": "US Embassy Safety Alert: Transportation Security Guidance",
     "snippet": "Avoid hailing unmarked yellow taxis...",
     "sourceUrl": "https://travel.state.gov/content/travel/...",
     "sourceName": "travel.state.gov",
     "publishedDate": "Nov 14, 2026",
     "retrievedAt": "2026-11-21T07:15:00.000Z",
     "category": "advisory"
   }
   ```
5. **Deduplication Engine**: Cleans tracking parameters (`utm_*`, `fbclid`, hashes) and removes duplicates by clean URL and title similarity.
6. **Zero Fabrication**: When credentials are not configured, the system reports unverified status and never fabricates artificial search results.

---

## 📍 Phase 4 — Emergency & Location Intelligence (Google Maps)

Real-time location intelligence is powered by **SerpApi Google Maps Search** (`engine: 'google_maps'`), retrieving verified physical facilities for any investigated destination.

### Facilities Ingested
1. **Hospitals**: Emergency rooms, tertiary centers, trauma units.
2. **Pharmacies**: 24-hour chemists, bilingual dispensaries.
3. **Police Stations**: Municipal precincts, tourist police outposts, CAI units.

### Location Endpoints

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/location/emergency` | `GET` | Aggregated parallel query for Hospitals, Pharmacies & Police Stations |
| `/api/location/hospitals` | `GET` | Hospitals search for target destination |
| `/api/location/pharmacies` | `GET` | Pharmacies search for target destination |
| `/api/location/police` | `GET` | Police stations search for target destination |

### Interactive Map & Synchronized List Features
- **Dynamic Coordinate Projection**: Derives geographical bounds (`[minLat, maxLat, minLng, maxLng]`) and projects verified GPS coordinates onto an interactive tactical canvas.
- **Clickable Pins**: Distinct category styling (Hospital: Rose, Pharmacy: Emerald, Police: Cyan) with pulsing selection rings.
- **Bidirectional Synchronization**: Clicking a map marker highlights its card and scrolls the synchronized list directly to it; clicking any place card activates and centers the marker on the map.
- **Truth-in-Data Integrity**:
  - Displays names, addresses, phone numbers, ratings, and operating hours **strictly when returned by the provider**.
  - Validates GPS coordinates (`latitude` between -90 and 90, `longitude` between -180 and 180).
  - Explicit disclaimer: *"Retrieved places reflect public Google Maps query results and do not represent every facility in the destination. Never invent emergency contacts."*

---

## 🧠 Phase 5 — BlindSpot AI Engine

The core AI intelligence engine evaluates only validated information retrieved by the application across 6 strict categories. It guarantees factual fidelity using strict schema validation and an anti-hallucination citation ledger.

### 1. Analysis Dimensions
1. **Official Travel Advisories** (`travel_advisories`)
2. **Transport & Transit Disruptions** (`transport_disruptions`)
3. **Weather-Related Concerns** (`weather_concerns`, supported only by meteorological sources)
4. **Local Concerns & Reported Scams** (`local_scams`)
5. **Emergency Facility Availability** (`emergency_facilities`)
6. **Overlooked Cultural & Legal Considerations** (`other_considerations`)

### 2. Anti-Hallucination & Strict Grounding Guarantees
- **Strict Citation Grounding**: Every factual finding must reference at least one verified source ID (e.g. `ev-feed-1`, `ev-loc-3`). Findings with empty source IDs or referencing non-existent IDs are systematically rejected and scrubbed.
- **Provenance Classification**:
  - `confirmed_fact`: Grounded in official diplomatic, municipal, or verified registry evidence.
  - `reported_event`: Grounded in recognized news media outlets.
  - `unverified_claim`: Grounded in unverified web claims; downgraded automatically if not backed by official sources.
- **Date Currency Auditing**: Ingested sources are classified as `Current (<180d)`, `Outdated (>180d)`, or `Undated`. Findings relying on outdated or undated evidence surface explicit UI warning flags.
- **Zero Fabrication**: The engine never invents statistics, crime counts, incidents, locations, contacts, or sources.
- **Insufficient Evidence Protocol**: If evidence is absent or insufficient for a category, an explicit insufficient-evidence message is returned; no assumptions are ever presented as confirmed facts.

### 3. Core AI Endpoints

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `POST /api/ai/analyze` | `POST` | Ingests live telemetry or evidence package; executes grounded synthesis across 6 categories |
| `GET /api/ai/forgotten-checklist` | `GET` | Evaluates intelligence coverage across all 6 categories, auditing blindspots |
| `POST /api/ai/validate-output` | `POST` | Strict schema & anti-hallucination audit endpoint for candidate AI outputs |

### 4. Forgotten Checklist
The **Forgotten Checklist** audits all 6 dimensions and classifies them into:
- 🟢 `Adequately Checked`: Robust verified intelligence ingested.
- 🟡 `Limited Telemetry (Insufficient Evidence)`: Only 1 reference found; requires secondary cross-referencing.
- 🔴 `Critical BlindSpot (Uninvestigated)`: Zero verified telemetry found for this category; prompts targeted discovery prior to departure.

### 5. Evidence Explorer
An interactive provenance ledger allowing users to inspect the exact ground truth behind every AI finding:
- Full quoted snippets and titles
- Source provenance classification (Official, Media, Unverified)
- Date currency audit status (<180 days, >180 days, undated)
- Direct link to the verified source URL
- Click-to-cite reference generator

### 6. Automated Anti-Hallucination Test Suite
Automated tests verify that hallucinated claims, missing sources, invalid categories, and malformed schemas are rejected:

```bash
# Run unit & anti-hallucination tests:
npm --prefix backend test

# Run HTTP endpoint integration tests:
node backend/test/aiEndpoints.test.js
```

---

## 📊 Phase 6 — Awareness Index & Personalised Intelligence Report

The **BlindSpot Awareness Index** measures **investigation coverage**, not the objective safety of a destination. It uses a transparent, mathematically reproducible scoring formula to evaluate the breadth, depth, freshness, and verification of ingested intelligence.

### 1. Transparent Scoring Methodology (100 Points Total)

$$\text{Awareness Index} = C + D + F + V + M$$

| Pillar | Maximum Points | Measurement Criteria |
| :--- | :--- | :--- |
| **Category Coverage ($C$)** | 25 Pts | Number of core analysis categories with $\ge 1$ verified record (4.16 pts/category) |
| **Evidence Depth ($D$)** | 25 Pts | Volume of verified sources scaled against a 15+ record benchmark |
| **Source Freshness ($F$)** | 20 Pts | Weighted currency ratio: Current (<180d) = 1.0, Undated = 0.6, Outdated (>180d) = 0.2 |
| **Verification Quality ($V$)** | 15 Pts | Official registry presence (8 pts) + News media (4 pts) + Low community rumor ratio (3 pts) |
| **Information Completeness ($M$)** | 15 Pts | Critical deductions: Missing emergency grid (-5), Missing consular advisory (-5), Missing transit (-3) |

#### Investigation Coverage Tiers (Strict Non-Safety Principle)
- 🟢 **85 – 100**: `Comprehensive Investigation Coverage` (Grade A: Minimal unknown blindspots)
- 🔵 **70 – 84**: `Substantial Investigation Coverage` (Grade B: Core pillars verified; minor gaps)
- 🟡 **50 – 69**: `Partial / Moderate Investigation Coverage` (Grade C: Significant blindspots remain)
- 🔴 **0 – 49**: `Critical Telemetry BlindSpot` (Grade D/F: Sparse or uninvestigated destination telemetry)

> **Core Principle:** Never label a destination safe or unsafe based on this score. A dangerous destination with extensive documentation will receive a HIGH awareness score because its risks are known; a tranquil destination with zero ingested records will receive a LOW score because it represents an uninvestigated blindspot.

### 2. Personalised Report Priorities across 4 Personas

The intelligence report dynamically re-weights findings, identifies persona-specific blindspots, and personalizes next checks:

1. **Solo Travellers**: Street vigilance, unauthorized transit hails, scam and spiked drink prevention, 24-hour CAI/police post proximity, and daily check-in cadences.
2. **Families with Children**: Pediatric emergency triage coverage, 24/7 pharmacies, safe quiet district zoning, stroller & public transit accessibility.
3. **Couples & Partners**: Safe evening dining and nightlife corridors, authorized taxi dispatch, property theft mitigation in crowded tourist plazas.
4. **Business Travellers**: Airport express route disruptions, transit strike alerts, corporate hotel security, Wi-Fi cyber security in coworking hubs, consular trade desks.

### 3. The 7 Canonical Report Sections
1. **Destination Overview**: Travel window, active traveller persona, and Awareness Index coverage quotient with non-safety disclaimer.
2. **Important Findings**: Personalised priority highlights matching the traveller persona, claim type badges, confidence score, mitigations, and citation pills.
3. **Potential Blindspots**: Explicit breakdown of uninvestigated areas, outdated telemetry, and areas where absence of evidence must not be mistaken for safety.
4. **Emergency Facilities**: Google Maps verified hospitals, 24h pharmacies, and police stations with addresses, phone numbers, ratings, and operating hours.
5. **Evidence and Source Links**: Expandable evidence cards with quoted snippets, publication dates, source classification, and direct links to original verified URLs.
6. **Missing Information**: Explicit audit of uninvestigated categories, unverified categories, and information completeness score.
7. **Recommended Next Checks**: Concrete, tailored discovery tasks customized for the active persona before departure.

### 4. Print-Friendly Export
A high-resolution print stylesheet (`@media print`) enables clean PDF exports or physical printing with page break hygiene, crisp contrast, and automatic hiding of interactive controls.

---

## 🛡️ Phase 7 — Quality Assurance & Production Deployment

### 1. Comprehensive QA Verification Across 12 Dimensions

The application has undergone complete automated and manual end-to-end verification across 12 critical QA dimensions:

| Dimension | Verification Scope | Status | Result |
| :--- | :--- | :---: | :--- |
| **1. Destination Input Validation** | Validated min length (2), max length (120), empty inputs, and whitespace | Passed | Returns `422 Unprocessable Entity` with clean error messages |
| **2. Travel Date Validation** | Guards against inverted ranges (`end < start`), past dates, and NaN durations | Passed | Safe duration computation with fallback and UI warning alerts |
| **3. Missing API Keys** | Ingestion endpoints when keys are absent | Passed | Degrades gracefully; reports status as `configured: false`; zero crashes |
| **4. SerpApi Errors & Rate Limits** | Simulates 401 (invalid key), 429 (rate limits), and 504 (10s timeouts) | Passed | Error mapper returns structured `ApiResponse` with recovery options |
| **5. Empty Search Results** | Queries returning zero organic or news results | Passed | Ingestion resilience returns empty catalog and marks Forgotten Checklist |
| **6. Malformed API Responses** | Non-JSON, non-object, and missing field provider payloads | Passed | Safe parsing handles corrupt payloads without crashing the process |
| **7. AI Hallucination Attempts** | Findings attempting to omit source citations | Passed | Strictly intercepted and scrubbed by `AiValidator` |
| **8. Unsupported Source References** | Findings citing non-existent or fabricated source IDs | Passed | Intercepted; finding rejected and added to `rejectedFindings` ledger |
| **9. Map Coordinate Validation** | GPS coordinates outside `[-90, 90]` or `[-180, 180]` or non-numeric | Passed | Sanitized to `null`; map displays fallback overlay with retry option |
| **10. Mobile & Desktop Layouts** | Responsive viewport scaling from mobile (375px) to desktop (1440px) | Passed | Flex wrapping, collapsible sidebar, horizontal scroll tables |
| **11. Button & Navigation Integrity** | All routes (`/`, `/investigate`, `/dashboard`, `/report`, `/history`) | Passed | Clean React Router navigation, active states, working export/print |
| **12. Duplicate Request Prevention** | In-flight request deduplication wrapper in `apiClient.js` | Passed | Rapid duplicate `GET` calls share in-flight promises |

### 2. Automated Test Commands

```bash
# Run backend unit tests (AI Engine & Awareness Index):
npm --prefix backend test

# Run endpoint integration test suite:
node backend/test/aiEndpoints.test.js

# Run comprehensive 12-dimension QA test suite:
npm --prefix backend run test:qa
```

---

## 🚀 Production Deployment & Demo Guide

### Deployment Options

#### Option A: Unified Container (Docker)
Builds the optimized frontend Vite SPA and serves both API and UI from a single Node 20 container:

```bash
# 1. Build and run with Docker Compose:
docker-compose up --build -d

# Access the application at http://localhost:5000
```

#### Option B: Local Production Run
```bash
# 1. Install all dependencies:
npm run install:all

# 2. Build the optimized frontend bundle:
npm run build

# 3. Start the production backend server:
npm start

# Access the application at http://localhost:5000
```

#### Option C: Decoupled Cloud Deployment (Vercel + Render / Railway)
- **Frontend (Vercel / Netlify)**:
  - Root directory: `frontend/`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment variable: `VITE_API_BASE_URL=https://your-backend.onrender.com/api`
- **Backend (Render / Railway / Fly.io)**:
  - Root directory: `backend/`
  - Start command: `node src/server.js`
  - Environment variables: `SERPAPI_API_KEY`, `GEMINI_API_KEY`, `CLIENT_URL`

---

## 🎬 Working End-to-End Demo Walkthrough

1. **Step 1: Exploration & Landing (`/`)**:
   - Visit `http://localhost:5173` (or `http://localhost:5000` in production).
   - Review live backend health and SerpApi status indicators in the Navbar.
   - Enter a destination in the tactical search bar (e.g., "Bogotá, Colombia") or click one of the verified preset cards.
2. **Step 2: Investigation Configuration (`/investigate`)**:
   - Customize travel window dates and traveller persona (Solo Traveller, Family with Kids, Couple, Business Executive).
   - Click **"Launch Multi-Stream Investigation"** to trigger automated telemetry scanner.
3. **Step 3: Tactical Intelligence Dashboard (`/dashboard`)**:
   - Inspect the **BlindSpot Awareness Index** (100-point 5-pillar coverage score). Click **"Scoring Formula"** to verify calculation transparency.
   - Review **AI BlindSpot Discoveries** with zero-hallucination badges and clickable citation pills.
   - Inspect the **Forgotten Checklist** to evaluate uninvestigated dimensions.
   - Interact with the **Emergency Location Intelligence** map with verified Google Maps hospital, pharmacy, and police markers.
4. **Step 4: Evidence Explorer**:
   - Click **"Evidence Explorer"** or any source pill (`ev-feed-1`, `ev-loc-2`) to inspect quoted text, source types, date currency (<180d), and original source URLs.
5. **Step 5: Detailed Dossier Report (`/report`)**:
   - View the complete 7-section intelligence report personalized for your traveller profile.
   - Use the **Persona Switcher** to toggle between Solo, Family, Couple, and Business profiles to see priorities dynamically adjust.
   - Expand evidence cards to view full ground-truth snippets and copy academic citations.
   - Click **"Print / Save as PDF"** to produce a clean, print-optimized document.

---

## ⚖️ Truth-in-Data & Limitations Disclosure

- **Live Integrations Verified**: Real SerpApi Google Search and Google Maps Search are fully verified using the configured backend API key (`SERPAPI_API_KEY`).
- **AI Engine Grounding**: When `GEMINI_API_KEY` is present, the engine queries `gemini-2.0-flash` with strict JSON containment prompts. When absent, it falls back to the deterministic grounded engine that adheres to the identical anti-hallucination validation schema.
- **No Synthetic Place Contacts**: Emergency facilities reflect actual Google Maps query results; missing phone numbers, addresses, or hours are never fabricated.
- **Coverage vs Safety**: The Awareness Index explicitly measures investigation thoroughness and evidence volume; it never labels a destination safe or unsafe.

---

## 🔒 Configuration & Credential Setup

To enable live SerpApi searches and Gemini AI Engine:

1. Obtain a SerpApi key from [https://serpapi.com](https://serpapi.com).
2. Obtain a Gemini API key from [https://aistudio.google.com](https://aistudio.google.com) (optional; the grounded engine operates deterministically when omitted).
3. Add your keys to `backend/.env`:
   ```env
   SERPAPI_API_KEY=your_actual_serpapi_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Restart the backend service (`npm run dev:backend`).
5. The Navbar indicator will switch from `SerpApi: Pending` to `SerpApi: Live`.

---

## 🚀 How to Run

```bash
# 1. Install all dependencies:
npm run install:all

# 2. Run both Backend and Frontend concurrently:
npm run dev

# Or run services independently:
cd backend && npm run dev     # Backend API on http://localhost:5000
cd frontend && npm run dev    # Frontend UI on http://localhost:5173
```
