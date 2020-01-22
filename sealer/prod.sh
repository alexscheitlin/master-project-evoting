#!/bin/bash

########################################
# relative directories
########################################
readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly parentDir="$(dirname "$dir")"
readonly backendDir=$(cd "$dir/backend" && pwd)
readonly frontendDir=$(cd "$dir/frontend" && pwd)

###########################################
# Cleanup
###########################################
rm -f $dir/.env
rm -f $backendDir/wallet/sealer*

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
# Set Sealer Number
###########################################
sealerNr=$1

####### BACKEND

########################################
# copy keys (key store file)
#######################################
cp $parentDir/poa-blockchain/keys/sealer$sealerNr.json $backendDir/wallet/sealer.json
cp $parentDir/poa-blockchain/keys/sealer$sealerNr.pwd $backendDir/wallet/sealer.pwd

###########################################
# ENV variables
###########################################
# - Voting Authority Backend PORT (the port stays the same, in dev and prod mode) 
VOTING_AUTH_BACKEND_PORT=$(cat $globalConfig | jq .services.voting_authority_backend.port)
# - Voting Authority Backend IP (either 172.1.1.XXX or localhost)
VOTING_AUTH_BACKEND_IP=$(cat $globalConfig | jq .services.voting_authority_backend.ip.$mode | tr -d \")
# - Sealer Backend Port (the port stays the same, in dev and prod mode)
SEALER_BACKEND_PORT=$(cat $globalConfig | jq .services.sealer_backend_$sealerNr.port)
# - Sealer Backend IP (either 172.1.1.XXX or localhost)
SEALER_BACKEND_IP=$(cat $globalConfig | jq .services.sealer_backend_$sealerNr.ip.$mode | tr -d \")
# - Sealer Frontend Port (the port stays the same, in dev and prod mode) 
SEALER_FRONTEND_PORT=$(cat $globalConfig | jq .services.sealer_frontend_$sealerNr.port)
# - Sealer Frontend IP (either 172.1.1.XXX or localhost)
SEALER_FRONTEND_IP=$(cat $globalConfig | jq .services.sealer_frontend_$sealerNr.ip.$mode | tr -d \")
# - POA Blockchain Main RPC PORT (the port stays the same, in dev and prod mode)
PARITY_NODE_PORT=$(cat $globalConfig | jq .services.sealer_parity_$sealerNr.port)
# - POA Blockchain Main RPC IP (either 172.1.1.XXX or localhost)
PARITY_NODE_IP=$(cat $globalConfig | jq .services.sealer_parity_$sealerNr.ip.$mode | tr -d \")
# - Specify NODE_ENV
NODE_ENV=$mode
# - Specify the Github credentials
GITHUB_TOKEN=$(cat $githubConfig | jq .github.token | tr -d \")
GITHUB_EMAIL=$(cat $githubConfig | jq .github.email | tr -d \")
GITHUB_USER=$(cat $githubConfig | jq .github.user | tr -d \")

###########################################
# write ENV variables into .env
###########################################
echo VOTING_AUTH_BACKEND_PORT=${VOTING_AUTH_BACKEND_PORT} >> $dir/.env
echo VOTING_AUTH_BACKEND_IP=${VOTING_AUTH_BACKEND_IP} >> $dir/.env
echo SEALER_BACKEND_PORT=${SEALER_BACKEND_PORT} >> $dir/.env
echo SEALER_BACKEND_IP=${SEALER_BACKEND_IP} >> $dir/.env
echo SEALER_FRONTEND_PORT=${SEALER_FRONTEND_PORT} >> $dir/.env
echo SEALER_FRONTEND_IP=${SEALER_FRONTEND_IP} >> $dir/.env
echo PARITY_NODE_PORT=${PARITY_NODE_PORT} >> $dir/.env
echo PARITY_NODE_IP=${PARITY_NODE_IP} >> $dir/.env
echo NODE_ENV=${NODE_ENV} >> $dir/.env
echo GITHUB_TOKEN=$GITHUB_TOKEN >> $dir/.env
echo GITHUB_USER=$GITHUB_USER >> $dir/.env
echo GITHUB_EMAIL=$GITHUB_EMAIL >> $dir/.env

####### FRONTEND

###########################################
# write ENV variables into .env
###########################################
echo REACT_APP_VOTING_AUTH_BACKEND_PORT=${VOTING_AUTH_BACKEND_PORT} >> $dir/.env
echo REACT_APP_VOTING_AUTH_BACKEND_IP=${VOTING_AUTH_BACKEND_IP} >> $dir/.env
echo REACT_APP_SEALER_FRONTEND_PORT=${SEALER_FRONTEND_PORT} >> $dir/.env
echo REACT_APP_SEALER_FRONTEND_IP=${SEALER_FRONTEND_IP} >> $dir/.env
echo REACT_APP_SEALER_BACKEND_PORT=${SEALER_BACKEND_PORT} >> $dir/.env
echo REACT_APP_SEALER_BACKEND_IP=${SEALER_BACKEND_IP} >> $dir/.env
echo PORT=${SEALER_FRONTEND_PORT} >> $dir/.env

###########################################
# docker network
# - make sure the network exists
# - the script will create it if it does not
###########################################
network_name=$(cat $globalConfig | jq .network.name | tr -d \")
$parentDir/docker-network.sh $network_name

# make sure the database is clean
cd $dir/backend && npm run clean
cd $dir

# start docker containers
docker-compose -p controller_$sealerNr -f production.yml build --build-arg GITHUB_EMAIL=$GITHUB_EMAIL --build-arg GITHUB_TOKEN=$GITHUB_TOKEN --build-arg GITHUB_USER=$GITHUB_USER \
--build-arg SB_PORT=$SEALER_BACKEND_PORT --build-arg SB_IP=$SEALER_BACKEND_IP --build-arg SF_PORT=$SEALER_FRONTEND_PORT --build-arg SF_IP=$SEALER_FRONTEND_IP \
--build-arg PARITY_PORT=$PARITY_NODE_PORT --build-arg PARITY_IP=$PARITY_NODE_IP --build-arg VA_PORT=$VOTING_AUTH_BACKEND_PORT --build-arg VA_IP=$VOTING_AUTH_BACKEND_IP 
docker-compose -p controller_$sealerNr -f production.yml up --detach --no-build

# remove all temp files
rm -f $backendDir/wallet/sealer.json
rm -f $backendDir/wallet/sealer.pwd
rm -f $dir/.env