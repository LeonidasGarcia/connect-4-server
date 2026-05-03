# Connect 4 Server

NestJS TypeScript server for a Connect 4 game.

## Commands

```bash
npm run start        # development (localhost:3000)
npm run start:dev   # watch mode
npm run start:prod  # node dist/main

npm run test        # unit tests (src/**/* spec.ts)
npm run test:e2e    # e2e tests (test/jest-e2e.json)
npm run test:cov    # with coverage

npm run build       # nest build -> dist/
npm run lint        # eslint --fix
npm run format      # prettier --write
```

## Key Details

- **Entry point**: `src/main.ts` - enables CORS (`app.enableCors({ origin: '*' })`)
- **Port**: defaults to `3000` (`process.env.PORT ?? 3000`)
- **Test config**: e2e tests use separate config at `test/jest-e2e.json`
- **Source**: `src/` directory, root module is `AppModule`