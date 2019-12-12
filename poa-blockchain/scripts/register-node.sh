#!/bin/bash

###############################################################################
# Main
###############################################################################

# obtain enode of node at specified port
host="$1"
method="parity_enode"
params=""
enode=$(./execute-rpc-call.sh "$host" "$method" "$params" | jq .result)
echo $enode

# register node
host="$2"
method="parity_addReservedPeer"
params="$enode"
result=$(./execute-rpc-call.sh "$host" "$method" "$params")
echo $result
