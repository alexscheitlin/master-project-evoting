#!/bin/bash

./voting-authority/docker-start.sh
./access-provider-backend/docker-start.sh
./identity-provider-backend/docker-start.sh

# start and register 3 nodes
./poa-blockchain/scripts/dev-chain-sealers.sh
./ethstats/docker-start.sh

docker ps
