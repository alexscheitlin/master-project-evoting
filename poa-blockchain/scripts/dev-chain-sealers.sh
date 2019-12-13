#!/bin/bash

readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly parentDir="$(dirname "$dir")"
readonly parentParentDir="$(dirname "$parentDir")"

# start a chain with three parity-nodes
$dir/dev-chain-parity-nodes.sh

# start the three sealers (frontend + backend pairs)
$parentParentDir/sealer/docker-start.sh 1
$parentParentDir/sealer/docker-start.sh 2
$parentParentDir/sealer/docker-start.sh 3