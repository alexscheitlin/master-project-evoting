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
internal=10

# get crypto library into the mix

# copy mp-crypto into the backend project
cryptoPath=$parentDir/crypto
cp -r $cryptoPath $dir/backend/mp-crypto

# make sure we don't copy over node_modules and the dist
# folder into the docker containers
# we will install the dependencies inside the container
rm -rf $dir/backend/mp-crypto/node_modules
rm -rf $dir/backend/mp-crypto/dist

# copy keys
cp $parentDir/poa-blockchain/keys/sealer$sealerNr.json $dir/backend/wallet/sealer.json
cp $parentDir/poa-blockchain/keys/sealer$sealerNr.pwd $dir/backend/wallet/sealer.pwd

# ports
echo SEALER_BE_PORT=401$sealerNr >> $dir/.env
echo FRONTEND_PORT=301$sealerNr >> $dir/.env

# internal IP's for BE <-> FE
echo SEALER_BE_IP=172.1.$internal$sealerNr.20 >> $dir/.env
echo FRONTEND_IP=172.1.$internal$sealerNr.10 >> $dir/.env
echo INTERNAL_IP_RANGE=172.1.$internal$sealerNr.0/24 >> $dir/.env

# ip and port of Vote Authority Backend (vote-auth network)
echo VOTING_AUTH_BE_IP=172.1.10.5 >> $dir/.env
echo VOTING_AUTH_BE_PORT=4001 >> $dir/.env

# ip of Sealer Backend in vot-auth network
echo VOTE_AUTH_NETWORK_IP=172.1.10.$sealerNr$internal >> $dir/.env

# ip of Sealer's Parity Node (parity-node network)
echo PARITY_NODE_IP=172.1.1.1$sealerNr >> $dir/.env

# ip of Sealer Backend in parity-node network
echo PARITY_NETWORK_IP=172.1.1.10$sealerNr >> $dir/.env

# copy file to backend
cp $dir/.env $dir/backend/.env

# create env file for backend where to find chain etc.
echo NODE_ENV=development >> $dir/backend/.env
echo SEALER_NODE_PORT=701$sealerNr >> $dir/backend/.env

# go into correct directory to start docker compose with the .env file
cd $dir

# start docker containers
docker-compose -p controller_$sealerNr -f docker-compose.yml up --build --detach

# remove all temp files
rm -f $dir/backend/wallet/sealer.json
rm -f $dir/backend/wallet/sealer.pwd
rm -f $dir/backend/.env
rm -rf $dir/backend/mp-crypto
rm -f $dir/.env
