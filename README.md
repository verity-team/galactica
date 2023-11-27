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

## Running the app

```bash
# development watch mode
$ npm run start:dev

# docker mode (with temporary database)
$ npm run docker:start

# stop docker mode
$ npm run docker:stop
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

### Utility commands

```bash
# Format codebase
$ npm run format

# Lint codebase
$ npm run lint
```
