# SUHS: NestJS + Next.js

One project with a NestJS backend in `suhs/` and a Next.js frontend in
`suhs-frontend/`. Run all commands below from this root directory, `NEST`.
The apps keep their existing dependency lockfiles and install dependencies in
their own folders.

## Run locally

Use Node.js 24 or newer and a running PostgreSQL database.

1. Configure `suhs/.env`. If it does not exist, copy `suhs/.env.example` to
   `suhs/.env`. Set `DATABASE_URL` to your PostgreSQL database and set a long,
   random `JWT_SECRET`. Create the database named in your URL if needed.
   Preserve your existing `.env` if you already have one.
2. Optionally copy `suhs-frontend/.env.example` to
   `suhs-frontend/.env.local` if that file does not already exist. The defaults
   work without this file. For an existing file, use `NEXT_PUBLIC_API_URL=/api`
   and `API_URL=http://127.0.0.1:3000`.
3. Install dependencies, generate Prisma, and apply the checked-in migrations:

   ```powershell
   cd C:\Users\BS01301\Desktop\NEST
   npm run setup
   npm run db:migrate
   ```

4. Start both apps:

   ```powershell
   npm run dev
   ```

Open http://localhost:3001. Press Ctrl+C in the terminal to stop both apps.
NestJS runs on port 3000. Browser requests such as `/api/auth/login` are
forwarded by Next.js to NestJS `/auth/login`, so the browser uses one origin.
If you change the backend port, update `API_URL` to match and restart Next.js.
The combined runner also accepts `PORT` for NestJS and `WEB_PORT` for Next.js;
it automatically targets the selected NestJS port unless `API_URL` is set.
Stop existing app terminals before starting the combined command to avoid
port conflicts. Stop NestJS before running setup or regenerating Prisma on
Windows, where a running app locks the Prisma engine DLL.

## Optional initial administrator

Set `ADMIN_EMAIL`, `ADMIN_NAME`, and `ADMIN_PASSWORD` in `suhs/.env`, then run:

```powershell
npm run db:seed
```

The seed creates the administrator or promotes an existing account with that
email to ADMIN. An existing account keeps its current password.

## Production

Configure the backend environment and apply migrations first, then run:

```powershell
npm run build
npm start
```

`API_URL` must point to the backend when building Next.js because rewrites are
saved with the build. The default production frontend is also on port 3001.

## Other commands

- `npm run dev:api`: backend only.
- `npm run dev:web`: frontend only.
- `npm run db:generate`: regenerate the Prisma client after schema changes.
- `npm run lint`: lint both apps.
- `npm test`: backend unit tests.
