#!/bin/bash

########################################
# relative directories
########################################
readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly parentDir="$(dirname "$dir")"


###########################################
# Cleanup
###########################################
rm -f $dir/.env

###########################################
# Mode
###########################################
mode=development
echo "The mode is: $mode"

###########################################
# Config
# - the config file with all IPs and ports
###########################################
globalConfig=$parentDir/system.json

###########################################
# ENV variables
###########################################
# - Access Provider Backend PORT (the port stays the same, in dev and prod mode) 
ACCESS_PROVIDER_BACKEND_PORT=$(cat $globalConfig | jq .services.access_provider_backend.port)
# - Access Provider Backend IP (either 172.1.1.XXX or localhost)
ACCESS_PROVIDER_BACKEND_IP=$(cat $globalConfig | jq .services.access_provider_backend.ip.$mode | tr -d \")
# - POA Blockchain Main RPC PORT (the port stays the same, in dev and prod mode)
PARITY_NODE_PORT=$(cat $globalConfig | jq .services.sealer_parity_1.port)
# - POA Blockchain Main RPC IP (either 172.1.1.XXX or localhost)
PARITY_NODE_IP=$(cat $globalConfig | jq .services.sealer_parity_1.ip.$mode | tr -d \")
# - Specify NODE_ENV
NODE_ENV=$mode

###########################################
# write ENV variables into .env
###########################################
echo ACCESS_PROVIDER_BACKEND_PORT=$ACCESS_PROVIDER_BACKEND_PORT >> $dir/.env
echo ACCESS_PROVIDER_BACKEND_IP=$ACCESS_PROVIDER_BACKEND_IP >> $dir/.env
echo PARITY_NODE_PORT=${PARITY_NODE_PORT} >> $dir/.env
echo PARITY_NODE_IP=${PARITY_NODE_IP} >> $dir/.env
echo NODE_ENV=${NODE_ENV} >> $dir/.env

###########################################
# installing packages
###########################################
echo "##########################################################################"
echo "# Installing NPM Packages for you                                         "
echo "##########################################################################"
echo
npm i

###########################################
# start dev server
###########################################
cd $dir
npm run serve:dev:clean