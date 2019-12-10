#!/bin/bash

# dev setup

sealerNr=1

rm .env

# copy keys
cp ../../poa-blockchain/keys/sealer$sealerNr.json ./wallet/sealer.json
cp ../../poa-blockchain/keys/sealer$sealerNr.pwd ./wallet/sealer.pwd

# create env file for backend where to find chain etc.
echo NODE_ENV=development >> .env
echo SEALER_NODE_PORT=701$sealerNr >>  .env
echo BACKEND_PORT=401$sealerNr >>  .env
echo FRONTEND_PORT=301$sealerNr >>  .env

# start docker containers
npm run serve:dev