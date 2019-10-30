#!/bin/bash

if [ -z "$1" ]; then
    echo 'Specify a node!'
    exit
fi

if [[ $1 = 0 ]] ; then
    ./parity --chain 1/demo-spec.json --config 1/node0.toml
    exit
fi

if [[ $1 = 1 ]] ; then
    ./parity --chain 1/demo-spec.json --config 1/node1.toml
    exit
fi

echo 'node' $1 'is not configured'
exit
