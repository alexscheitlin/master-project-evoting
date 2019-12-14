#!/bin/bash

###############################################################################
# Example Call
###############################################################################
# ./get-peers.sh

###############################################################################
# Main
###############################################################################

# get balance
host="localhost:8541"
method="net_peerCount"
params=''
result=$(./execute-rpc-call.sh "$host" "$method" "$params" | jq -r .result)

# convert hex to dec
hex=$result
dec=$(echo $result | cut -c 3-)
dec=$(echo "ibase=16; ${dec^^}" | bc)
echo $dec
