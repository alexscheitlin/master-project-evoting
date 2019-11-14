#!/bin/bash

###############################################################################
# Example Call
###############################################################################
# ./all-in-one.sh

###############################################################################
# Functions
###############################################################################

# start a docker container in detached mode using the parity image
#
# mount the chain spec, the node password, node configuration, and
# storage directory to store the chain between two container runs
start_container() {
    port=$1
    node=$2
    phase=$3
    local_dir=$(pwd)
    mount_dir="/home/parity"

    result=$(
        docker run -d -p $port:$port \
            -v $local_dir/chain/spec-$phase.json:$mount_dir/spec.json:ro \
            -v $local_dir/nodes/docker/$node/node.pwd:$mount_dir/node.pwd:ro \
            -v $local_dir/nodes/docker/$node/node-$phase.toml:$mount_dir/node.toml:ro \
            -v $local_dir/storage/$node/:$mount_dir/storage/$node/ \
            parity/parity:stable \
            --base-path $mount_dir/storage/$node/ \
            --config $mount_dir/node.toml \
            --jsonrpc-interface all
    )

    echo $result
}

create_acccount() {
    port=$1
    node=$2
    password=$3
    passphrase=$4

    printf "Configure $node ..."
    printf " starting ..."
    container_id=$(start_container $port $node 1)
    sleep 1 # wait until container is ready to answer rpc calls

    printf " creating address ..."
    address=$(./create-account.sh $port $password $passphrase | jq .result)
    printf " at $address ..."

    printf " stopping node"
    echo ""
    stop=$(docker stop $container_id)
}

###############################################################################
# Main
###############################################################################

# remove old blockchain data
read -p "Do you want to reset the blockchain? [y | n] " -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Wipe blockchain storage"
    ./reset.sh
fi
echo

# create accounts
read -p "Do you want to create the accounts? [y | n] " -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    create_acccount 8541 auth1 auth1 auth1
    create_acccount 8542 auth2 auth2 auth2
    create_acccount 8543 auth3 auth3 auth3
    create_acccount 8540 user user user
fi
echo

# start nodes
echo "Start nodes"
containers=()

container_id=$(start_container 8541 auth1 2); containers+=($container_id)
echo 'auth1 running at' $container_id

container_id=$(start_container 8542 auth2 2); containers+=($container_id)
echo 'auth2 running at' $container_id

container_id=$(start_container 8543 auth3 2); containers+=($container_id)
echo 'auth3 running at' $container_id

container_id=$(start_container 8540 user 2); containers+=($container_id)
echo 'user running at' $container_id

# register nodes
echo
read -p "Do the nodes need to be registered? [y | n] " -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
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

    ./register-node.sh 8542
    ./register-node.sh 8543
    ./register-node.sh 8540
fi

# stop nodes
echo
read -p "Press enter to stop all nodes"
for container in "${containers[@]}"; do
    echo "   stopping $container"
    echo "           " $(docker stop $container)
done

# check if all containers are down
echo
echo "Are all parity containers down?"
echo "Stop any container with 'docker stop CONTAINER_ID'"
echo
docker ps
echo
