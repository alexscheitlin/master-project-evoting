# Voter Frontend

This is the contact point of the voter with the e-voting system. In general, the voter has to go through the following steps:

1. Login with the **Identity Provider** to get a `accessToken`
   - here we assume that the voter has some kind of _e-identity_
2. Create a Ethereum account and send this `wallet` and the `accessToken` to the **Access Provider**. The Access Provider will then fund this address with some Ether.
3. Receive the location of the deployed Ballot contract `ballotAddress` from the Access Provider.
4. Cast the vote

## Ho to run

**Mode=Development (`localhost`)**

In development mode, the frontend will run on `localhost` for a better DX.

```bash
npm run start:localhost

# frontend will run on localhost:3000
```
