# Redeem TS

Redeemer script for [Circles Subscriptions](https://github.com/deluXtreme/). Depends on the existence of

- [SubIndexer](https://github.com/deluXtreme/subindexer) running an API endpoint for "redeemable" subscriptions.

## Run Options

All runners require supplying `API_URL` & `REDEEMER_KEY` (cf. [.env.sample](./.env.sample)).

### Docker Image

```sh
docker run --env-file .env ghcr.io/deluxtreme/redeem-ts
```

### Bun Run

```sh
bun install
bun run src/main.ts
```
