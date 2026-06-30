# Daily Scrum Portal — Backend

REST API for the Daily Scrum Portal. Built with Node.js, Express 5 and
TypeScript, backed by PostgreSQL through Prisma. Provides JWT authentication,
role-based access control (`admin`, `manager`, `team_lead`, `employee`) and
file uploads.

## Prerequisites

- **Node.js** 20 or newer
- **npm** (ships with Node.js)
- **PostgreSQL** 14 or newer (local install or a reachable connection string)

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/SarwarSarker/daily-scrum-portal-backend.git
cd daily-scrum-portal-backend
npm install
```

`npm install` runs `prisma generate` automatically (via the `postinstall`
script), so the Prisma Client is ready after install.

## Environment Variables

Create a `.env` file in the project root by copying the example:

```bash
cp .env.example .env
```

Then fill in your values.

### Required

| Variable               | Description                                  | Example                                                      |
| ---------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| `PORT`                 | Port the API listens on                      | `5000`                                                       |
| `DATABASE_URL`         | PostgreSQL connection string                 | `postgresql://postgres:password@localhost:5432/database_name`  |
| `JWT_ACCESS_SECRET`    | Secret used to sign JWT access tokens        | a long random string                                         |
| `ACCESS_TOKEN_EXPIRES` | Access token lifetime                        | `1d`                                                         |

### Optional

| Variable           | Description                                | Default            |
| ------------------ | ------------------------------------------ | ------------------ |
| `UPLOAD_DIR`       | Directory where uploaded files are stored  | `uploads`          |
| `MAX_UPLOAD_BYTES` | Maximum upload size in bytes               | `10485760` (10 MB) |

## Database Setup

1. **Start PostgreSQL** and make sure it is reachable.

2. **Create the database:**

   ```bash
   createdb daily_scrum
   # or:
   psql -U postgres -c "CREATE DATABASE daily_scrum;"
   ```

3. **Configure the connection string** by setting `DATABASE_URL` in `.env` to
   point at the database you just created.

4. **Run the migrations.** On a fresh checkout there are no committed
   migrations yet, so create and apply the initial one:

   ```bash
   npm run db:migrate
   ```

   Prisma will prompt for a migration name (e.g. `init`). Once migrations exist
   in `src/prisma/migrations`, environments that should only apply them (CI,
   production) can run `npm run db:setup` instead.

5. **Generate the Prisma Client** (already run by `postinstall`, but you can
   regenerate it manually after schema changes):

   ```bash
   npx prisma generate
   ```

> Database seeding is not configured for this project.

## Running the Project

Development mode (auto-reload on file changes):

```bash
npm run dev
```

Production build and start:

```bash
npm run build
npm start
```

The compiled output is written to `dist/`.

## Available Scripts

| Script               | Description                                                              |
| -------------------- | ------------------------------------------------------------------------ |
| `npm run dev`        | Start the server in watch mode with `ts-node-dev`.                       |
| `npm run build`      | Compile TypeScript to JavaScript in `dist/`.                             |
| `npm start`          | Run the compiled server (`dist/server.js`).                              |
| `npm run db:setup`   | Apply existing migrations and generate the Prisma Client (`migrate deploy`). |
| `npm run db:migrate` | Create and apply a migration from schema changes (`migrate dev`).        |
| `npm run db:studio`  | Open Prisma Studio to browse and edit data.                              |
| `postinstall`        | Runs automatically after `npm install` to generate the Prisma Client.   |

## API Base URL

```
http://localhost:<PORT>/api/v1
```

With the default port: `http://localhost:5000/api/v1`. Uploaded files are
served as static assets from `/uploads`.

## Project Structure

```
src/
├── app.ts                # Express app: middleware, routes, error handling
├── server.ts             # Entry point — starts the HTTP server
├── configs/              # Environment, database and other configuration
├── controllers/          # Request handlers (auth, project, task, team, ...)
├── core/validation/      # Request validation schemas
├── middlewares/          # Auth, role, upload and error middleware
├── prisma/
│   └── schema.prisma     # Prisma data model
├── routes/v1/            # Versioned API route definitions
├── types/                # Shared TypeScript types
└── utlis/                # Helpers, response formatting, role constants
prisma.config.ts          # Prisma config (schema path, datasource URL)
```

## Troubleshooting

**`Cannot find module '.prisma/client/default'`**
The Prisma Client has not been generated. Run:

```bash
npx prisma generate
```

This happens after reinstalling `node_modules` or switching branches; the
`postinstall` script normally prevents it.

**`Environment variable not found: DATABASE_URL` / connection errors**
Ensure `.env` exists and `DATABASE_URL` is correct, and that PostgreSQL is
running and the target database exists.

**`Port already in use`**
Another process is using `PORT`. Stop it or set a different `PORT` in `.env`.

**Migration cannot create the shadow database**
`prisma migrate dev` needs permission to create a temporary database. Use a
PostgreSQL role that can create databases, or configure a
`shadowDatabaseUrl`.
</content>
</invoke>
