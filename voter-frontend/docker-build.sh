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
mode=production
echo "The mode is: $mode"

###########################################
# Config
# - the config file with all IPs and ports
###########################################
globalConfig=$parentDir/system.json
githubConfig=$parentDir/github.json

# check if the github config json exists -> if not we stop the process
if [ ! -f "$githubConfig" ]; then
    echo "$githubConfig doesn't exist! Please create it!"
    exit
fi

###########################################
# ENV variables
###########################################
# - Specify NODE_ENV
NODE_ENV=$mode
# - Specify the Github credentials
GITHUB_TOKEN=$(cat $githubConfig | jq .github.token | tr -d \")
GITHUB_EMAIL=$(cat $githubConfig | jq .github.email | tr -d \")
GITHUB_USER=$(cat $githubConfig | jq .github.user | tr -d \")

###########################################
# write ENV variables into .env
###########################################
echo NODE_ENV=$NODE_ENV >> $dir/.env

####### FRONTEND

###########################################
# ENV variables
###########################################
ACCESS_PROVIDER_PORT=$(cat $globalConfig | jq .services.access_provider_backend.port)
ACCESS_PROVIDER_IP=$(cat $globalConfig | jq .services.access_provider_backend.ip.$mode | tr -d \")

IDENTITY_PROVIDER_PORT=$(cat $globalConfig | jq .services.identity_provider_backend.port)
IDENTITY_PROVIDER_IP=$(cat $globalConfig | jq .services.identity_provider_backend.ip.$mode | tr -d \")

###########################################
# write ENV variables into .env
###########################################
echo REACT_APP_ACCESS_PROVIDER_PORT=${ACCESS_PROVIDER_PORT} >> $dir/.env
echo REACT_APP_ACCESS_PROVIDER_IP=${ACCESS_PROVIDER_IP} >> $dir/.env
echo REACT_APP_IDENTITY_PROVIDER_PORT=${IDENTITY_PROVIDER_PORT} >> $dir/.env
echo REACT_APP_IDENTITY_PROVIDER_IP=${IDENTITY_PROVIDER_IP} >> $dir/.env

cd $dir

# start docker containers
DOCKER_BUILDKIT=1 docker build -t voter_frontend . --build-arg GITHUB_EMAIL=$GITHUB_EMAIL --build-arg GITHUB_TOKEN=$GITHUB_TOKEN --build-arg GITHUB_USER=$GITHUB_USER --build-arg AP_PORT=$REACT_APP_ACCESS_PROVIDER_PORT --build-arg AP_IP=$REACT_APP_ACCESS_PROVIDER_IP --build-arg IP_PORT=$REACT_APP_IDENTITY_PROVIDER_PORT --build-arg IP_IP=$REACT_APP_IDENTITY_PROVIDER_IP
docker-compose -f pre_built.yml up --detach --no-build

# remove all temp files
rm -f $dir/.env