# Pindate

Pin your event. Share a link. Your audience adds it in one click.

Built for creators — generate a shareable URL and your audience can instantly add the event to Google Calendar, Apple Calendar, or Outlook.

## What it does

1. Creator fills in event details (title, date, time, duration, timezone, location, online link)
2. App generates a unique shareable URL like `pindate.app/e/abc123`
3. Anyone who opens that link adds the event to their calendar in one click

---

## Running locally

### Prerequisites

- [Node.js](https://nodejs.org) v18 or later
- npm (comes with Node)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/Mindful-Machine/pindate.git
cd pindate

# 2. Install dependencies
npm install

# 3. Add environment variables
cp .env.local.example .env.local
# Fill in your Upstash Redis credentials

# 4. Start the dev server
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
| `http://localhost:3000/api/events/[id]/ical` | GET — .ics file for Apple/Outlook |

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
    ├── store.ts                      # saveEvent / getEvent helpers
    └── redis.ts                      # Upstash Redis client
```

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |

Get them free at [upstash.com](https://upstash.com).

---

## Tech stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Upstash Redis** — persistent event storage
- **Geist** font (Vercel)
- **Nominatim / OpenStreetMap** — free location autocomplete, no API key

---

*By [Mindful Machine](https://github.com/Mindful-Machine)*
