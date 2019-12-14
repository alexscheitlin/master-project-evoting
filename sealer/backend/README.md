# Sealer Backend

The Sealer node consists of a minimal Backend, Frontend and a full Parity-Node, with which it will seal blocks on the PoA Blockchain and send cryptographic material to the `Ballot` for **Distributed Key Generation**.

## How to run

In development mode, the backend will run on `localhost` for a better DX.

```bash
npm run serve:localhost

# backend will run on localhost:4011
```

**Mode=Production (`docker`)**

Please see instructions in root folder on how to run the dockerized version. This will always also include the frontend.
