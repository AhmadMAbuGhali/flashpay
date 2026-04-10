Flash Pay is a Next.js management platform for public and VIP money transfer accounts, backed by Supabase auth and data.

## Environment

Create a local env file with these values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-api-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
```

The service role key is required for admin dashboard actions that manage VIP users in Supabase Auth:

- create VIP users
- reset VIP passwords
- change VIP emails
- delete VIP users

Without `SUPABASE_SERVICE_ROLE_KEY`, public login and public registration still work, but admin-side VIP user management will fail.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Apply the database schema in [supabase-schema.sql](supabase-schema.sql) to your Supabase project before using the dashboard.

## Notes

- VIP people are stored in the `vip_users` table.
- Public users only see non-VIP active accounts.
- VIP users can log in and view all accounts.
- Admin-only dashboard pages include countries, VIP people, and UI content editing.
- UI copy can be edited per language from `/dashboard/content`.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Supabase Documentation](https://supabase.com/docs) - auth, database, and project setup.

## Deploy on Vercel

When deploying, add the same three environment variables in your hosting provider settings.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
