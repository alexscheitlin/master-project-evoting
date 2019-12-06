#!/bin/bash

# delete old .env file
rm -rf .env

# This script can start one parity node in a PoA setting. 
node=$1
node2=$2

# get keys
cp ../../poa-blockchain/keys/sealer$node.json ./keys/sealer$node.json
cp ../../poa-blockchain/keys/sealer$node.pwd ./keys/sealer$node.pwd

cp ../../poa-blockchain/keys/sealer$node2.json ./keys/sealer$node2.json
cp ../../poa-blockchain/keys/sealer$node2.pwd ./keys/sealer$node2.pwd

# get chainspec from backend
cp ../backend/src/chainspec/chain.json ./config

# create env variable for docker-compose 0
echo ID=$node >> .env
echo NETWORK_NAME=Parity_PoA >> .env
echo PORT=3030$node >> .env
echo WS_PORT=501$node >> .env
echo RPC_PORT=701$node >> .env
echo SIGNER_ADDRESS=0x$(cat ./keys/sealer$node.json | jq --raw-output .address)  >> .env

# create env variable for docker-compose 0
echo ID2=$node2 >> .env
echo NETWORK_NAME=Parity_PoA >> .env
echo PORT2=3030$node2 >> .env
echo WS_PORT2=501$node2 >> .env
echo RPC_PORT2=701$node2 >> .env
echo SIGNER_ADDRESS2=0x$(cat ./keys/sealer$node2.json | jq --raw-output .address)  >> .env

# start docker compose
# docker-compose -p sealer$node up --build

# peer discovery