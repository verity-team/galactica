## Installation

```bash
$ npm install
```

- Make a copy of the `.env.example` file and rename it to `.env`

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Notes

### Environment variables

- `PORT`: The port the server will run on, default to 3000 if not configured.

- `MAX_IMG_SIZE`: Maximum upload image size in bytes, default to 2000000 (2MB) if not configured.
- `ALLOW_IMG_TYPE`: Valid types of upload image, separated by a `|`. The server support JPG, JPEG, PNG and GIF by default if not configured.
