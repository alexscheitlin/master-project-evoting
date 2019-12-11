#!/bin/bash
readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# create env file for docker-compose to find ports
echo BACKEND_PORT=4001 >> $dir/.env
echo FRONTEND_PORT=3001 >> $dir/.env

# internal IP's for BE <-> FE
echo BACKEND_IP=172.1.11.20 >> $dir/.env
echo FRONTEND_IP=172.1.11.10 >> $dir/.env

# external IP for VoteAuthBE <-> Sealer BEs
echo VOTE_AUTH_BACKEND_IP=172.1.10.5 >> $dir/.env

# shutdown everything the docker-compose up started, includes network created + services
docker-compose -p vote-auth -f docker-compose.yml down

# remove the vote-auth network
docker network rm vote-auth

# remove temporary .env files
rm -f $dir/.env