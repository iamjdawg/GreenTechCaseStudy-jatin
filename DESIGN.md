# Design Documentation

## 1. Architecture Overview

The application follows a **client-server architecture** with a clear separation between frontend and backend, communicating over a RESTful API.

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────┐  │
│  │ Dashboard │  │ Inventory │  │    Analytics      │  │
│  │  - Stats  │  │ - MagicBar│  │  - WasteChart    │  │
│  │  - Expiry │  │ - PhotoUp │  │  - Sustainability│  │
│  │  - Waste  │  │ - Grid    │  │  - Reorder       │  │
│  │  - Recipe │  │ - Filters │  │                  │  │
│  └──────────┘  └───────────┘  └──────────────────┘  │
│           │           │              │               │
│           └───────────┼──────────────┘               │
│                       ▼                              │
│              ┌─────────────────┐                     │
│              │   API Client    │ (Axios, /api proxy) │
│              └────────┬────────┘                     │
└───────────────────────┼──────────────────────────────┘
                        │ HTTP (JSON + Multipart)
┌───────────────────────┼──────────────────────────────┐
│                       ▼           Backend (FastAPI)   │
│              ┌─────────────────┐                      │
│              │     Routers     │                      │
│              │ /inventory      │                      │
│              │ /usage          │                      │
│              │ /analytics      │                      │
│              │ /ai             │                      │
│              └────────┬────────┘                      │
│                       ▼                               │
│    ┌──────────────────┼──────────────────┐            │
│    ▼                  ▼                  ▼            │
│ ┌──────┐      ┌─────────────┐    ┌───────────┐       │
│ │ CRUD │      │ AI Service  │    │ Analytics │       │
│ │      │      │ - Parse     │    │ Service   │       │
│ │      │      │ - Vision    │    │           │       │
│ │      │      │ - Recipes   │    │           │       │
│ └──┬───┘      └──────┬──────┘    └─────┬─────┘       │
│    │                 │                 │              │
│    ▼                 ▼                 │              │
│ ┌──────┐      ┌───────────┐           │              │
│ │SQLite│◄─────│  Models   │◄──────────┘              │
│ └──────┘      └───────────┘                          │
│                                                      │
│               ┌───────────┐                          │
│               │  Gemini   │ (External API)           │
│               │  API      │                          │
│               └───────────┘                          │
└──────────────────────────────────────────────────────┘
```

## 2. Tech Stack

| Layer     | Technology                | Purpose                          |
|-----------|---------------------------|----------------------------------|
| Frontend  | React 18                  | UI components and state          |
| Bundler   | Vite 5                    | Dev server with HMR, build tool  |
| Styling   | Tailwind CSS 3            | Utility-first CSS                |
| Charts    | Recharts                  | Analytics visualizations         |
| PDF       | jsPDF                     | Recipe PDF export                |
| HTTP      | Axios                     | API client with interceptors     |
| Backend   | FastAPI                   | Async Python REST API            |
| ORM       | SQLAlchemy 2              | Database models and queries      |
| Database  | SQLite                    | File-based relational storage    |
| Validation| Pydantic 2                | Schema validation and serialization |
| AI        | Google Gemini (OpenAI SDK)| Vision, text parsing, recipes    |

## 3. Database Schema

```
┌──────────────────┐       ┌──────────────────────────────┐
│    categories     │       │      inventory_items          │
├──────────────────┤       ├──────────────────────────────┤
│ id       INTEGER │◄──┐   │ id             INTEGER (PK)  │
│ name     VARCHAR │   │   │ name           VARCHAR       │
│ icon     VARCHAR │   └───│ category_id    INTEGER (FK)  │
└──────────────────┘       │ quantity       FLOAT         │
                           │ unit           VARCHAR       │
                           │ cost_per_unit  FLOAT         │
                           │ expiry_date    DATE          │
                           │ status         VARCHAR       │
                           │ added_date     DATETIME      │
                           │ updated_at     DATETIME      │
                           │ notes          VARCHAR       │
                           └──────────┬───────────────────┘
                                      │
                                      │ 1:N
                                      ▼
                           ┌──────────────────────────────┐
                           │        usage_logs             │
                           ├──────────────────────────────┤
                           │ id             INTEGER (PK)  │
                           │ item_id        INTEGER (FK)  │
                           │ quantity_used  FLOAT         │
                           │ used_date      DATETIME      │
                           │ reason         VARCHAR       │
                           │ notes          VARCHAR       │
                           └──────────────────────────────┘
```

**Item Status Lifecycle:**

```
                    ┌───────────┐
     New item ──►   │  active   │
                    └─────┬─────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
        ┌─────────┐ ┌─────────┐ ┌──────────┐
        │   low   │ │ expired │ │ finished │
        │ qty < 2 │ │ past    │ │  qty = 0 │
        └─────────┘ │ expiry  │ └──────────┘
                    └─────────┘
```

**Default Categories (seeded on startup):**

| Category   | Icon | Examples                        |
|------------|------|---------------------------------|
| Dairy      | 🥛   | Milk, cheese, cream, butter     |
| Produce    | 🥬   | Lettuce, tomatoes, basil, lemons|
| Meat       | 🥩   | Chicken, salmon, bacon          |
| Bakery     | 🥐   | Bread, croissants, muffins      |
| Beverages  | 🥤   | Juice, kombucha, oat milk       |
| Coffee     | ☕   | Arabica beans, espresso, matcha |
| Condiments | 🫙   | Ketchup, honey, olive oil       |
| Dry Goods  | 🌾   | Flour, sugar, oats, chocolate   |
| Frozen     | 🧊   | Frozen berries, ice cream       |
| Other      | 📦   | Uncategorized items             |

## 4. API Design

### Endpoint Map

```
/api
├── /health                GET     Health check
├── /categories            GET     List all categories
├── /seed                  POST    Seed demo data
│
├── /inventory
│   ├── /                  GET     List items (search, filter, sort)
│   ├── /                  POST    Create item
│   ├── /expiring          GET     Items expiring within N days
│   ├── /{id}              GET     Get single item
│   ├── /{id}              PUT     Update item
│   └── /{id}              DELETE  Delete item
│
├── /usage
│   ├── /                  POST    Log usage event
│   └── /{item_id}         GET     Usage history for item
│
├── /analytics
│   ├── /dashboard         GET     Stats overview
│   ├── /waste             GET     Waste metrics (configurable period)
│   ├── /reorder           GET     Reorder suggestions
│   └── /sustainability    GET     Sustainability score + tips
│
└── /ai
    ├── /parse             POST    Natural language → structured item
    ├── /classify-image    POST    Product photo → item classification
    └── /recipes           POST    Expiring items → 3 recipes
```

### Key Request/Response Examples

**Magic Bar Parse:**
```
POST /api/ai/parse
Body: { "text": "5 bags of arabica coffee expires June 20" }
Response: { "name": "Arabica Coffee", "quantity": 5, "unit": "bags",
            "category": "Coffee", "expiry_date": "2026-06-20", "method": "ai" }
```

**Image Classification:**
```
POST /api/ai/classify-image
Body: multipart/form-data with "file" field (JPEG/PNG/GIF/WebP, <10MB)
Response: { "name": "Coca-Cola Can", "category": "Beverages",
            "unit": "cans", "description": "330ml carbonated soft drink", "method": "vision" }
```

**Recipe Generation:**
```
POST /api/ai/recipes
Body: { "items": [{"name": "Chicken Breast", "quantity": 8, "unit": "kg", "expiry_date": "2026-03-22"}] }
Response: { "recipes": [{ "title": "...", "description": "...",
            "ingredients": [{"name": "...", "quantity": "...", "is_expiring": true}],
            "instructions": ["Step 1...", "Step 2..."],
            "prep_time": "25 mins", "servings": "4" }], "method": "ai" }
```

## 5. Frontend Architecture

### Component Tree

```
App
├── AppShell
│   ├── Header (branding, date/time)
│   └── Sidebar (navigation: Dashboard, Inventory, Analytics)
│
├── [Page: Dashboard]
│   ├── StatsCards (5 metric cards)
│   ├── WasteOMeter (SVG circular gauge)
│   ├── ExpiryAlerts (expiring items + "Use It or Lose It" button)
│   ├── ReorderNudges (burn-rate predictions)
│   └── RecipeModal (3 tabbed recipes, PDF export)
│
├── [Page: Inventory]
│   ├── MagicBar (NLP text input)
│   ├── PhotoUploadButton (camera icon, image classification)
│   ├── FilterBar (search, category, status, sort)
│   └── InventoryGrid
│       └── InventoryCard[] (item details, actions)
│
├── [Page: Analytics]
│   ├── SustainScore (A-F grade with tips)
│   ├── WasteChart (bar chart by category)
│   └── ReorderNudges
│
├── ItemFormModal (add/edit item form)
├── UseItemModal (log consumption/waste)
├── ConfirmDialog (delete confirmation)
└── Toast (notification system)
```

### State Management

The app uses **React hooks** for state — no external state library. Two custom hooks encapsulate data fetching:

| Hook           | Manages                                           |
|----------------|---------------------------------------------------|
| `useInventory` | Items, categories, filters, CRUD operations       |
| `useAnalytics` | Dashboard stats, waste data, reorder, sustainability |

**Data flow pattern:**
```
User Action → Component Handler → API Client → Backend
                                                  │
Backend Response ← API Client ← State Update ← ──┘
                                    │
                              Component Re-render
```

Page-level state (modals, editing item, confirmations) lives in `App.jsx` and is passed down as props. There is no prop drilling beyond 2 levels.

### Routing

The app uses a simple **state-based page switcher** in `App.jsx` rather than React Router for page transitions. The `page` state variable (`'dashboard' | 'inventory' | 'analytics'`) controls which page component renders. Navigation is handled by the Sidebar through an `onNavigate` callback.

### Styling System

- **Tailwind CSS** with a custom `leaf` color palette (green theme)
- Responsive grid: 1 column (mobile) → 2 (sm) → 3 (lg) → 4 (xl)
- Consistent component patterns: `bg-white rounded-xl border border-gray-200 p-6`
- Status colors defined in `constants.js` for reuse across components

## 6. AI Integration Design

### Graceful Degradation Strategy

```
┌──────────────────────────────────────────────────────────┐
│                    AI Feature Matrix                      │
├──────────────┬───────────────┬───────────────────────────┤
│ Feature      │ With API Key  │ Without API Key            │
├──────────────┼───────────────┼───────────────────────────┤
│ Magic Bar    │ Gemini parse  │ Regex/keyword fallback    │
│ Photo Upload │ Gemini vision │ 503 error (no fallback)   │
│ Recipes      │ Gemini gen    │ 503 error (no fallback)   │
└──────────────┴───────────────┴───────────────────────────┘
```

The Magic Bar is the only feature with a true offline fallback. Photo classification and recipe generation inherently require an LLM — there's no meaningful rule-based alternative.

### Fallback Parser Design

The regex-based fallback parser operates in three extraction passes:

```
Input: "5 bags of arabica coffee expires June 15"
                │
                ▼
┌─────────────────────────────┐
│ 1. UNIT_PATTERN regex       │──► quantity=5, unit="bags"
│    (\d+)\s*(kg|bags|...)    │
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 2. DATE_PATTERN regex       │──► expiry_date="2026-06-15"
│    (expires?|exp|...)\s*    │
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 3. CATEGORY_KEYWORDS match  │──► category="Coffee"
│    {"Coffee": ["coffee",    │
│     "espresso", "arabica"]} │
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 4. Name = remainder text    │──► name="Arabica Coffee"
│    (cleaned, title-cased)   │
└─────────────────────────────┘
```

### API Provider Abstraction

The AI service uses the **OpenAI Python SDK** pointed at Google's OpenAI-compatible endpoint. This means switching providers requires only config changes:

```python
# config.py — swap provider by changing these values
openai_api_key: str = ""                          # API key for any provider
openai_base_url: str = "https://generativelanguage.googleapis.com/v1beta/openai/"
openai_chat_model: str = "gemini-3-flash-preview"  # or "gpt-4o-mini", etc.
openai_vision_model: str = "gemini-3-flash-preview" # or "gpt-4o", etc.
```

All three AI functions (`ai_parse`, `ai_classify_image`, `ai_generate_recipes`) use a shared `_get_openai_client()` factory that handles SSL bypass for corporate networks and applies the configured base URL.

### Vision Classification Flow

```
User selects photo
       │
       ▼
Frontend: FormData with file ──► POST /api/ai/classify-image
                                        │
                                        ▼
                                 Validate type + size
                                        │
                                        ▼
                                 Base64 encode image
                                        │
                                        ▼
                                 Gemini Vision API call
                                 (system prompt: "classify
                                  for cafe inventory")
                                        │
                                        ▼
                                 Parse JSON response
                                        │
                                        ▼
                                 Return: {name, category,
                                   unit, description}
                                        │
                                        ▼
Frontend: Map category → category_id, open ItemFormModal pre-filled
          (quantity=1, expiry=blank, description→notes)
```

### Recipe Generation Flow

```
Dashboard: ExpiryAlerts shows items expiring in 7 days
       │
       ▼
User clicks "Use It or Lose It"
       │
       ▼
Frontend: Map items to {name, quantity, unit, expiry_date}
          POST /api/ai/recipes
       │
       ▼
Backend: Build prompt with ingredient list
         Gemini API (temperature=0.7, max_tokens=4096)
         System: "Generate 3 recipes, mark is_expiring"
       │
       ▼
Parse JSON → Validate against Pydantic schemas
       │
       ▼
Frontend: RecipeModal with 3 tabs
          - Ingredients (expiring ones highlighted amber)
          - Numbered instructions
          - Prep time + servings
          - "Save as PDF" (jsPDF native text rendering)
```

## 7. Analytics Engine

### Waste Score Calculation

```
waste_score = (wasted_units / total_consumed_units) * 100

where:
  wasted = usage logs with reason in ("expired", "damaged")
  consumed = usage logs with reason = "consumed"
  period = configurable (default 30 days)
```

### Reorder Suggestion Algorithm

```
For each active item with usage history:
  1. Fetch usage logs from last 30 days
  2. daily_burn_rate = total_quantity_used / days_in_period
  3. days_until_empty = current_quantity / daily_burn_rate
  4. urgency = "critical" if ≤1 day, "warning" if ≤3 days, else "ok"

Sort by days_until_empty ascending (most urgent first)
```

### Sustainability Score

```
score = waste_component (50 pts) + expiry_component (50 pts)

waste_component = 50 * (1 - waste_ratio)
  where waste_ratio = wasted_units / total_used_units

expiry_component = 50 * (1 - expired_ratio)
  where expired_ratio = expired_items / total_items

grade = A (≥80) | B (≥60) | C (≥40) | D (≥20) | F (<20)
```

## 8. Project Structure

```
green-tech-inventory/
├── .gitignore
├── README.md
├── DESIGN.md                          ← This file
│
├── backend/
│   ├── .env.example                   # API key template
│   ├── requirements.txt               # Python dependencies
│   ├── data/
│   │   └── sample_inventory.csv       # 40 seed items with INR prices
│   └── app/
│       ├── main.py                    # FastAPI app, lifespan, CORS
│       ├── config.py                  # Pydantic settings (.env loader)
│       ├── database.py                # SQLAlchemy engine + session
│       ├── models.py                  # ORM models (Category, Item, UsageLog)
│       ├── schemas.py                 # Pydantic request/response schemas
│       ├── crud.py                    # Database operations
│       ├── routers/
│       │   ├── inventory.py           # CRUD endpoints
│       │   ├── usage.py               # Usage logging endpoints
│       │   ├── analytics.py           # Dashboard/waste/reorder/sustainability
│       │   └── ai.py                  # Parse, classify-image, recipes
│       ├── services/
│       │   ├── ai_service.py          # Gemini integration + fallback parser
│       │   ├── analytics_service.py   # Waste, reorder, sustainability calcs
│       │   └── seed_service.py        # CSV loader + usage log generator
│       └── tests/
│           ├── conftest.py            # Test fixtures (in-memory DB)
│           ├── test_ai_fallback.py    # Fallback parser tests
│           └── test_inventory.py      # CRUD endpoint tests
│
└── frontend/
    ├── package.json
    ├── vite.config.js                 # Dev proxy to backend
    ├── tailwind.config.js             # Custom "leaf" color theme
    ├── index.html
    └── src/
        ├── main.jsx                   # React entry point
        ├── App.jsx                    # Root component, page routing, state
        ├── index.css                  # Tailwind imports + custom scrollbar
        ├── api/
        │   └── client.js             # Axios instance + all API functions
        ├── hooks/
        │   ├── useInventory.js        # Items, categories, filters, CRUD
        │   └── useAnalytics.js        # Dashboard, waste, reorder, sustain
        ├── utils/
        │   ├── constants.js           # Icons, status colors, urgency colors
        │   └── dateHelpers.js         # Date formatting, expiry labels
        └── components/
            ├── layout/
            │   ├── AppShell.jsx       # Main layout wrapper
            │   ├── Header.jsx         # Top bar with branding
            │   └── Sidebar.jsx        # Navigation sidebar
            ├── common/
            │   ├── LoadingSpinner.jsx
            │   ├── Toast.jsx          # Notification system
            │   ├── ConfirmDialog.jsx
            │   └── ErrorAlert.jsx
            ├── dashboard/
            │   ├── Dashboard.jsx      # Dashboard page
            │   ├── StatsCards.jsx     # 5 metric cards
            │   ├── WasteOMeter.jsx    # SVG circular gauge
            │   ├── ExpiryAlerts.jsx   # Expiring items + recipe button
            │   ├── ReorderNudges.jsx  # Burn-rate predictions
            │   └── RecipeModal.jsx    # AI recipes + PDF export
            ├── inventory/
            │   ├── MagicBar.jsx       # NLP text input
            │   ├── PhotoUploadButton.jsx # Camera + AI classification
            │   ├── FilterBar.jsx      # Search, filter, sort controls
            │   ├── InventoryGrid.jsx  # Responsive card grid
            │   ├── InventoryCard.jsx  # Individual item card
            │   ├── ItemFormModal.jsx  # Add/edit item form
            │   └── UseItemModal.jsx   # Log usage form
            └── analytics/
                ├── Analytics.jsx      # Analytics page
                ├── WasteChart.jsx     # Bar chart by category
                └── SustainScore.jsx   # Grade + tips
```

## 9. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **SQLite over PostgreSQL** | Zero-config, file-based — ideal for a demo/single-user app. No Docker or DB server needed to get started. |
| **OpenAI SDK with Gemini** | Google's OpenAI-compatible endpoint lets us swap providers via config. If Gemini goes down, switching to OpenAI is a `.env` change. |
| **Regex fallback for parsing** | The Magic Bar works without any API key. Users on free tiers or without internet still get functional parsing. |
| **jsPDF text API over html2canvas** | Canvas screenshots produced 4MB+ bloated PDFs. Native text rendering gives clean, paginated, searchable PDFs at ~50KB. |
| **State-based routing over React Router** | Three pages, no deep linking needed. A simple `page` state variable avoids an extra dependency. |
| **Custom hooks over Redux/Zustand** | Two hooks (`useInventory`, `useAnalytics`) cover all data needs. No global state complexity for a single-page app. |
| **Tailwind over CSS modules** | Rapid prototyping with consistent design tokens. The custom `leaf` color palette keeps the green-tech branding. |
| **SSL bypass in AI client** | Corporate proxies intercept HTTPS. `verify=False` on the httpx client is a dev-only workaround — not for production. |
| **INR currency** | Prices reflect realistic Indian market rates for cafe ingredients rather than placeholder USD values. |