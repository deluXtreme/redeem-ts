# Redeem TS

## Overview
This project contains [Tenderly actions](https://docs.tenderly.co/web3-actions/intro-to-web3-actions) for running a subscription redeemer.

## Project Structure

The project has a unique structure where the `actions` directory is a separate Node.js project with its own package management and linting configuration.

## Commands

### Primary Commands
```bash
# Build Tenderly actions
tenderly actions build

# Deploy Tenderly actions
tenderly actions deploy
```

### Linting
Since the `actions` directory is a separate Node.js project, linting is performed from within that directory:

```bash
cd actions
yarn fmt
```

## Development Notes
- The `actions` directory is a standalone Node.js project
- Linting commands must be run from within the `actions` directory
- Use `yarn fmt` for formatting code in the actions directory