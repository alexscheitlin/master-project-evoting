#!/bin/bash

###############################################################################
# Main
###############################################################################

# obtain enode of node at specified port
host="localhost:$1"
method="parity_enode"
params=""
enode=$(./execute-rpc-call.sh "$host" "$method" "$params" | jq .result)
echo $enode

# register node
host="localhost:7010"
method="parity_addReservedPeer"
params="$enode"
result=$(./execute-rpc-call.sh "$host" "$method" "$params")
echo $result
