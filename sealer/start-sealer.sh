#!/bin/bash

readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly parentDir="$(dirname "$dir")"
readonly parentParentDir="$(dirname "$parentDir")"

# Starts a sealer
# Specify the number of the sealer

# Sealer 0
# ---------------------
# Backend     port 4010
# Frontend    port 3010
# Parity-node port 7010* 

# Sealer 1
# ---------------------
# Backend     port 4011
# Frontend    port 3011
# Parity-node port 7011* 

# Sealer 2
# ---------------------
# Backend     port 4012
# Frontend    port 3012
# Parity-node port 7012*

# * (the actual node needs to be started separately via CLI during registration)

sealerNr=$1

# copy keys
cp $parentDir/poa-blockchain/keys/sealer$sealerNr.json $dir/backend/wallet/sealer.json
cp $parentDir/poa-blockchain/keys/sealer$sealerNr.pwd $dir/backend/wallet/sealer.pwd

# create env file for backend where to find chain etc.
echo NODE_ENV=development >> $dir/backend/.env
echo SEALER_NODE_PORT=701$sealerNr >> $dir/backend/.env
echo BACKEND_PORT=401$sealerNr >> $dir/backend/.env
echo FRONTEND_PORT=301$sealerNr >> $dir/backend/.env

#
echo BACKEND_PORT=401$sealerNr >> $dir/.env
echo FRONTEND_PORT=301$sealerNr >> $dir/.env

# go into correct directory to start docker compose with the .env file
cd $dir

# start docker containers
docker-compose -p controller_$sealerNr -f docker-compose.yml up --build --detach

# remove all temp files
rm -rf $dir/backend/wallet/sealer.json
rm -rf $dir/backend/wallet/sealer.pwd
rm -rf $dir/backend/.env
rm -rf $dir/.env