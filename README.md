## Installation

### 1. Install dependencies

```bash
$ npm install
```

### 2. Setup environment variables

- Make a copy of the `.env.example` file and rename it to `.env`
- Change environment variables according to your setup

View [Note](#notes) section for more info.

### 3. Generate Prisma's types

```bash
# Generate Prisma types
$ npx prisma generate
```

## Running the server for development

```bash
# development watch mode
$ npm run start:dev

# docker mode (with temporary database)
$ npm run docker:start

# stop docker mode
$ npm run docker:stop
```

## Building the server for production

- Remember to set `NODE_ENV` to `production`

- Remember to set `DATABASE_URL` to your desired Postgres database

```bash
# Build the server
npm run build

# Run the server file using npm script
npm run start:prod

# or with Node.js

node dist/src/main
```

## Test

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## Notes

### Environment variables

- `PORT`: The port the server will run on, default to 3000 if not configured.

- `MAX_IMG_SIZE`: Maximum upload image size in bytes, default to 2000000 (2MB) if not configured.
- `ALLOW_IMG_TYPE`: Valid types of upload image, separated by a "|". The server support JPG, JPEG, PNG and GIF by default if not configured.
- `IMAGE_DEST`: Path to directory that store all users' uploaded images

- `DATABASE_URL`: Connection string to connect to a PostgresQL database

- `POSTGRES_USER`: Username used for PostgresQL inside Docker
- `POSTGRES_PASSWORD`: Password used for PostgresQL inside Docker
- `POSTGRES_DB`: Database name used for PostgresQL inside Docker

- `SHORT_LIMIT`: Allowed number of requests during `SHORT_TTL`. Default to 1
- `SHORT_TTL`: A short time-to-live timespan in ms. Default to 1000 (1 second)
- `LONG_LIMIT`: Allowed number of request during `LONG_TTL`. Default to 10
- `LONG_TTL`: A long time-to-live timespan in ms. Default to 60000 (1 minute)

- `JWT_SECRET_KEY`: A secret key to generate and to verify signatures

### Utility commands

```bash
# Format codebase
$ npm run format

# Lint codebase
$ npm run lint
```
