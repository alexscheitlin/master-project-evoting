#!/bin/bash

if [ -z "$1" ]; then
    echo 'Specify a node!'
    exit
fi

if [[ $1 = 0 ]] ; then
    ./parity --chain 2/demo-spec.json --config 2/node0.toml
    exit
fi

if [[ $1 = 1 ]] ; then
    ./parity --chain 2/demo-spec.json --config 2/node1.toml
    exit
fi

if [[ $1 = 'user' ]] ; then
    ./parity --chain 2/demo-spec.json --config 2/user.toml
    exit
fi

echo 'node' $1 'is not configured'
exit
