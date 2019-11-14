#!/bin/bash

###############################################################################
# Example Call
###############################################################################
# ./start-node.sh auth1 2

###############################################################################
# Input Validation
###############################################################################

# check if a node is provided
if [ -z "$1" ]; then
    echo 'Specify a node!'
    echo '[ auth1 | auth2 | auth3 | user ]'
    exit
fi

# verify that the provided node is configured
if [[ $1 != 'auth1' && $1 != 'auth2' && $1 != 'auth3' && $1 != 'user' ]]; then
    echo 'node' $1 'is not configured'
    exit
fi

# check that a phase is provided
if [ -z "$2" ]; then
    echo 'Specify a phase!'
    echo '[1 | 2]'
    exit
fi

# check that the provided phase is configured
if [[ "$2" != '1' && "$2" != '2' ]]; then
    echo 'phase' $2 'is not configured'
    exit
fi

###############################################################################
# Main
###############################################################################

if [[ $(cat use-docker) == 'true' ]]; then
    echo "starting $1 node inside a docker container ..."

    port=''
    case "$1" in
        "auth1")
            port='8541'
            ;;
        "auth2")
            port='8542'
            ;;
        "auth3")
            port='8543'
            ;;
        "user")
            port='8540'
            ;;
    esac

    local_dir=$(pwd)
    mount_dir="/home/parity"

    docker run -ti -p $port:$port \
        -v $local_dir/chain/spec-$2.json:$mount_dir/spec.json:ro \
        -v $local_dir/nodes/docker/$1/node.pwd:$mount_dir/node.pwd:ro \
        -v $local_dir/nodes/docker/$1/node-$2.toml:$mount_dir/node.toml:ro \
        -v $local_dir/storage/$1/:$mount_dir/storage/$1/ \
        parity/parity:stable \
        --base-path $mount_dir/storage/$1/ \
        --config $mount_dir/node.toml \
        --jsonrpc-interface all
        #--ui-interface all
else
    echo "starting $1 node on localhost ..."

    ./parity --config ./nodes/local/$1/node-$2.toml
fi
