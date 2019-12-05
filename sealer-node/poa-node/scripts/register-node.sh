#!/bin/bash

###############################################################################
# Example Call
###############################################################################
# ./register-node.sh 8540

###############################################################################
# Input Validation
###############################################################################

# # check if a port is provided
# if [ -z "$1" ]; then
#     echo 'Specify the port of the node!'
#     echo '[ 8542 | 8543 | 8540 ]'
#     exit
# fi

# # verify that the provided port is configured
# if [[ $1 != '8542' && $1 != '8543' && $1 != '8540' ]]; then
#     echo 'port' $1 'is not configured'
#     exit
# fi

###############################################################################
# Main
###############################################################################

# obtain enode of node at specified port
host="localhost:$1"
method="parity_enode"
params=""
enode=$(./execute-rpc-call.sh "$host" "$method" "$params" | jq .result)

# register node
host="localhost:8551"
method="parity_addReservedPeer"
params="$enode"
result=$(./execute-rpc-call.sh "$host" "$method" "$params")
echo $result
