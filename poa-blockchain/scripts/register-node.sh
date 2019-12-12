#!/bin/bash

###############################################################################
# Main
###############################################################################

# obtain enode of node at specified port
host="http://172.1.1.$1"
method="parity_enode"
params=""
enode=$(./execute-rpc-call.sh "$host" "$method" "$params" | jq .result)
echo $enode

# register node
host="http://172.1.1.$2"
method="parity_addReservedPeer"
params="$enode"
result=$(./execute-rpc-call.sh "$host" "$method" "$params")
echo $result
