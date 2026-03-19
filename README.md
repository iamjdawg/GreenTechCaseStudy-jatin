# Green-Tech Inventory Assistant

AI-powered inventory tracking for **Bean & Leaf Cafe** — smart natural-language item entry, photo-based classification, expiry tracking, recipe suggestions, usage analytics, and sustainability scoring.

---

**Candidate Name:** Jatin Dangi
**Scenario Chosen:** Green-Tech Inventory Assistant (Bean & Leaf Cafe)
**Estimated Time Spent:** 6 hours
**YouTube Video Link:** https://youtu.be/TYOaMAQB-ao

---

## Features

- **Magic Bar** — Natural language input parsed by AI (or regex fallback)
- **Photo Upload Classification** — Snap a product photo, AI identifies and pre-fills the item form
- **Use It or Lose It Recipes** — AI generates 3 recipes from your expiring items, exportable as PDF
- **Traffic-Light Expiry Cards** — Color-coded inventory cards with countdown timers
- **Waste-O-Meter** — Circular gauge showing waste score with rupee savings
- **Smart Reorder Nudges** — Burn-rate predictions for low stock items
- **One-Click Usage Logging** — Tap to log consumption instantly
- **Sustainability Score** — A-F grade based on waste and expiry management

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- A Google Gemini API key (free tier available at [aistudio.google.com/apikey](https://aistudio.google.com/apikey))

### Run Commands

**Backend:**

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Server starts at http://localhost:8000. API docs at http://localhost:8000/docs.

Create a `backend/.env` file with your API key:

```
OPENAI_API_KEY=your-gemini-api-key-here
```

> Without an API key, the Magic Bar still works via regex fallback. Photo classification and recipe generation require a valid key.

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Opens at http://localhost:5173 (proxies API calls to backend).

The app auto-seeds demo inventory data on first load.

### Test Commands

```bash
cd backend
pytest app/tests/ -v
```

Runs 4 tests covering AI fallback parsing and inventory CRUD operations.

```bash
cd frontend
npm run build
```

Verifies the frontend compiles without errors.

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS + Recharts + jsPDF
- **Backend:** Python FastAPI + SQLAlchemy + SQLite
- **AI:** Google Gemini (via OpenAI-compatible API) with regex-based fallback

---

## AI Disclosure

**AI Assistant Used:** Claude

**How did I verify AI suggestions?**
I reviewed every code suggestion against the existing codebase patterns before accepting — checking import paths, verifying schema field names matched the database models, and testing each endpoint manually via the browser and API docs. For frontend components, I inspected the rendered output in the browser to make sure styling and layout were consistent with the existing UI. I also ran the test suite after each major change to catch regressions early.

**One example of a suggestion I rejected or changed:**
The initial PDF export implementation used `html2canvas` to screenshot the recipe modal and embed it as a full-page image in the PDF. The result was a 4+ MB file spanning 45 pages with blurry, non-selectable text. I rejected that approach and rewrote the export to use jsPDF's native text rendering API instead, which produces clean, paginated, searchable PDFs at a fraction of the file size.

---

## Tradeoffs and Prioritization

**What did I cut to stay within the time limit?**
I skipped writing dedicated unit tests for the two new AI features (photo classification and recipe generation) since they depend on external API calls and would need mocking infrastructure. I also didn't build offline fallback for recipes — unlike the Magic Bar which has a regex fallback, recipe generation genuinely needs an LLM, so a fallback wouldn't add real value. I kept the PDF export simple (text-based) rather than investing time in pixel-perfect styled layouts with custom fonts.

**What would I build next with more time?**

- **Barcode scanning** — Use the device camera to scan barcodes and auto-populate item details from a product database
- **Recipe favorites and history** — Let users save recipes they liked and track which ones they've cooked
- **Multi-user support** — Authentication and role-based access so multiple cafe staff can manage inventory simultaneously
- **Supplier integration** — Connect reorder suggestions to actual supplier catalogs for one-click restocking
- **Mobile-first PWA** — Make the app installable on phones with offline inventory viewing and push notifications for expiry alerts

---

## Known Limitations

- **API key required for AI features** — Photo upload and recipe generation need a valid Gemini API key. Free-tier keys have rate limits, so heavy testing may exhaust the quota temporarily.
- **Corporate network/proxy issues** — SSL inspection on enterprise networks can block API calls. The app includes a workaround (SSL verification bypass) but this is only suitable for development, not production.
- **No persistent recipe storage** — Recipes are generated on-the-fly and not saved to the database. Closing the modal loses them.
- **SQLite for storage** — Works great for a single-user demo but wouldn't scale to a multi-user production deployment without switching to PostgreSQL or similar.
- **Seed data reloads require DB reset** — If you update the CSV seed data, you need to delete `inventory.db` and restart the backend to re-seed.
