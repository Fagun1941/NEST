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

## Microsoft Entra ID SSO

Register a **Web**, single-tenant app in Microsoft Entra. Its redirect URI must
be `http://localhost:3001/api/auth/microsoft/callback`. Use authorization code
flow; implicit grants and Microsoft Graph permissions are not needed.

Set these values in `suhs/.env` (not in the frontend):

```dotenv
FRONTEND_URL=http://localhost:3001
MICROSOFT_TENANT_ID=your-directory-tenant-id
MICROSOFT_CLIENT_ID=your-application-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret-value
```

The tenant setting must be your actual Directory ID GUID, not `common`.
The client secret is the secret **Value**, not the Secret ID. Never commit it.
For fresh setup, stop the app before running `npm run db:generate` and
`npm run db:migrate`. Then run `npm run dev` and choose **Sign in with Microsoft**.
The callback URL is reached automatically after Microsoft sign-in; do not open
it directly. Restart the backend after editing `.env`.

Microsoft users are identified by tenant ID + object ID. New users receive the
STUDENT role. Returning users keep their assigned role. Email matching alone
does not link a Microsoft user to an existing password account; use password
login for that account. Microsoft-only users have no usable local password.

The backend validates the ID token signature, audience, issuer, lifetime,
tenant, and nonce. State and PKCE bind the browser flow. A short-lived HttpOnly
cookie hands off to the existing app JWT without tokens in redirect URLs.
The app still uses its existing localStorage JWT mechanism. App logout
invalidates app tokens, but leaves the Microsoft browser session signed in.
Handoff replay tracking is in memory for this single-backend deployment; use a
shared atomic replay store before scaling to multiple backend instances.

For deployment, register the production HTTPS callback and set `FRONTEND_URL`
to that HTTPS origin. Rotate the client secret before its expiration.

## Other commands

- `npm run dev:api`: backend only.
- `npm run dev:web`: frontend only.
- `npm run db:generate`: regenerate the Prisma client after schema changes.
- `npm run lint`: lint both apps.
- `npm test`: backend unit tests.
