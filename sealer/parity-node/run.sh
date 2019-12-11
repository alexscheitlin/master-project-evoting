#!/bin/bash

readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly parentDir="$(dirname "$dir")"
readonly parentParentDir="$(dirname "$parentDir")"
readonly network_name="parity-nodes"

# check a number is provided to start a specific sealer
if [ -z "$1" ]; then
    echo 'Please specify with a number which sealer you would like to boot'
    echo '[1, 2, 3]'
    echo
    echo 'If you want to start a chain with multiple sealers, please consider using the scripts in project "poa-blockchain"'

    exit
fi

# check if the provided sealer exists
if [[ $1 != 1 && $1 != 2 && $1 != 3 ]]; then
    echo 'Sealer' $1 'does not exist'
    exit
fi

echo 'Removing old files for you...'
# delete old .env file
rm -f $dir/.env

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
echo IP=172.1.1.1$node >> $dir/.env
echo SIGNER_ADDRESS=0x$(cat $dir/keys/sealer$node.json | jq --raw-output .address)  >> $dir/.env

# go into correct dir to use docker-compose with the .env in this directory
cd $dir

# check if parity-nodes docker network exists, otherwise create it
if [[ $(docker network ls | xargs | grep -q $network_name) == 0 ]]; then
    echo "network: $network_name exists!"
else
    echo "creating network: $network_name"
    docker network create $network_name \
    --driver=bridge \
    --subnet=172.1.1.0/24 \
    --gateway=172.1.1.1 > /dev/null 2>&1
fi

# start docker compose for parity-node
docker-compose -p sealer$node up --build --detach