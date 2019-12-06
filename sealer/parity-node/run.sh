#!/bin/bash

# delete old .env file
rm -rf .env

node=$1

# get keys
cp ../../poa-blockchain/keys/sealer$node.json ./keys/sealer$node.json
cp ../../poa-blockchain/keys/sealer$node.pwd ./keys/sealer$node.pwd

# get chainspec from backend
cp ../backend/src/chainspec/chain.json ./config

# create env variable for docker-compose 0
echo ID=$node >> .env
echo NETWORK_NAME=Parity_PoA >> .env
echo PORT=3030$node >> .env
echo WS_PORT=501$node >> .env
echo RPC_PORT=701$node >> .env
echo SIGNER_ADDRESS=0x$(cat ./keys/sealer$node.json | jq --raw-output .address)  >> .env

# start docker compose
docker-compose -p sealer$node up --build --detach