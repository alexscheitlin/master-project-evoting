#!/bin/bash

readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly parentDir="$(dirname "$dir")"
readonly parentParentDir="$(dirname "$parentDir")"

$parentParentDir/sealer/parity-node/run.sh 0
$parentParentDir/sealer/parity-node/./clean.sh
sleep 1
$parentParentDir/sealer/parity-node/run.sh 1
$parentParentDir/sealer/parity-node/./clean.sh
sleep 1
$parentParentDir/sealer/parity-node/run.sh 2
$parentParentDir/sealer/parity-node/./clean.sh
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
