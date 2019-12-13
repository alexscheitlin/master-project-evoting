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
rm -rf mp-crypto # only needed locally if started with docker

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
# - POA Blockchain Main RPC PORT (the port stays the same, in dev and prod mode)
PARITY_NODE_PORT=$(cat $globalConfig | jq .services.sealer_parity_1.port)
# - POA Blockchain Main RPC IP (either 172.1.1.XXX or localhost)
PARITY_NODE_IP=$(cat $globalConfig | jq .services.sealer_parity_1.ip.$mode | tr -d \")
# - Specify NODE_ENV
NODE_ENV=$mode

###########################################
# write ENV variables into .env
###########################################
echo VOTING_AUTH_BACKEND_PORT=${VOTING_AUTH_BACKEND_PORT} >> $dir/.env
echo VOTING_AUTH_BACKEND_IP=${VOTING_AUTH_BACKEND_IP} >> $dir/.env
echo VOTING_AUTH_FRONTEND_PORT=${VOTING_AUTH_FRONTEND_PORT} >> $dir/.env
echo VOTING_AUTH_FRONTEND_IP=${VOTING_AUTH_FRONTEND_IP} >> $dir/.env
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
# making sure mp-crypto is linked
###########################################
echo "##########################################################################"
echo "# Linking mp-crypto, running the commands below                           "
echo "##########################################################################"
echo "# > cd $parentParentDir/crypto                                             "
echo "# > sudo npm link                                                          "
echo "# > cd $dir                                                                "
echo "# > npm link mp-crypto                                                     "
echo "##########################################################################"
echo
cd $parentParentDir/crypto
sudo npm link
cd $dir
npm link mp-crypto

###########################################
# start dev server
###########################################
cd $dir
npm run serve:dev:clean