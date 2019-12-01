# Voter Frontend & Solidity Testing

## Set Up

### link mp-crypto first

```bash
cd crypto
npm run build
npm link
cd ../voter-frontend
npm link mp-crypto
```

### What to do when I update /crypto

run `npm run build` inside `/crypto`

restart `/voter-frontend` with `npm run start`

## How to run Voter Frontend

1. run `npm install`
2. run `npm run start`

## What else should be running

- a ganache chain (go to `/contracts` for more information)
- authority backend must be running

## TODO: update with new project structure details
