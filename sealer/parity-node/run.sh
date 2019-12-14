#!/bin/bash

readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly parentDir="$(dirname "$dir")"
readonly parentParentDir="$(dirname "$parentDir")"

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

###########################################
# Mode
###########################################
mode=production
echo "The mode is: $mode"

###########################################
# Config
# - the config file with all IPs and ports
###########################################
globalConfig=$parentParentDir/system.json

###########################################
# Cleanup
###########################################
rm -f $dir/.env

###########################################
# Set Sealer Number
###########################################
sealerNr=$1

########################################
# copy keys (key store files)
#######################################
cp $parentParentDir/poa-blockchain/keys/sealer$sealerNr.json $dir/keys/sealer$sealerNr.json
cp $parentParentDir/poa-blockchain/keys/sealer$sealerNr.pwd $dir/keys/sealer$sealerNr.pwd

########################################
# get chainspec from sealer backend
#######################################
cp $parentDir/backend/src/chainspec/chain.json $dir/config

###########################################
# ENV variables
###########################################
nodeJSON=$(cat $globalConfig | jq .services.sealer_parity_$sealerNr)

# - POA Blockchain Main RPC PORT (the port stays the same, in dev and prod mode)
PARITY_NODE_PORT=$(echo $nodeJSON | jq .port)
# - POA Blockchain Main RPC IP (either 172.1.1.XXX or localhost)
PARITY_NODE_IP=$(echo $nodeJSON | jq .ip.$mode | tr -d \")
PORT=$(echo $nodeJSON | jq .node_port) 
WS_PORT=$(echo $nodeJSON | jq .ws_port)
SIGNER_ADDRESS=0x$(cat $dir/keys/sealer$sealerNr.json | jq --raw-output .address)

###########################################
# write ENV variables into .env
###########################################
echo ID=$sealerNr >> $dir/.env
echo NETWORK_NAME=VotingPoA >> $dir/.env
echo RPC_PORT=$PARITY_NODE_PORT >> $dir/.env
echo SIGNER_ADDRESS=$SIGNER_ADDRESS  >> $dir/.env
echo PARITY_NODE_IP=$PARITY_NODE_IP >> $dir/.env
echo PORT=$PORT >> $dir/.env
echo WS_PORT=$WS_PORT >> $dir/.env

# go into correct dir to use docker-compose with the .env in this directory
cd $dir

###########################################
# docker network
# - make sure the network exists
# - the script will create it if it does not
###########################################
network_name=$(cat $globalConfig | jq .network.name | tr -d \")
$parentParentDir/docker-network.sh $network_name

# start docker compose for parity-node
docker-compose -p sealer$sealerNr up  --detach