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
# ENV variables
###########################################
# - Voting Authority Backend PORT (the port stays the same, in dev and prod mode) 
VOTING_AUTH_BACKEND_PORT=$(cat $globalConfig | jq .services.voting_authority_backend.port)
# - Voting Authority Backend IP (either 172.1.1.XXX or localhost)
VOTING_AUTH_BACKEND_IP=$(cat $globalConfig | jq .services.voting_authority_backend.ip.$mode | tr -d \")
# - Voting Authority Frontend PORT (the port stays the same, in dev and prod mode)
VOTING_AUTH_FRONTEND_PORT=$(cat $globalConfig | jq .services.voting_authority_frontend.port)
# - Voting Authority Frontend IP (either 172.1.1.XXX or localhost)
VOTING_AUTH_FRONTEND_IP=$(cat $globalConfig | jq .services.voting_authority_frontend.ip.$mode | tr -d \")

###########################################
# write ENV variables into .env
###########################################
echo REACT_APP_AUTH_FRONTEND_IP=${VOTING_AUTH_FRONTEND_IP} >> $dir/.env
echo REACT_APP_AUTH_PORT=${VOTING_AUTH_FRONTEND_PORT} >> $dir/.env
echo REACT_APP_AUTH_BACKEND_IP=${VOTING_AUTH_BACKEND_IP} >> $dir/.env
echo REACT_APP_AUTH_BACKEND_PORT=${VOTING_AUTH_BACKEND_PORT} >> $dir/.env
echo PORT=${VOTING_AUTH_FRONTEND_PORT} >> $dir/.env

###########################################
# start frontend
###########################################
cd $dir
npm run start