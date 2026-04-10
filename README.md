# Datote

Turn a link into a calendar event. Built for creators — share a link, your audience clicks once and the event lands in their calendar.

## What it does

1. Creator fills in event details (title, date, time, duration, timezone, location, online link)
2. App generates a unique shareable URL like `datote.app/e/abc123`
3. Anyone who opens that link can add the event to **Google Calendar**, **Apple Calendar**, or **Outlook** in one click

---

## Running locally

### Prerequisites

- [Node.js](https://nodejs.org) v18 or later
- npm (comes with Node)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/Mindful-Machine/datote.git
cd datote

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open **http://localhost:3000** in your browser.

### Key URLs

| URL | What it is |
|-----|------------|
| `http://localhost:3000/` | Landing page |
| `http://localhost:3000/new` | Create a new event |
| `http://localhost:3000/e/[id]` | Shareable event page |
| `http://localhost:3000/api/events` | POST — create event (JSON) |
| `http://localhost:3000/api/events/[id]/ical` | GET — download .ics file |

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                      # Landing page
│   ├── new/page.tsx                  # Event creation form
│   ├── e/[id]/
│   │   ├── page.tsx                  # Shareable event page
│   │   └── CalendarButtons.tsx       # Client component (browser detection)
│   └── api/events/
│       ├── route.ts                  # POST /api/events
│       └── [id]/ical/route.ts        # GET /api/events/[id]/ical (.ics)
└── lib/
    └── store.ts                      # In-memory store (⚠️ replace with Redis before deploy)
```

---

## Deploying to Vercel

> ⚠️ **Before deploying:** the current store is in-memory and resets on every server restart. Replace it with Upstash Redis first (see below).

### 1. Add a database (Upstash Redis — free)

1. Create a free account at [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

### 2. Deploy

```bash
# Push latest code to GitHub
git push

# Then go to vercel.com → New Project → import Mindful-Machine/datote
# Add the two Upstash env vars in the Vercel dashboard
```

---

## Tech stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Geist** font (Vercel)
- **Nominatim / OpenStreetMap** — free location autocomplete, no API key

---

*By [Mindful Machine](https://github.com/Mindful-Machine)*
