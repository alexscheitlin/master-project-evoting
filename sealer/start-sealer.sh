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
# Cleanup
###########################################
rm -f $dir/.env

###########################################
# Unlink mp-crypto as we don't want the 
# symbolic link inside the container
# the build will fail otherwise
###########################################
npm unlink --no-save mp-crypto
rm -rf $dir/backend/node_modules

###########################################
# Set Sealer Number
###########################################
sealerNr=$1

########################################
# mp-crypto library
#######################################
cryptoPath=$parentDir/crypto
cp -r $cryptoPath $dir/backend/mp-crypto
rm -rf $dir/backend/mp-crypto/node_modules
rm -rf $dir/backend/mp-crypto/dist

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

###########################################
# docker network
# - make sure the network exists
# - the script will create it if it does not
###########################################
network_name=$(cat $globalConfig | jq .network.name)
$parentDir/docker-network.sh $network_name

# go into correct directory to start docker compose with the .env file
cd $dir

# start docker containers
docker-compose -p controller_$sealerNr -f docker-compose.yml up --build --detach

# remove all temp files
rm -f $dir/backend/wallet/sealer.json
rm -f $dir/backend/wallet/sealer.pwd
rm -rf $dir/backend/mp-crypto
rm -f $dir/.env
