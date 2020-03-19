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

###########################################
# Config
# - the config file with all IPs and ports
###########################################
globalConfig=$parentDir/system.json

###########################################
# Cleanup
###########################################
rm -f $dir/.env

###########################################
# ENV variables
###########################################
# - Identity Provider Backend PORT (the port stays the same, in dev and prod mode) 
IDENTITY_PROVIDER_BACKEND_PORT=$(cat $globalConfig | jq .services.identity_provider_backend.port)
# - Identity Provider Backend IP (either 172.1.1.XXX or localhost)
IDENTITY_PROVIDER_BACKEND_IP=$(cat $globalConfig | jq .services.identity_provider_backend.ip.$mode | tr -d \")
# - Access Provider Backend PORT (the port stays the same, in dev and prod mode) 
ACCESS_PROVIDER_BACKEND_PORT=$(cat $globalConfig | jq .services.access_provider_backend.port)
# - Access Provider Backend IP (either 172.1.1.XXX or localhost)
ACCESS_PROVIDER_BACKEND_IP=$(cat $globalConfig | jq .services.access_provider_backend.ip.$mode | tr -d \")
# - Specify NODE_ENV
NODE_ENV=$mode

###########################################
# write ENV variables into .env
###########################################
echo IDENTITY_PROVIDER_BACKEND_PORT=$IDENTITY_PROVIDER_BACKEND_PORT >> $dir/.env
echo IDENTITY_PROVIDER_BACKEND_IP=$IDENTITY_PROVIDER_BACKEND_IP >> $dir/.env
echo ACCESS_PROVIDER_BACKEND_PORT=$ACCESS_PROVIDER_BACKEND_PORT >> $dir/.env
echo ACCESS_PROVIDER_BACKEND_IP=$ACCESS_PROVIDER_BACKEND_IP >> $dir/.env
echo NODE_ENV=$NODE_ENV >> $dir/.env

###########################################
# docker network
# - make sure the network exists
# - the script will create it if it does not
###########################################
network_name=$(cat $globalConfig | jq .network.name | tr -d \")
$parentDir/docker-network.sh $network_name

###########################################
# start containers
###########################################
cd $dir

if [[ $1 == 1 ]]; then
    # build containers
    DOCKER_BUILDKIT=1 docker build -t identity_provider . --build-arg AP_PORT=$ACCESS_PROVIDER_BACKEND_PORT --build-arg AP_IP=$ACCESS_PROVIDER_BACKEND_IP --build-arg IP_IP=$IDENTITY_PROVIDER_BACKEND_IP --build-arg IP_PORT=$IDENTITY_PROVIDER_BACKEND_PORT 
    docker-compose -f pre_built.yml up --detach --no-build
else
    # don't build containers
    docker-compose -f pre_built.yml up --detach --no-build
fi

rm -f $dir/.env