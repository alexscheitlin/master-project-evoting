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
githubConfig=$parentDir/github.json

# check if the github config json exists -> if not we stop the process
if [ ! -f "$githubConfig" ]; then
    echo "$githubConfig doesn't exist! Please create it!"
    exit
fi

###########################################
# Cleanup
###########################################
rm -f $dir/.env
rm -rf $dir/backend/node_modules

###########################################
# Set Sealer Number
###########################################
sealerNr=$1

########################################
# copy keys (key store file)
#######################################
cp $parentDir/poa-blockchain/keys/sealer$sealerNr.json $dir/backend/wallet/sealer.json
cp $parentDir/poa-blockchain/keys/sealer$sealerNr.pwd $dir/backend/wallet/sealer.pwd

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
echo VOTING_AUTH_BACKEND_PORT=$VOTING_AUTH_BACKEND_PORT >> $dir/.env
echo VOTING_AUTH_BACKEND_IP=$VOTING_AUTH_BACKEND_IP >> $dir/.env
echo SEALER_BACKEND_PORT=$SEALER_BACKEND_PORT >> $dir/.env
echo SEALER_BACKEND_IP=$SEALER_BACKEND_IP >> $dir/.env
echo SEALER_FRONTEND_PORT=$SEALER_FRONTEND_PORT >> $dir/.env
echo SEALER_FRONTEND_IP=$SEALER_FRONTEND_IP >> $dir/.env
echo PARITY_NODE_PORT=$PARITY_NODE_PORT >> $dir/.env
echo PARITY_NODE_IP=$PARITY_NODE_IP >> $dir/.env
echo NODE_ENV=$NODE_ENV >> $dir/.env
echo GITHUB_TOKEN=$GITHUB_TOKEN >> $dir/.env
echo GITHUB_USER=$GITHUB_USER >> $dir/.env
echo GITHUB_EMAIL=$GITHUB_EMAIL >> $dir/.env

###########################################
# docker network
# - make sure the network exists
# - the script will create it if it does not
###########################################
network_name=$(cat $globalConfig | jq .network.name | tr -d \")
$parentDir/docker-network.sh $network_name

# go into correct directory to start docker compose with the .env file
cd $dir

# start docker containers
if [[ $2 == 1 ]]; then
    # build containers
    docker-compose -p controller_$sealerNr -f docker-compose.yml up --build --detach
else
    # don't build containers
    docker-compose -p controller_$sealerNr -f docker-compose.yml up --detach
fi

# remove all temp files
rm -f $dir/backend/wallet/sealer.json
rm -f $dir/backend/wallet/sealer.pwd
rm -f $dir/.env
