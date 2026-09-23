# Non-Surgical Beauty Clinic Appointment Booking Platform

A full-stack appointment booking application for a non-surgical beauty clinic (e.g. facials, laser treatments, injectables, skin consultations). Clients can browse services and book appointments; admin manage services, schedules, and bookings.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router) — used for both frontend (React) and backend (Route Handlers / Server Actions)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database:** PostgreSQL
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (built on Radix UI + Tailwind CSS)
- **Styling:** Tailwind CSS
- **Authentication:** Better Auth
- **Validation:** Zod
- **Forms:** React Hook Form

## Features

### Client-Facing

- Browse services by category (e.g. Skincare, Laser, Injectables, Body Contouring)
- View service details: description, duration, price
- View available time slots
- Book, reschedule, or cancel appointments
- Account dashboard with upcoming and past appointments

### Admin

- Dashboard with booking overview
- Manage services (create, edit, archive, pricing, duration)
- Manage clinic working hours / availability
- View, approve, reschedule, or cancel client bookings
- Manage clients (view history, notes)
- Role-based access control (Admin, Client)

## Project Structure

```
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Prisma migrations
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (client)/          # Public/client-facing routes
│   │   │   ├── services/
│   │   │   └── appointments/
│   │   ├── (admin)/           # Admin dashboard routes
│   │   │   ├── appointments/
│   │   │   ├── availability/
│   │   │   ├── categories/
│   │   │   ├── dashboard/
│   │   │   ├── services/
│   │   │   └── users/
│   │   ├── api/                # Route handlers (REST-style API endpoints)
│   │   │   └── auth/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── client/              # Client-facing components
│   │   ├── auth/                # Auth components
│   │   └── admin/               # Admin-facing components
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client singleton
│   │   ├── auth.ts              # Auth configuration
│   │   ├── actions/             # Server Actions
│   │   └── validations/         # Zod schemas
│   ├── server/
│   │   └── actions/             # Server actions
│   └── types/
├── public/
├── .env.example
├── next.config.js
├── tailwind.config.ts
└── package.json
```

## Core Data Models (Prisma)

The schema centers around these entities (single clinic — no multi-branch/staff modeling needed):

- **User** — client or admin (role-based)
- **Service** — treatment offered, category, price, duration
- **Availability** — clinic working hours
- **Appointment** — booking record linking client, service, time slot, and status
- **Category** — service grouping

Example status enum for appointments:

```prisma
enum AppointmentStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
  NO_SHOW
}

enum Role {
  CLIENT
  ADMIN
}
```

## Getting Started

### Prerequisites

- Node.js 18.18+ (or 20+)
- PostgreSQL database (local or hosted, e.g. Supabase, Neon, Railway)
- pnpm

### 1. Clone and Install

```bash
git clone <repo-url>
cd beauty-clinic
pnpm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@localhost:5432/glowbook?schema=public"
BETTER_AUTH_SECRET="your-secret-here"
BETTER_AUTH_URL="http://localhost:3000"

STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxx"
```

### 3. Set Up the Database

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed   # optional: seed sample services/clinics/admin user
```

### 4. Run the Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) for the client app and `/admin/dashboard` for the admin dashboard (after logging in with an admin account).

## Authentication & Roles

Role-based access is enforced via middleware and server-side session checks:

- **Client** — can browse services and manage their own bookings only
- **Admin** — full access to manage services, availability, and all bookings (represents clinic staff)

## Booking Flow (Client)

1. Client browses services, filters by category
2. Selects a service
3. Available time slots are computed from clinic `Availability` minus existing `Appointment`s
4. Client selects a slot and confirms booking (auth required)
5. Confirmation is created with status `PENDING` or `CONFIRMED`

## License

MIT
