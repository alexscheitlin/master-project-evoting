#!/bin/bash

########################################
# relative directories
########################################
readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly parentDir="$(dirname "$dir")"
readonly parentParentDir="$(dirname "$parentDir")"


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
globalConfig=$parentParentDir/system.json

###########################################
# Set Sealer Number
###########################################
sealerNr=$1

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

###########################################
# write ENV variables into .env
###########################################
echo REACT_APP_VOTING_AUTH_BACKEND_PORT=$VOTING_AUTH_BACKEND_PORT >> $dir/.env
echo REACT_APP_VOTING_AUTH_BACKEND_IP=$VOTING_AUTH_BACKEND_IP >> $dir/.env
echo REACT_APP_SEALER_BACKEND_PORT=$SEALER_BACKEND_PORT >> $dir/.env
echo REACT_APP_SEALER_BACKEND_IP=$SEALER_BACKEND_IP >> $dir/.env
echo REACT_APP_SEALER_FRONTEND_PORT=$SEALER_FRONTEND_PORT >> $dir/.env
echo REACT_APP_SEALER_FRONTEND_IP=$SEALER_FRONTEND_IP >> $dir/.env
echo PORT=$SEALER_FRONTEND_PORT >> $dir/.env

###########################################
# start frontend
###########################################
cd $dir
npm run start