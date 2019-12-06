#!/bin/bash

# start dev chain with three nodes
# TODO: make this a whole lot better... xD

cd ../../sealer/parity-node
./run.sh 0
./clean.sh

sleep 1

./run.sh 1
./clean.sh

sleep 1

./run.sh 2
./clean.sh

sleep 3

cd ../../poa-blockchain/scripts

printf  "Register nodes "
# wait until containers are ready to answer rpc calls
sleep 1; printf "."
sleep 1; printf "."
sleep 1; printf "."
sleep 1; printf "."
sleep 1; printf "."
sleep 1; printf "."
sleep 1; printf "."
sleep 1; printf "."
echo

./register-node.sh 7011 7010
./register-node.sh 7012 7010
