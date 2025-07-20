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
cd actions && bun install
bun run src/main.ts
```

### Tenderly Actions

This project contains [Tenderly actions](https://docs.tenderly.co/web3-actions/intro-to-web3-actions) for running a subscription redeemer which can be configured to run every N blocks.

#### Project Structure

The project has a unique structure where the `actions` directory is a separate Node.js project with its own package management and linting configuration.

#### Commands

```bash
# Build Tenderly actions
tenderly actions build

# Deploy Tenderly actions
tenderly actions deploy
```
