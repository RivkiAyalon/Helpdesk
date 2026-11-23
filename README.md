# Helpdesk: AI-Powered Ticket Management System

A support ticket system that turns support emails into tickets and uses AI to classify, summarize and suggest replies, so agents can focus on complex issues. See [project-scope.md](project-scope.md) for the full scope.

## Students

- Rivkah Ayalon-Hirsch

## Requirements

| Tool | Version used | Notes |
| --- | --- | --- |
| Node.js | 24.19.0 | Minimum 20.19 or 22.12 (required by Vite 8 and Prisma 7) |
| npm | 11.17.0 | Comes with Node.js |
| Docker Desktop | Docker 29.9.3, Compose v5.7.1 | Runs PostgreSQL |
| PostgreSQL | 17.12 | Runs in Docker (`postgres:17` image); no local install needed |
| Git | 2.55.0 | |

Main libraries:

| Part | Libraries |
| --- | --- |
| Client | React 19.3, TypeScript 7.0, Vite 8.3, Tailwind CSS 4.3, React Router 8.5 |
| Server | Express 5.3, TypeScript 5.9, tsx 4.23, Prisma 7.10 (with `@prisma/adapter-pg`), dotenv 17 |

## Installation

```bash
git clone <repository-url>
cd Helpdesk

# 1. Install dependencies for client and server (also generates the Prisma client)
npm install

# 2. Create the server environment file
cp server/.env.example server/.env
#    The defaults match compose.yaml:
#    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/helpdesk?schema=public"

# 3. Start PostgreSQL in Docker
npm run db:up

# 4. Create the database tables
npm run db:migrate
```

## Running the app

```bash
npm run dev
```

This starts the server and the client together.

| What | URL |
| --- | --- |
| Client (React) | http://localhost:5173 |
| Server (Express API) | http://localhost:3000 |
| Health check | http://localhost:3000/api/health |

The client forwards `/api` requests to the server, so http://localhost:5173/api/health works too.

## All commands

Run from the project root:

| Command | What it does |
| --- | --- |
| `npm install` | Install all dependencies and generate the Prisma client |
| `npm run dev` | Run server and client in development mode |
| `npm run build` | Build server and client |
| `npm run db:up` | Start the PostgreSQL container |
| `npm run db:down` | Stop the PostgreSQL container (data is kept) |
| `npm run db:migrate` | Apply database migrations (and create new ones after schema changes) |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:test` | Run the Prisma test: save a sample record and read it back |

## Notifier

Claude Code sends a desktop notification when it finishes a task, using the Agent Notifications plugin (`claude-notifications-go`).

### Installation

1. Add the plugin marketplace in Claude Code:

   ```
   /plugin marketplace add 777genius/agent-notifications
   ```

2. Install the plugin with `/plugin install`, choosing **user scope** so it works in every project.
3. Run the plugin's setup command:

   ```
   /claude-notifications-go:init
   ```

### Windows fix: `sh` not found

The plugin's Stop hook runs through `sh`, which Windows doesn't have by default. Adding Git for Windows' `bin` folder (for example `C:\Program Files\Git\bin`) to the `PATH` environment variable fixed it.

### Notification event

The notification is triggered by the **Task Complete** event: Claude Code's Stop hook fires when Claude finishes responding to a prompt.

### Screenshot

![Claude Code desktop notification after a task completes](docs/notifier.png)

## Agent review example

Working with an AI agent still needs a person to check its output against the requirements. In this project:

1. **What the agent produced:** Claude first wrote a specification (`SPEC.md`). It used 6 ticket statuses (new, open, auto-replied, escalated, resolved, closed) and its own ticket categories (billing, technical, account, general).
2. **What I checked:** I compared it with the lecturer's [project-scope.md](project-scope.md).
3. **What didn't match:**
   - **Statuses:** the scope defines 3 (Open, Resolved, Closed).
   - **Categories:** the scope defines General Question, Technical Question and Refund Request.
   - **Refund handling:** the spec treated refund content as a reason to always send a ticket to a human agent, while the scope makes Refund Request one of the three categories.
4. **What I did:** I had Claude delete `SPEC.md` and work only from `project-scope.md`.
5. **Result:** the database schema and the rest of the system use the statuses, categories and roles from the agreed scope.

## Submission checks (Assignment 1)

All checks were run on 2026-11-23 on Windows 11 with the versions listed above.

| # | Check | Result |
| --- | --- | --- |
| 1 | Client builds with Tailwind CSS and React Router (`npm run build -w client`) | Pass |
| 2 | Welcome screen loads at http://localhost:5173 and shows the server's `GET /api/health` response | Pass: shows "Server and database are up" and `HTTP 200 {"status":"ok","database":"connected"}` |
| 3 | `/api/health` works directly (port 3000) and through the client proxy (port 5173) | Pass: HTTP 200 on both |
| 4 | Docker Compose file renamed to `compose.yaml`; no references to the old name remain | Pass |
| 5 | PostgreSQL data persists after `docker compose stop` / `start` | Pass: the test record was still there |
| 6 | PostgreSQL data persists after `docker compose down` / `up -d` (container deleted and recreated) | Pass: the test record was still there; data lives in the `helpdesk_pgdata` volume |
| 7 | Prisma test script (`npm run db:test`) saves and reads back a sample record | Pass: 5 of 5 checks passed |
| 8 | Server type-checks (`npm run typecheck -w server`) | Pass |

### Persistence test details

1. Inserted a record into `knowledge_base_articles` ("Persistence check").
2. Ran `docker compose stop`, then `docker compose start`. Queried the table: the record was still there.
3. Ran `docker compose down` (the container was removed; the `helpdesk_pgdata` volume was kept), then `docker compose up -d`. Queried again: the record was still there.
4. Deleted the test record.

### Prisma test output

```
Prisma test: write and read a synthetic record

1. Saving sample ticket...
  Saved ticket id: 1

2. Reading it back from the database...
  Ticket id:       1
  Subject:         [TEST] Cannot open course materials
  Customer:        Test Student <test.student@example.com>
  Status:          OPEN
  Category:        (not classified)
  Created at:      2026-11-23T18:25:03.892Z
  Messages:        1
  First message:   Hi, the link to week 3 materials returns an error. Can you help?

3. Checking the values match...
  PASS  subject
  PASS  customer email
  PASS  default status OPEN
  PASS  one message saved
  PASS  message body

4. Cleaning up the sample record...
  Deleted ticket:  1

RESULT: PASS - Prisma can write to and read from PostgreSQL.
```

The script deletes its sample record at the end, so the database stays clean.
