# Lumen Marketing - Next.js Serverless Conversion

## Setup

1. Install Node.js 20+.
2. Create a PostgreSQL database (Neon, Supabase, or another managed PostgreSQL provider).
3. Copy `.env.example` to `.env` and set `DATABASE_URL`.
4. Install dependencies: `npm install`.
5. Create tables: `npm run db:push`.
6. Seed the original site data: `npm run db:seed`.
7. Run locally: `npm run dev`.

## What changed

- Netlify Blobs was replaced by PostgreSQL through Prisma.
- `/.netlify/functions/site-data` was replaced by `/api/site-data`.
- Netlify Forms was replaced by `/api/contact`.
- Site data is persisted in the `SiteData` table.
- Contact submissions are persisted in `ContactSubmission`.

## Deployment

Deploy to Vercel or another Next.js-compatible host, set `DATABASE_URL`, and run the database migration/seed once before using the admin dashboard.

## Security note

The original project uses a client-side PIN gate. This conversion preserves the existing save-PIN behavior for compatibility, but production use should add proper server-side authentication (for example Auth.js/Clerk/Supabase Auth) before exposing admin editing publicly.
