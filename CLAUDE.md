# CLAUDE.md

AI-powered support ticket management system. Support emails become tickets; AI classifies, summarizes and suggests replies; agents handle the rest.

## Source of truth

- `project-scope.md`: the project scope (features, ticket statuses, categories, roles). Follow it over any other document.
- `tech-stack.md`: chosen technologies.
- `implementation-plan.md`: phased task list. Tick a task (`[x]`) only after verifying it works.

## Project structure

npm workspaces monorepo:

```
.
├── client/                  React 19 + TypeScript + Vite
│   ├── src/main.tsx         Entry: BrowserRouter + Tailwind CSS import
│   ├── src/App.tsx          Route table (React Router, declarative mode)
│   ├── src/pages/           One component per page
│   └── vite.config.ts       Tailwind plugin; proxies /api → http://localhost:3000
├── server/                  Express 5 + TypeScript (ESM, run with tsx)
│   ├── src/index.ts         App entry; GET /api/health checks the database
│   ├── src/db.ts            Shared PrismaClient (PrismaPg driver adapter)
│   ├── src/scripts/         One-off scripts (prisma-test.ts)
│   ├── src/generated/prisma Generated Prisma client (gitignored, do not edit)
│   ├── prisma/schema.prisma Database schema
│   ├── prisma/migrations/   SQL migrations (committed)
│   ├── prisma.config.ts     Prisma 7 config: schema path, DATABASE_URL
│   └── .env                 Local secrets (gitignored); copy from .env.example
├── compose.yaml             PostgreSQL 17 for local development
└── package.json             Workspace root scripts
```

The `app/`, Gradle files and `.idea/` are a leftover Android Studio template; they are gitignored and not part of this app.

## Commands

Run from the repo root:

| Command | What it does |
| --- | --- |
| `npm install` | Install all workspaces; also runs `prisma generate` |
| `npm run db:up` | Start PostgreSQL in Docker (`docker compose up -d`) |
| `npm run db:down` | Stop PostgreSQL (data is kept in the `pgdata` volume) |
| `npm run dev` | Run server (port 3000) and client (port 5173) together |
| `npm run build` | Type-check and build server and client |
| `npm run db:migrate` | Create and apply a migration after editing `schema.prisma` |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:test` | Prisma smoke test: write, read back and delete a sample ticket |
| `npm run typecheck -w server` | Type-check the server |

## Conventions and gotchas

- Prisma 7: `prisma migrate dev` does **not** regenerate the client. Run `npm run db:generate` after schema changes.
- Server is ESM with `module: NodeNext`: relative imports need the `.js` extension (`./db.js`).
- Import the Prisma client from `./generated/prisma/client.js`, via the shared `prisma` export in `src/db.ts`.
- Enum values in the schema are UPPER_SNAKE (`OPEN`, `REFUND_REQUEST`, `ADMIN`).
- React Router is v8 in declarative mode: import from `react-router` (not `react-router-dom`).
- Tailwind CSS v4: no `tailwind.config.js`; configured via `@tailwindcss/vite` and `@import "tailwindcss"` in `src/index.css`.
- Never commit `.env` files. Add new variables to `server/.env.example`.
