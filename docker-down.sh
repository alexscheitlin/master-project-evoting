#!/bin/bash

docker ps

echo
echo "This will stop all running:"
echo "- identity-providers"
echo "- access-providers"
echo "- voting authorities"
echo "- sealers"
echo

./poa-blockchain/scripts/stop-containers.sh identity-provider
./poa-blockchain/scripts/stop-containers.sh access-provider
./poa-blockchain/scripts/stop-containers.sh vote-auth
./poa-blockchain/scripts/stop-containers.sh sealer

docker ps
