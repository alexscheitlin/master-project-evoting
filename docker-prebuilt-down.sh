#!/bin/bash

readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly parentDir="$(dirname "$dir")"
readonly parentParentDir="$(dirname "$parentDir")"

# stop all containers
docker-compose -f pre-built.yml down

# stop the blockchain
$dir/poa-blockchain/scripts/stop-containers.sh sealer

# show all running containers
docker ps