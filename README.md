# Message Web

Church management frontend — SvelteKit, Tailwind CSS, Flowbite-Svelte.

## Prerequisites

- Node.js 20+
- [Message API](../message/README.md) backend running

## Quickstart

```bash
cd message-web
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

## Environment

Create a `.env` file to point to the Flask backend:

```
VITE_API_URL=http://localhost:5000/api/v1
```

Defaults to `http://localhost:5000/api/v1` if not set.

## Available scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR at `localhost:5173` |
| `npm run build` | Production build to `.svelte-kit/output/` |
| `npm run preview` | Preview production build locally |
| `npm run check` | Type-check with svelte-check |

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | SvelteKit 2 (Svelte 5 runes mode) |
| UI | Flowbite-Svelte + Flowbite-Svelte-Icons |
| CSS | Tailwind CSS v4 |
| Language | TypeScript |
| Build | Vite 8 |

## Project structure

```
src/
├── app.css              # Tailwind imports + flowbite plugin
├── app.html             # HTML shell
├── routes/              # File-based SvelteKit routes
│   ├── +layout.svelte   # Auth guard, full-width top bar, sidebar nav
│   ├── +error.svelte    # Error boundary page
│   ├── +page.svelte     # Root → redirects to /login
│   ├── login/           # Login page
│   ├── register/        # Registration page
│   ├── directory/       # Person directory
│   │   ├── +page.svelte       # List with search, delete modal
│   │   ├── [id]/+page.svelte  # Detail view
│   │   └── new/+page.svelte   # Create / edit form
│   ├── teams/           # Teams (placeholder)
│   └── groups/          # Groups (placeholder)
├── lib/
│   ├── api/
│   │   └── persons.ts   # Person API client (CRUD)
│   ├── stores/
│   │   └── auth.ts      # Auth store, apiFetch with auto-refresh
│   └── types/
│       └── models.ts    # TypeScript interfaces (User, Person, Team, Group, etc.)
└── static/              # Static assets (favicon, etc.)
```

## Auth flow

1. On page load, `initAuth()` checks `localStorage` for a cached JWT access token
2. If found, validates it via `GET /auth/user`
3. If expired or missing, refreshes tokens via httpOnly cookie (`POST /auth/tokens`)
4. Unauthenticated users are redirected to `/login`
5. `apiFetch()` automatically refreshes tokens on 401 responses
