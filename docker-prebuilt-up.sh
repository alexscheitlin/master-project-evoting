#!/bin/bash

readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly parentDir="$(dirname "$dir")"
readonly parentParentDir="$(dirname "$parentDir")"

githubConfig=$dir/github.json

# - Specify the Github credentials
GITHUB_TOKEN=$(cat $githubConfig | jq .github.token | tr -d \")
GITHUB_USER=$(cat $githubConfig | jq .github.user | tr -d \")

# login into docker package registry
docker login docker.pkg.github.com --username $GITHUB_USER --password $GITHUB_TOKEN

# create docker network
$dir/docker-network.sh

# start a chain with three parity-nodes
$dir/poa-blockchain/scripts/dev-chain-parity-nodes.sh

# start all other containers
docker-compose -f pre-built.yml up --detach --no-build

###########################################
# Identity Provisioning
###########################################
echo "##########################################################################"
echo "# Identity Provisioning"
echo "##########################################################################"
echo
printf  "...waiting for identity provider to be ready."
# wait until identity provider is ready to answer REST request
sleep 1; printf "."
sleep 1; printf "."
sleep 1; printf "."
sleep 1; printf "."
sleep 1; printf "."
sleep 1; printf "."
sleep 1; printf "."
echo

# provision the identities
curl -X POST \
  http://172.1.1.43:4003/registerVoters \
  -H 'Content-Type: application/json' \
  -d '{
    "voters": [
        "9980280d-32d1-41e9-8959-7c483e43256b",
        "afd948fe-7b48-421b-accb-389619f8456c",
        "5342b7e8-3f8e-4520-ac4e-e0b54f1d1ead"
    ]
}'

# show all running containers
docker ps