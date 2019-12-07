#!/bin/bash

# check a number is provided to start a specific sealer
if [ -z "$1" ]; then
    echo 'Please specify with a number which sealer you would like to boot'
    echo '[0, 1, 2]'
    echo
    echo 'If you want to start a chain with multiple sealers, please consider using the scripts in project "poa-blockchain"'

    exit
fi

# check if the provided sealer exists
if [[ $1 != 0 && $1 != 1 && $1 != 2 ]]; then
    echo 'Sealer' $1 'does not exist'
    exit
fi

echo 'Removing old files for you...'
# delete old .env file
rm -rf .env

node=$1

# get keys
cp ../../poa-blockchain/keys/sealer$node.json ./keys/sealer$node.json
cp ../../poa-blockchain/keys/sealer$node.pwd ./keys/sealer$node.pwd

# get chainspec from backend
cp ../backend/src/chainspec/chain.json ./config

# create env variable for docker-compose
echo ID=$node >> .env
echo NETWORK_NAME=Parity_PoA >> .env
echo PORT=3030$node >> .env
echo WS_PORT=501$node >> .env
echo RPC_PORT=701$node >> .env
echo SIGNER_ADDRESS=0x$(cat ./keys/sealer$node.json | jq --raw-output .address)  >> .env

# start docker compose
docker-compose -p sealer$node up --build --detach