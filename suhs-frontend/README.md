# NEST frontend

## Run locally

From the parent `NEST` directory, run `npm run dev` to start both apps.
See [the project README](../README.md) for installation and database setup.
To run only the frontend from this directory:

```bash
npm run dev
```

The frontend is served at `http://localhost:3001`. Requests use `/api` by default,
which Next.js forwards to NestJS. Set the server-only `API_URL` in `.env.local`
to change the backend address (defaults to `http://127.0.0.1:3000`).

## Authentication storage

This learning project stores the JWT access token in `localStorage`. This is
convenient for a browser-only app, but any JavaScript running on the origin can
read it, so an XSS vulnerability could expose the token. Client-side redirects
are only a user-experience measure; authorization is enforced by the NestJS
JWT guard and token-version validation.
