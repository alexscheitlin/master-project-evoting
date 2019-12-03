# Voter Frontend & Solidity Testing

## Set Up

The `Ballot.json` inside `src/contract-abis` is the same that exists in the authority frontend. Basically the `.sol` files are compiled in `contracts` and then copied into `voting-authority-backend/solidity/toDeploy` and `voter-frontend/src/contract-abis`

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
2. run `npm run start` **runs on PORT 3000**

## What else should be running

- a ganache chain (go to `/contracts` for more information)
- authority backend
- access provider backend
- identity provider backend

**See `README`** in root project folder.
