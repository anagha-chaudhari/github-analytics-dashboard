<div align="center">

# GitHub Analytics Dashboard

**GitHub Engineering Analytics Dashboard — connect your GitHub account and actually understand your development activity.**

![Node](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-339933?logo=node.js)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react)
![Auth](https://img.shields.io/badge/Auth-GitHub%20OAuth%202.0-181717?logo=github)
![Charts](https://img.shields.io/badge/Charts-Recharts-8884d8)

</div>

---

## Overview

I kept seeing GitHub profile READMEs and wrapped stats everywhere, but none of them actually told anything useful — just commit streaks and language bars. I wanted something that behaves more like a real engineering dashboard: PR cycle times, merge rates, contributor breakdowns, commit trends over time. So I built this GitHub Analytics Dashboard (call it DevPulse.)

The goal wasn't to make another pretty GitHub stats card. It was to build something that a team could actually use to understand their own development patterns — and to do it with a production-quality auth flow.

---

## Features

### I] GitHub OAuth 
Full Authorization Code Flow. The access token never leaves the server — it lives in an `httpOnly` session cookie. The frontend never touches a raw token.

### II] Repository Overview
Lists repos with language, stars, forks, open issues, and visibility. Sorted by last updated. Click any repo to load its analytics.

### III] Commit Activity Chart
90-day commit history for any selected repository, grouped by date and rendered as an area chart. Shows total commit count and trend at a glance.

### IV] Pull Request Metrics
Per-repo PR analytics: merge rate, average cycle time (open → merge), open vs merged vs closed breakdown, and a recent PR list with state badges. This is the part that makes it an analytics tool rather than a profile viewer.

### V] Secure Session Management
Login persists via server-side session. Logout destroys the session and clears the cookie. The frontend checks `/auth/status` on load.

---

## Tech Stack

**Frontend** — React, Vite, React Router, Recharts

**Backend** — Node.js, Express.js, Axios, express-session

**External** — GitHub REST API v3, GitHub OAuth 2.0

---

## Auth Flow

```
User clicks "Connect with GitHub"
        ↓
Redirected to GitHub OAuth consent screen
        ↓
GitHub redirects back with a one-time code
        ↓
Frontend sends code → POST /auth/github/callback
        ↓
Backend exchanges code for access token (client_secret stays on server)
        ↓
Token stored in encrypted httpOnly session cookie
        ↓
All subsequent API calls use credentials: "include" — cookie sent automatically
        ↓
Frontend never sees or stores the token
```

This is the Authorization Code Flow.

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/auth/github/callback` | Exchanges OAuth code for token, creates session |
| `POST` | `/auth/logout` | Destroys session, clears cookie |
| `GET` | `/auth/status` | Returns `{ authenticated: bool }` |
| `GET` | `/api/github/user` | Authenticated user's GitHub profile |
| `GET` | `/api/github/repos` | User's repositories (sorted by updated) |
| `GET` | `/api/github/commits/:owner/:repo` | 90-day commit activity grouped by date |
| `GET` | `/api/github/prs/:owner/:repo` | PR metrics: merge rate, cycle time, recent list |
| `GET` | `/api/github/contributors/:owner/:repo` | Top contributors with % share |
| `GET` | `/api/github/languages/:owner/:repo` | Language breakdown by bytes |

All routes behind `/api/github/*` require an active session. Unauthenticated requests return `401`. GitHub rate limit errors return `429` with the reset time.

---

## Running Locally

### Prerequisites
- Node.js 18+
- A GitHub OAuth App ([create one here](https://github.com/settings/developers))
  - Set **Authorization callback URL** to `http://localhost:5173/callback`

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
SESSION_SECRET=any_long_random_string_at_least_32_chars
FRONTEND_URL=http://localhost:5173
PORT=3001
NODE_ENV=development
```

```bash
node server.js
# DevPulse API running on http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_GITHUB_CLIENT_ID=your_client_id
```

```bash
npm run dev
# http://localhost:5173
```

---

## Environment Variables Reference

**Backend (`backend/.env`)**

| Variable | Description |
|----------|-------------|
| `GITHUB_CLIENT_ID` | From your GitHub OAuth App |
| `GITHUB_CLIENT_SECRET` | From your GitHub OAuth App |
| `SESSION_SECRET` | Random string, min 32 chars |
| `FRONTEND_URL` | Allowed CORS origin |
| `PORT` | API port (default 3001) |
| `NODE_ENV` | `development` or `production` |

**Frontend (`frontend/.env`)**

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL |
| `VITE_GITHUB_CLIENT_ID` | Needed to build the OAuth redirect URL |

---

<div align="center">
  Built to understand what actually goes into a production auth flow.
</div>
