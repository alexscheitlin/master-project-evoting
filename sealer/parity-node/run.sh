#!/bin/bash

readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly parentDir="$(dirname "$dir")"
readonly parentParentDir="$(dirname "$parentDir")"

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
rm -rf $dir/.env

node=$1

# get keys
cp $parentParentDir/poa-blockchain/keys/sealer$node.json $dir/keys/sealer$node.json
cp $parentParentDir/poa-blockchain/keys/sealer$node.pwd $dir/keys/sealer$node.pwd

# get chainspec from backend
cp $parentDir/backend/src/chainspec/chain.json $dir/config

# create env variable for docker-compose
echo ID=$node >> $dir/.env
echo NETWORK_NAME=VotingPoA >> $dir/.env
echo PORT=3030$node >> $dir/.env
echo WS_PORT=501$node >> $dir/.env
echo RPC_PORT=701$node >> $dir/.env
echo SIGNER_ADDRESS=0x$(cat $dir/keys/sealer$node.json | jq --raw-output .address)  >> $dir/.env

# go into correct dir to use docker-compose with the .env in this directory
cd $dir

# start docker compose
docker-compose -p sealer$node up --build --detach