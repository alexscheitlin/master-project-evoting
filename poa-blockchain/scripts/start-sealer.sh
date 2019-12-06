#!/bin/bash

sealerNr=$1

# copy keys
cp ../keys/sealer$sealerNr.json ../../sealer/backend/src/wallet/sealer.json
cp ../keys/sealer$sealerNr.pwd ../../sealer/backend/src/wallet/sealer.pwd

# create env variables for docker-compose with the proper configs
echo BACKEND_PORT=401$sealerNr >> .env
echo FRONTEND_PORT=301$sealerNr >> .env

# create env file for backend where to find chain etc.
echo NODE_ENV=development >> ../../sealer/backend/.env
echo CHAIN_URL=http://localhost:701$sealerNr >>  ../../sealer/backend/.env
echo BACKEND_PORT=401$sealerNr >>  ../../sealer/backend/.env
echo FRONTEND_PORT=301$sealerNr >>  ../../sealer/backend/.env

# start docker containers
docker-compose -p controller_$sealerNr -f ../../sealer/docker-compose.yml up --build --detach

# remove all temp files
rm -rf ../../sealer/backend/src/wallet/sealer.json
rm -rf ../../sealer/backend/src/wallet/sealer.pwd
rm -rf ../../sealer/backend/.env
rm -rf .env