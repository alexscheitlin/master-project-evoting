#!/bin/bash

sealerNr=$1
PORT=701$sealerNr

# copy keys
cp ../keys/sealer$sealerNr.json ../../sealer/node/sealer.json
cp ../keys/sealer$sealerNr.pwd ../../sealer/node/sealer.pwd
cp ../keys/sealer$sealerNr.network.key ../../sealer/node/sealer.network.key

# create .env
touch .env
echo PARITY_VERSION=stable  >> .env
echo NETWORK_NAME=Parity_PoA  >> .env
echo SIGNER_ADDRESS=0x$(cat ../keys/sealer$sealerNr.json | jq --raw-output .address)  >> .env
echo RPC_PORT=$PORT >> .env
echo ID=$sealerNr >> .env

# copy chainspec
# cp ../chainspec/chain$sealerNr.json ../../sealer/node/chain.json

# TODO: make this dynamic, such that it works in both modes
cp ../chainspec/chain.dev.json ../../sealer/node/chain.json

# boot the node with the given config
docker-compose -p sealer$sealerNr -f ../../sealer/docker-compose.sealer.yml up --build --detach

# delete keys, chainspec and .env
rm .env
rm ../../sealer/node/sealer.json
rm ../../sealer/node/sealer.pwd
rm ../../sealer/node/chain.json
rm ../../sealer/node/sealer.network.key