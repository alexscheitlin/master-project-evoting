#!/bin/bash

readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly parentDir="$(dirname "$dir")"
readonly parentParentDir="$(dirname "$parentDir")"

# We need to provide a chain.json to the parity nodes
# in order for them to boot up. And as we are not manually want to fetch the chain.json from
# the authority backend, we will copy the example.chain.json inside sealer/backend/src/chainspec
from=$parentParentDir/sealer/backend/src/chainspec/example.chain.json
to=$parentParentDir/sealer/backend/src/chainspec/chain.json

# remove possible remaining files
$parentParentDir/sealer/parity-node/clean.sh

# copy chain.json to the project
cp $from $to
$parentParentDir/sealer/parity-node/run.sh 0
$parentParentDir/sealer/parity-node/clean.sh
sleep 1

# copy chain.json to the project
cp $from $to
$parentParentDir/sealer/parity-node/run.sh 1
$parentParentDir/sealer/parity-node/clean.sh
sleep 1

# copy chain.json to the project
cp $from $to
$parentParentDir/sealer/parity-node/run.sh 2
$parentParentDir/sealer/parity-node/clean.sh
sleep 1

cd $parentParentDir/poa-blockchain/scripts

printf  "Register nodes "
# wait until containers are ready to answer rpc calls
sleep 1; printf "."
sleep 1; printf "."
sleep 1; printf "."
sleep 1; printf "."
sleep 1; printf "."
sleep 1; printf "."
sleep 1; printf "."
echo

$dir/register-node.sh 7011 7010
$dir/register-node.sh 7012 7010
