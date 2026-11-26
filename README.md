# AI-Assisted E-learning Platform

An e-learning platform where instructors author courses and students learn from them, with an AI assistant built into both sides: it helps authors write lessons and helps students understand them.

Built as an engineering graduation project (*praca inżynierska*).

**Stack:** Next.js 15 (App Router) · TypeScript 5 (strict) · Supabase (PostgreSQL, Auth, Storage, Row Level Security) · Tailwind CSS · shadcn/ui · Tiptap · Vitest

---

## Features

### For instructors
- **Course authoring:** drafts, a curriculum builder with ordered lessons, a rich-text lesson editor (Tiptap), and a publish flow
- **Course settings:** category, level, description, and **private courses** protected by a password
- **Lesson attachments** stored in a private Storage bucket, downloaded through signed URLs
- **Student roster** with per-student progress
- **AI author assist** in the lesson editor; the author can insert generated answers straight into the lesson

### For students
- **Explore catalogue** with search and category, level and rating filters
- **Enrolling in and leaving** courses (private courses need the password)
- **Lesson reader** with progress tracking
- **Course Q&A:** ask the instructor questions, with unread-answer badges
- **Ratings** for completed courses
- **AI lesson assist:** ask about the current lesson or a selected passage
- **Lesson recap:** an AI summary and review questions

### Shared
- Email and password auth with Supabase SSR (cookie sessions)
- Profile with avatar upload
- Light and dark themes

---

## AI integration

> **Current state:** the AI features run on a **local LLM through [Ollama](https://ollama.com)**. A hosted model API will be connected later.

The AI features sit behind service interfaces, so the UI does not depend on which model provider is used:

| Feature | Service |
|---|---|
| Author assist in the lesson editor | `components/features/create-course/curriculum/ai-assist/lesson-ai-service.ts` |
| Student "ask about this lesson / selection" | `components/features/learn/ai-assist/lesson-ai-service.ts` |
| Lesson summary and review questions | `components/features/learn/recap/lesson-recap-service.ts` |

Every service returns a `Result<T, E>` value instead of throwing, so the UI handles success and failure explicitly. Switching from Ollama to a hosted API means replacing one provider adapter; the components that call it stay the same.

**Planned:**
- Hosted LLM API behind the same adapter, with the API key kept on the server only
- Rate limiting on AI requests, plus an AI usage log (used for both limits and thesis metrics)
- Prompts grounded in the lesson text, with defences against prompt injection from lesson content and selections
- Caching recaps per lesson version

---

## Architecture

```
┌──────────────────────── Next.js App Router ────────────────────────┐
│  Server Components         Server Actions        Client Components │
│  data fetching,            mutations,            interactive UI,   │
│  auth checks, layouts      Result<T, E>          uploads           │
└──────────────┬──────────────────────┬──────────────────────────────┘
               │ @supabase/ssr        │ AI service interface
┌──────────────▼──────────────┐  ┌────▼───────────────────────────────┐
│ Supabase                    │  │ LLM provider adapter               │
│ PostgreSQL + RLS · Auth ·   │  │ now: Ollama (local)                │
│ Storage (avatars, attachm.) │  │ later: hosted API                  │
└─────────────────────────────┘  └────────────────────────────────────┘
```

Key decisions:
- **Security is enforced in the database.** Every table has RLS enabled. Private courses, lessons and attachments are protected by policies, not only by UI routing.
- **Sessions use cookies.** They are refreshed in `proxy.ts` (Next.js middleware) through `@supabase/ssr`.
- **Server Components use the server Supabase client** (`lib/supabase/server.ts`). The browser client is only used for uploads and interactive features.
- **Components follow atomic design:** `components/ui` (primitives) → `components/shared` (reusable molecules) → `components/features/<feature>` (feature organisms) → `app/` (page composition only).

---

## Project structure

```
app/
  auth/              login, sign-up, password reset, email confirmation
  dashboard/         courses, create-course, author-space, explore,
                     settings, attachments (signed-URL download route)
components/
  ui/                shadcn/ui primitives
  shared/            reusable components
  features/          auth, author-space, course-questions, create-course,
                     dashboard, explore, landing, learn, my-courses, settings
lib/
  data-access/       typed query functions (getCourseWithLessons, ...)
  security/          HTML sanitisation for lesson content
  supabase/          server and browser clients
  database.types.ts  generated Supabase types
supabase/
  migrations/        schema, RLS policies, storage buckets, triggers
```

---

## Getting started

### Requirements
- Node.js 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli) and Docker (for the local Supabase stack)
- [Ollama](https://ollama.com/download) with a model pulled

### 1. Install dependencies
```bash
npm install
```

### 2. Start Supabase locally
```bash
supabase start      # DB, Auth, Storage and Studio
supabase db reset   # apply all migrations
```
`supabase start` prints the local API URL and keys.

### 3. Start Ollama
```bash
ollama pull <model>   # e.g. llama3.1:8b
ollama serve          # listens on http://localhost:11434
```

### 4. Configure environment variables
Copy `.env.example` to `.env.local` and fill in:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable or anon key>

# Server-only, never prefix with NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=<service role key>

# Local LLM
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=<model>
```

### 5. Run the app
```bash
npm run dev
```
The app runs at [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type-check |
| `npm test` | Run Vitest unit tests once |
| `npm run test:watch` | Vitest in watch mode |
| `supabase migration new <name>` | Create a new migration |
| `supabase gen types typescript --local > lib/database.types.ts` | Regenerate DB types |

Unit tests are colocated with the source as `*.test.ts`.

---

## Project status

| Phase | Status |
|---|---|
| 0. Scaffolding (Next.js and shadcn/ui) | ✅ Done |
| 1. Database modelling and RLS | ✅ Done |
| 2. Auth and Supabase SSR | ✅ Done |
| 3. Instructor dashboard | ✅ Done |
| 4. Student view and resource protection | ✅ Done |
| 5. LLM integration | 🟡 In progress: local Ollama connected, hosted API next |
| 6. Optimisation, testing and thesis documentation | 🟡 Started |

See [ROADMAP.md](ROADMAP.md) for the detailed plan.

---

## Security notes
- `SUPABASE_SERVICE_ROLE_KEY` and LLM API keys stay on the server only.
- Lesson HTML is sanitised before it is rendered (`lib/security/sanitize-html.ts`).
- Uploaded file paths are validated before Storage operations, and attachments are served only through short-lived signed URLs.
- Rate limiting on AI endpoints is required before a production deployment.