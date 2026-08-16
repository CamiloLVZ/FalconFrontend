# Falcon Airlines — Flight Booking Frontend

Frontend web application for the Falcon Airlines flight reservation system, a fictional airline company. It consumes the [Falcon Booking API](https://github.com/CamiloLVZ/falcon-booking-api) end-to-end, covering the full passenger booking journey and an internal admin panel for airline operations.

This project was built primarily to validate and exercise the backend API in a realistic, complete client — from public flight search and booking to authenticated admin management. It is not the focus of the author's technical specialization (backend development), but was built with real structure and production concerns rather than as a throwaway prototype.

## Project Overview

The frontend covers two distinct experiences:

**Public / passenger flow**

- Flight search and browsing
- Seat selection and booking (consuming the backend's atomic pay-to-reserve flow)
- Reservation management (view, modify, cancel)
- Self check-in with boarding pass display
- QR-based boarding pass validation (camera scanning)
- User authentication and profile

**Admin panel**

- Airport, route, and aircraft type management
- Flight generation controls
- Passenger and reservation oversight
- Check-in and boarding operations
- User and role management

## Architecture

The codebase mirrors the backend's **Package by Feature** philosophy rather than organizing purely by technical layer (components/pages/services scattered separately). This was a deliberate choice for consistency across both repositories and for the same reason it was chosen in the backend: high cohesion, and a folder structure that reflects what the application does, not just what framework it uses.

- **`admin/features/`** — one folder per business domain (aircraft, airports, boarding, checkin, flightGeneration, flights, passengers, reservations, routes, users), each with its own components, pages, services, and types
- **`auth/`** — authentication as a self-contained module: context/provider, route guards (`RequireAuth`, `RequireAdmin`), token utilities, and login/password-reset UI
- **`pages/`** — top-level public passenger-facing routes (booking, flights, check-in, boarding, reservation management, user profile)
- **`components/common/`** — shared UI: layout chrome, error/loading states, and the server wakeup gate (see below)
- **`api/`** — a single configured Axios instance as the HTTP boundary to the backend

## Highlights

- **Server Wakeup Gate**: the backend runs on Render's free tier, which suspends after inactivity and can take a noticeable amount of time to cold-start. Instead of leaving the user with a frozen or broken UI, a dedicated gate component checks backend health and shows an informative loading state until the API is ready — a deliberate UX decision to communicate an infrastructure constraint honestly rather than hide it.
- **JWT-based auth on the client**: token decoding and expiration handling (`jwt-decode`), with route guards restricting admin routes to authenticated admin users.
- **QR boarding pass scanning**: camera-based QR validation (`html5-qrcode`) for the check-in/boarding flow, consuming the backend's boarding pass validation endpoint.
- **Feature-organized admin panel**: nine independent admin domains, each isolated with its own services and types, making it straightforward to extend without touching unrelated features.
- **CI/CD mirroring the backend's pipeline**: separate CI (lint + build) and CD (triggered on successful CI via `workflow_run`, deploying through a Vercel deploy hook) — the same two-workflow pattern used in the backend, for consistency across both repositories.

## Tech Stack

- React 19
- TypeScript
- Vite 8
- React Router 7
- Tailwind CSS 4
- Axios
- jwt-decode
- html5-qrcode
- pnpm
- ESLint
- GitHub Actions (CI/CD)
- Vercel (hosting)

## Environment Variables

```
VITE_API_URL=<backend API base URL>
```

- `.env.development` points to a local backend instance (`http://localhost:8080/api`)
- `.env.production` points to the deployed API (`https://api.falconbooking.org/api`)

## How to Run

Prerequisites: Node.js 22+ and pnpm.

```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm dev

# Type-check and build for production
pnpm build

# Preview the production build locally
pnpm preview

# Lint
pnpm run lint
```

By default, the app expects the backend API to be reachable at the URL configured in `VITE_API_URL`. To run against the full stack locally, start the [backend](https://github.com/CamiloLVZ/falcon-booking-api) first.

## CI/CD

- **Frontend CI**: runs on every push and pull request to `main`/`develop` — installs dependencies with pnpm, lints, and builds the project.
- **Frontend CD**: triggered automatically once CI succeeds on `main`, deploying to Vercel through a deploy hook (`VERCEL_DEPLOY_HOOK` secret).

## Live Demo

The application is deployed and publicly accessible, sharing a custom domain with the backend:

| Service            | URL                                             |
| ------------------ | ----------------------------------------------- |
| Frontend           | [falconbooking.org](https://falconbooking.org)  |
| Backend API        | api.falconbooking.org                           |
| Backend Swagger UI | api.falconbooking.org/api/swagger-ui/index.html |

> **Note:** the backend runs on Render's free tier and may take a short while to respond on first load after a period of inactivity. The app shows a loading screen while the server wakes up — this is expected behavior, not a bug.

## Related Repository

- Backend API: [github.com/CamiloLVZ/falcon-booking-api](https://github.com/CamiloLVZ/falcon-booking-api) — Java 21 / Spring Boot 3, PostgreSQL, Docker, GitHub Actions CI/CD.

This project is for educational and portfolio purposes.

## Author

Juan Camilo Londoño Velasquez
Backend Developer (Java / Spring Boot) — this frontend was built to exercise and demonstrate the backend API end-to-end.
