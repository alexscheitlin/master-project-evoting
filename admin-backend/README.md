# Admin Backend (Used by the Swiss Government to create electronic votings)

## Prerequisites

- NodeJS 13+

### Server Certificate

For the server to run in a realisitc setup (i.e. using HTTPS and TLS) a certificate is required.
Generate the certificate using:

```
0. Select what elliptic curve to use
openssl ecparam -list_curves

1. Generate the necessary public/private key pair (elliptic-curve)
openssl ecparam -name {name_of_the_curve} -genkey -out key.pem

2. Create a new certificate
openssl req -x509 -new -key key.pem -out cert.pem -days 365 -nodes -SHA384
```

Place the certificate and key in the folder: `./keys/cert` and add the passphrase to the `.env.production` file.

### Installation

Run `npm install` to install all required dependencies.

## Environment Variables

Create the following files in the folder `/envs`:

- `.env.production`
- `.env.development`

Add `PORT=3000` to both. The production file additionally requires: `passphrase` (the passphrase to the certificate created beforehand).

## Development

Run `npm run serve` to start the server. Pass the `NODE_ENV` variable with options:

- `NODE_ENV=production` to run the server in HTTPS mode or
- `NODE_ENV=development` to run a basic HTTP server.

Access the server via `https://localhost:3000` or via `localhost:3000`.

## Testing

Run `npm run test` to run all test of the project or `npm run test:watch` to continuously re-run the tests while developing.

## Compile and Deploy Contracts

`npm run contracts` will compile and then deploy the contract on a blockchain running on `http://localhost:8545`, so make sure that you do `cd ../voter-frontend && npm run ganache:dev` first
