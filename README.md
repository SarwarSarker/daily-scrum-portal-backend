# Daily Scrum — Backend

Node.js + Express + TypeScript API with JWT authentication and role-based
access control. Data lives in PostgreSQL; Prisma is used as the typed client.

## Tech stack

- **Runtime:** Node.js, Express 5, TypeScript
- **Database:** PostgreSQL
- **ORM/client:** Prisma 7 (with the `pg` adapter)
- **Auth:** JWT (`jsonwebtoken`) + `bcryptjs`

## Roles

Four roles: `admin`, `manager`, `team_lead`, `employee` (see
[src/utlis/role.ts](src/utlis/role.ts)).

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally (or a connection string to a remote instance)

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the database

```bash
# create an empty database (psql or any client)
createdb daily_scrum
# or:  psql -U postgres -c "CREATE DATABASE daily_scrum;"
```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable              | Description                                   | Example                                                |
| --------------------- | --------------------------------------------- | ------------------------------------------------------ |
| `PORT`                | Port the API listens on                       | `5000`                                                 |
| `DATABASE_URL`        | Postgres connection string                    | `postgresql://postgres:password@localhost:5432/daily_scrum` |
| `JWT_ACCESS_SECRET`   | Secret used to sign access tokens             | any long random string                                 |
| `ACCESS_TOKEN_EXPIRES`| Access token lifetime                         | `1d`                                                   |

### 4. Create the database tables

```bash
npm run db:setup
```

This builds all the tables in your database and prepares Prisma. Run it once
after creating the database.

### 5. Run the server

```bash
npm run dev
```

The API starts on `http://localhost:5000`.

---

## Working with the database

The database is managed by Prisma. You only need three commands:

| When you... | Run this | What it does |
| ----------- | -------- | ------------ |
| Set up the project the first time | `npm run db:setup` | Creates all the tables |
| Change the tables (edit `src/prisma/schema.prisma`) | `npm run db:migrate` | Saves and applies your change |
| Want to view/edit data in the browser | `npm run db:studio` | Opens a visual table editor |

**A few notes:**

- `npm run db:migrate` will ask you to name your change (e.g. `add_phone_column`) — just type a short description and press Enter.
- It needs permission to create a temporary database while it works, which your
  local Postgres user normally already has.
- Need a special database feature Prisma doesn't support (like a `CHECK` rule or
  a trigger)? Run `npm run db:migrate`, then open the new file under
  [src/prisma/migrations/](src/prisma/migrations/) and add the SQL yourself.

---

