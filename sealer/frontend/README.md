# Sealer Frontend

The Sealer node consists of a minimal Backend, Frontend and a full Parity-Node, with which it will seal blocks on the PoA Blockchain and send cryptographic material to the `Ballot` for **Distributed Key Generation**.

## How to run

In development mode, the frontend will run on `localhost` for a better DX.

```bash
npm run start:localhost

# frontend will run on localhost:3011
```

**Mode=Production (`docker`)**

Please see instructions in root folder on how to run the dockerized version. This will always also include the backend.
