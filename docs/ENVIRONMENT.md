# Environment and Secret Handling

Both backends load configuration from the repository root `.env` file. The two Next.js frontends read `NEXT_PUBLIC_*` values from their own project environment at build/runtime.

Never commit real `.env` files, passwords, JWT secrets, or `.pem` certificate files.

## Local Setup

Create `.env` at the repository root:

```powershell
Copy-Item .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

For Aiven MySQL, use TLS and point `DB_CA_CERT_PATH` at an absolute path to your local CA file:

```env
DB_HOST=your-aiven-host
DB_PORT=your-aiven-port
DB_USERNAME=avnadmin
DB_PASSWORD=your-aiven-password
DB_NAME=defaultdb
DB_SSL=true
DB_CA_CERT_PATH=C:/path/to/this-repo/aiven-ca.pem
```

Required auth and admin values:

```env
JWT_SECRET=replace-with-long-random-string
BACKEND_JWT_SECRET=replace-with-long-random-string
ADMIN_JWT_SECRET=replace-with-long-random-string
ADMIN_SESSION_SECRET=replace-with-long-random-string
ADMIN_EMAIL=admin
ADMIN_PASSWORD=admin
```

Default local ports:

```env
BACKEND_PORT=5000
ADMIN_BACKEND_PORT=4002
```

Local frontend values are optional because the code defaults to local URLs. If you override them locally, put them in `frontend/.env.local` and `admin-frontend/.env.local`:

```env
NEXT_PUBLIC_API_ENDPOINT=http://localhost:5000/api
NEXT_PUBLIC_ADMIN_GRAPHQL_ENDPOINT=http://localhost:4002/graphql
NEXT_PUBLIC_ADMIN_WS_ENDPOINT=ws://localhost:4002/graphql
```

For Vercel, set the same `NEXT_PUBLIC_*` values in each project.

## Hosted Values

Use the same Aiven database values for both Render backend services.

For Render, prefer a secret file:

```env
DB_SSL=true
DB_CA_CERT_PATH=/etc/secrets/aiven-ca.pem
```

Add a Render secret file named `aiven-ca.pem`. Render exposes it at `/etc/secrets/aiven-ca.pem`.

If a host cannot mount secret files, use an inline certificate:

```env
DB_CA_CERT="-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"
```

After Vercel deploys both frontends, set exact frontend origins on `admin-backend` for CORS:

```env
FRONTEND_URL=https://your-frontend.vercel.app
ADMIN_FRONTEND_URL=https://your-admin-frontend.vercel.app
```

Use exact origins only: no trailing slash and no quotes.

## Variable Ownership

| Variable | Used by | Purpose |
| --- | --- | --- |
| `NODE_ENV` | all services | Runtime/build mode |
| `DB_HOST` | `backend`, `admin-backend` | MySQL hostname |
| `DB_PORT` | `backend`, `admin-backend` | MySQL port |
| `DB_USERNAME` | `backend`, `admin-backend` | MySQL username |
| `DB_PASSWORD` | `backend`, `admin-backend` | MySQL password |
| `DB_NAME` | `backend`, `admin-backend` | MySQL database name |
| `DB_SSL` | `backend`, `admin-backend` | Enables TLS when set to `true` |
| `DB_CA_CERT_PATH` | `backend`, `admin-backend` | CA certificate file path |
| `DB_CA_CERT` | `backend`, `admin-backend` | Inline CA certificate alternative |
| `JWT_SECRET` | both backends | Shared fallback JWT secret |
| `BACKEND_JWT_SECRET` | `backend` | Normal user JWT secret |
| `ADMIN_JWT_SECRET` | `admin-backend` | Admin JWT secret |
| `ADMIN_SESSION_SECRET` | `admin-backend` | Express session secret |
| `ADMIN_EMAIL` | `admin-backend` | Seed admin login |
| `ADMIN_PASSWORD` | `admin-backend` | Seed admin password |
| `BACKEND_PORT` | `backend` | Local backend port override |
| `ADMIN_BACKEND_PORT` | `admin-backend` | Local admin backend port override |
| `FRONTEND_URL` | `admin-backend` | Deployed user frontend origin for CORS |
| `ADMIN_FRONTEND_URL` | `admin-backend` | Deployed admin frontend origin for CORS |
| `NEXT_PUBLIC_API_ENDPOINT` | `frontend` | User REST API base URL |
| `NEXT_PUBLIC_ADMIN_GRAPHQL_ENDPOINT` | both frontends | Admin GraphQL HTTP URL |
| `NEXT_PUBLIC_ADMIN_WS_ENDPOINT` | both frontends | Admin GraphQL WebSocket URL |

Legacy fallbacks still exist in code for older setups: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GRAPHQL_ENDPOINT`, and `SESSION_SECRET`. Prefer the variables listed above for new configuration.

## Generating Secrets

Run this command once per secret and use a different value each time:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

For the demo admin login, `ADMIN_EMAIL=admin` and `ADMIN_PASSWORD=admin` are intentionally simple. Do not use `admin / admin` for a real deployment.

## Private Files

These files must stay out of Git:

- `.env`
- `.env.local`
- `.env.development.local`
- `.env.test.local`
- `.env.production.local`
- `aiven-ca.pem`
- any `*.pem` file

The current `.gitignore` includes these patterns.
