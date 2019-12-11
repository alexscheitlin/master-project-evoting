#!/bin/bash
readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly network_name="vote-auth"

# Voting Authority
# ---------------------
# Backend     port 4001
# Frontend    port 3001

# create env file for backend where to find ports
echo NODE_ENV=development >> $dir/backend/envs/.env.development
echo BACKEND_PORT=4001 >> $dir/backend/envs/.env.development
echo FRONTEND_PORT=3001 >> $dir/backend/envs/.env.development

# create a production env file
cp $dir/backend/envs/.env.development $dir/backend/envs/.env.production

# create env file for docker-compose to find ports
echo BACKEND_PORT=4001 >> $dir/.env
echo FRONTEND_PORT=3001 >> $dir/.env

# check if parity-nodes docker network exists, otherwise create it
if [[ $(docker network ls | xargs | grep -q $network_name) == 0 ]]; then
    echo "network: $network_name exists!"
else
    echo "creating network: $network_name"
    docker network create $network_name > /dev/null 2>&1
fi

# start docker containers
docker-compose -p vote-auth -f docker-compose.yml up --build --detach

# remove all temp files
rm -f $dir/backend/envs/.env.development
rm -f $dir/backend/envs/.env.production
rm -f $dir/.env