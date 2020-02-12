# Voter Frontend

This is the contact point of the voter with the e-voting system. In general, the voter has to go through the following steps:

1. Login with the **Identity Provider** to get a `accessToken`
   - here we assume that the voter has some kind of _e-identity_
2. Create an Ethereum account.
3. Send the `wallet` and the `accessToken` to the **Access Provider**. The Access Provider will then fund the wallet with some Ether.
4. Receive the location of the deployed Ballot contract `ballotAddress` from the Access Provider.
5. Cast the vote

## How to run

**Mode=Development (`localhost`)**

The voter frontend will always run on `localhost`.

```bash
npm run start:localhost

# frontend will run on localhost:3000
```

**Mode=Production (`production`)**

The voter frontend can also be served statically. To do this, the npm package **serve** needs to be installed.

```
npm run build
npm i -g serve
serve -s build
```
