#!/bin/bash
readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly parentDir="$(dirname "$dir")"
readonly network_name="vote-auth"

# Voting Authority
# ---------------------
# Backend     port 4001
# Frontend    port 3001

# get crypto library into the mix
# build it and copy the dist folder into the backend
cryptoPath=$parentDir/crypto
cp -r $cryptoPath $dir/backend/mp-crypto

rm -rf $dir/backend/mp-crypto/node_modules
rm -rf $dir/backend/mp-crypto/dist

# create env file for backend where to find ports
mkdir $dir/backend/envs
echo BACKEND_PORT=4001 >> $dir/backend/envs/.env.development
echo FRONTEND_PORT=3001 >> $dir/backend/envs/.env.development

# create a production env file
cp $dir/backend/envs/.env.development $dir/backend/envs/.env.production

# add the NODE_ENV mode to the respective files
echo NODE_ENV=development >> $dir/backend/envs/.env.development
echo NODE_ENV=production >> $dir/backend/envs/.env.production

# create env file for docker-compose to find ports
echo BACKEND_PORT=4001 >> $dir/.env
echo FRONTEND_PORT=3001 >> $dir/.env

# internal IP's for BE <-> FE
echo BACKEND_IP=172.1.11.20 >> $dir/.env
echo FRONTEND_IP=172.1.11.10 >> $dir/.env

# external IP for VoteAuthBE <-> Sealer BEs
echo VOTE_AUTH_BACKEND_IP=172.1.10.5 >> $dir/.env

# check if parity-nodes docker network exists, otherwise create it
if [[ $(docker network ls | xargs | grep -q $network_name) == 0 ]]; then
    echo "network: $network_name exists!"
else
    echo "creating network: $network_name"
    docker network create $network_name \
    --driver=bridge \
    --subnet=172.1.10.0/24 \
    --gateway=172.1.10.1 \
    --opt com.docker.network.bridge.enable_icc=true \
    --opt com.docker.network.bridge.enable_ip_masquerade=true > /dev/null 2>&1
fi

# start docker containers
docker-compose -p vote-auth -f docker-compose.yml up --build --detach

# remove all temp files
rm -rf $dir/backend/envs
rm -rf $dir/backend/mp-crypto
rm -f $dir/.env