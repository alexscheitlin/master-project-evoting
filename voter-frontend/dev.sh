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
globalConfig=$parentDir/system.json

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
npm run start