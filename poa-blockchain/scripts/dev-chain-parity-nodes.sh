#!/bin/bash

readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly parentDir="$(dirname "$dir")"
readonly parentParentDir="$(dirname "$parentDir")"

###########################################
# Config
# - the config file with all IPs and ports
###########################################
globalConfig=$parentParentDir/system.json

###########################################
# Mode
###########################################
mode=production
echo "The mode is: $mode"

# We need to provide a chain.json to the parity nodes
# in order for them to boot up. And as we are not manually want to fetch the chain.json from
# the authority backend, we will copy the example.chain.json inside sealer/backend/src/chainspec
from=$parentParentDir/sealer/backend/src/chainspec/example.chain.json
to=$parentParentDir/sealer/backend/src/chainspec/chain.json

# remove possible remaining files
$parentParentDir/sealer/parity-node/clean.sh

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

# copy chain.json to the project
cp $from $to
$parentParentDir/sealer/parity-node/run.sh 3
$parentParentDir/sealer/parity-node/clean.sh
sleep 1

cd $parentParentDir/poa-blockchain/scripts

###########################################
# ENODE registration
###########################################
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

parity1_IP=$(cat $globalConfig | jq .services.sealer_parity_1.ip.$mode | tr -d \")
parity1_PORT=$(cat $globalConfig | jq .services.sealer_parity_1.port)

parity2_IP=$(cat $globalConfig | jq .services.sealer_parity_2.ip.$mode | tr -d \")
parity2_PORT=$(cat $globalConfig | jq .services.sealer_parity_2.port)

parity3_IP=$(cat $globalConfig | jq .services.sealer_parity_3.ip.$mode | tr -d \")
parity3_PORT=$(cat $globalConfig | jq .services.sealer_parity_3.port)

bootnode_address="http://$parity1_IP:$parity1_PORT"

echo "sending rpc call to " $bootnode_address
echo "http://$parity2_IP:$parity2_PORT"
echo "http://$parity3_IP:$parity3_PORT"

$dir/register-node.sh "http://$parity2_IP:$parity2_PORT" $bootnode_address
$dir/register-node.sh "http://$parity3_IP:$parity3_PORT" $bootnode_address

echo "Chain Setup Done. You should have three sealers running."