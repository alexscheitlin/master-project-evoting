#!/bin/bash

########################################
# relative directories
########################################
readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly parentDir="$(dirname "$dir")"

###########################################
# Mode
###########################################
mode=production
echo "The mode is: $mode"

###########################################
# Config
# - the config file with all IPs and ports
###########################################
globalConfig=$parentDir/system.json

###########################################
# ENV variables
###########################################

ETHSTATS_PORT=$(cat $globalConfig | jq .services.ethstats.port)
# - POA Blockchain Main RPC PORT (the port stays the same, in dev and prod mode)
PARITY_NODE_PORT=$(cat $globalConfig | jq .services.sealer_parity_1.port | tr -d \")

###########################################
# write ENV variables into .env
###########################################
echo ETHSTATS_PORT=$ETHSTATS_PORT >> $dir/.env
echo PARITY_NODE_PORT=$PARITY_NODE_PORT >> $dir/.env

# ###########################################
# # start container
# ###########################################
cd $dir

if [[ $1 == 1 ]]; then
    # build containers
    docker-compose -p eth-stats -f docker-compose.yml up --build --detach
else
    # don't build containers
    docker-compose -p eth-stats -f docker-compose.yml up --detach
fi

rm -f $dir/.env