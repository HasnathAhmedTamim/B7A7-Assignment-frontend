# NestQuarter

**Housing & Roommate Platform — Frontend** · Programming Hero Level-2 · Batch-7 · Assignment **B7A7**

A Next.js app where tenants find rooms, send rental requests and pay rent with Stripe; landlords manage properties, rooms and incoming requests; and admins moderate users, listings, bookings and payments. It runs on the [B7A6 backend API](https://github.com/HasnathAhmedTamim/B7A6-Assignment-backend).

---

## Submission

| Field                   | Link / value                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Project**             | NestQuarter — Housing & Roommate Platform (idea #6)                                                         |
| **Frontend repository** | [HasnathAhmedTamim/B7A7-Assignment-frontend](https://github.com/HasnathAhmedTamim/B7A7-Assignment-frontend) |
| **Backend repository**  | [HasnathAhmedTamim/B7A6-Assignment-backend](https://github.com/HasnathAhmedTamim/B7A6-Assignment-backend)   |
| **Live frontend**       | [https://b7a7-assignment-frontend.onrender.com](https://b7a7-assignment-frontend.onrender.com)              |
| **Live API**            | [https://b7a6-assignment-backend.onrender.com/api/v1](https://b7a6-assignment-backend.onrender.com/health)  |
| **API documentation**   | [Postman Documenter](https://documenter.getpostman.com/view/31892953/2sBYAxP9Sg)                            |
| **Demo video**          | _Add the Google Drive link here_                                                                            |

> Both services run on Render's free plan and sleep after 15 minutes idle. The first visit can take 30–60 seconds while the API wakes up.

---

## Demo accounts

The login page has a one-click **Demo Login** button for each role. These are public evaluation accounts created by the backend seed script, and the backend blocks them from being blocked, re-roled or password-reset so they keep working.

| Role     | Email                  | Password            | Lands on     |
| -------- | ---------------------- | ------------------- | ------------ |
| Admin    | `admin@housing.com`    | `ChangeMeAdmin123!` | `/admin`     |
| Landlord | `landlord@housing.com` | `Landlord123!`      | `/landlord`  |
| Tenant   | `tenant@housing.com`   | `Tenant123!`        | `/dashboard` |

**Stripe test card:** `4242 4242 4242 4242`, any future expiry date, any CVC.

---

## Features

### Public site

- Home page with the latest published listings, plus About, How it works, FAQ and Contact pages
- Property browsing with search, city, area, rent range, property type, bedroom/bathroom and availability filters, sorting and pagination
- Property detail page with rooms, rent and a rental request form
- Loading skeletons, empty states and error states on every data view
- Per-page SEO metadata (title, description, canonical URL, Open Graph, Twitter card)
- Light and dark themes

### Authentication

- Email/password registration (tenant or landlord) and login
- Forgot / reset password with an emailed OTP
- One-click demo login for all three roles
- Role-based route protection in `src/proxy.ts`; unauthorized users are sent to `/login` or `/unauthorized`

### Tenant dashboard (`/dashboard`)

- Overview of requests, bookings and payments
- Rental requests: track status and cancel pending ones
- Bookings: details, cancel, and pay rent through Stripe Checkout
- Payment history with status
- Profile editing and photo upload with preview and progress bar

### Landlord dashboard (`/landlord`)

- Overview of properties, requests and bookings
- Create, edit, publish, archive and delete properties; add, edit and remove rooms
- Incoming rental requests: approve (creates a booking) or reject
- Bookings for owned properties and an earnings page with a chart

### Admin dashboard (`/admin`)

- Platform statistics with charts
- Users: search, filter by role/status, block/activate and change role
- Properties, bookings and payments (with a revenue chart) across the platform
- Audit log of critical actions

### Payments

- Stripe Checkout in test mode, charged in BDT
- The success page waits for the backend's Stripe webhook to confirm the payment before showing **Payment confirmed**; the cancel page lets the tenant retry

---

## Tech stack

| Layer         | Technology                                                      |
| ------------- | --------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router, Cache Components), React 19, TypeScript |
| Styling       | Tailwind CSS 4, shadcn/ui (Radix UI), lucide-react icons        |
| Server state  | TanStack Query                                                  |
| Client state  | Zustand                                                         |
| Forms         | React Hook Form + Zod                                           |
| Charts        | Recharts                                                        |
| Session       | Signed httpOnly cookies (`jose`)                                |
| Notifications | Sonner                                                          |
| Quality       | ESLint, Prettier, `tsc --noEmit`                                |
| Hosting       | Render (Node web service)                                       |

---

## How it fits together

```text
Browser
  → Next.js (Render)
      ├─ Server components fetch public listings from the API
      ├─ /api/auth/* route handlers store the session in httpOnly cookies
      └─ src/proxy.ts guards /dashboard, /landlord, /admin and /payment by role
  → B7A6 Express API (Render) → PostgreSQL (Neon), Redis, Cloudinary, Stripe
```

- **API client** (`src/lib/api`): a typed `fetch` wrapper that sends the access token as a Bearer header, refreshes it once on `401`, and reports upload progress for file uploads.
- **Session**: the access token lives in memory; the refresh token and a signed role/session cookie are httpOnly, so JavaScript can't read them. The `/api/auth/*` handlers reject cross-site requests.
- **Rendering**: public pages are statically generated where possible; listing sections render per request so builds never depend on the API being awake.

---

## Project structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── (public)/          # Home, properties, about, FAQ, contact, payment success/cancel
│   │   ├── (auth)/            # Login, register, forgot/reset password
│   │   ├── dashboard/         # Tenant area
│   │   ├── landlord/          # Landlord area
│   │   ├── admin/             # Admin area
│   │   ├── api/auth/          # Session, refresh and logout route handlers
│   │   └── unauthorized/
│   ├── components/            # UI grouped by feature (properties, bookings, payments, admin, ...)
│   ├── config/                # Site info, env, routes, navigation, demo accounts
│   ├── hooks/
│   ├── lib/                   # API client, auth/session helpers, validation schemas, formatting
│   ├── stores/                # Zustand stores
│   ├── types/                 # Shared API model types
│   └── proxy.ts               # Role-based route protection
├── .env.example
├── next.config.ts
└── package.json
```

---

## Getting started

Requires Node.js 20.9+ and a running [B7A6 backend](https://github.com/HasnathAhmedTamim/B7A6-Assignment-backend) (local or live).

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable                        | Description                                                    |
| ------------------------------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`      | Backend base URL including `/api/v1`                           |
| `NEXT_PUBLIC_SITE_URL`          | Public URL of this frontend (metadata and absolute links)      |
| `NEXT_PUBLIC_ENABLE_DEMO_LOGIN` | `true` to show the one-click demo login buttons                |
| `API_BASE_URL`                  | Optional server-only override of the backend URL               |
| `SESSION_SECRET`                | At least 32 random characters, used to sign the session cookie |

`NEXT_PUBLIC_*` values are baked in at build time, so rebuild after changing them.

### Scripts

| Command                           | Purpose                    |
| --------------------------------- | -------------------------- |
| `npm run dev`                     | Development server         |
| `npm run build`                   | Production build           |
| `npm start`                       | Serve the production build |
| `npm run lint`                    | ESLint                     |
| `npm run typecheck`               | TypeScript check           |
| `npm run format` / `format:check` | Prettier                   |

---

## Deployment (Render)

| Field         | Value                                                                                                                                                                             |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build command | `npm ci --include=dev && npm run build`                                                                                                                                           |
| Start command | `npm start`                                                                                                                                                                       |
| Environment   | The variables above, with `NEXT_PUBLIC_API_BASE_URL=https://b7a6-assignment-backend.onrender.com/api/v1` and `NEXT_PUBLIC_SITE_URL=https://b7a7-assignment-frontend.onrender.com` |

Don't set `PORT`; Render provides it. On the backend, set `FRONTEND_URL`, `CORS_ORIGIN`, `STRIPE_SUCCESS_URL` (`.../payment/success?session_id={CHECKOUT_SESSION_ID}`) and `STRIPE_CANCEL_URL` (`.../payment/cancel`) to this site's URL.

---

## License

Educational / assignment use.
