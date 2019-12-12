#!/bin/bash

##############################################
# Check if network e-voting existst
#
# - if it doesn't, it will create it
##############################################
network_name=$1

echo $(docker network ls | xargs | grep -q $network_name)

# check if parity-nodes docker network exists, otherwise create it
if [[ $(docker network ls | xargs | grep -q $network_name) == 0 ]]; then
    echo "network: $network_name exists!"
else
    echo "creating network: $network_name"
    docker network create $network_name \
    --driver=bridge \
    --subnet=172.1.1.0/24 \
    --gateway=172.1.1.1 \
    --opt com.docker.network.bridge.enable_icc=true \
    --opt com.docker.network.bridge.enable_ip_masquerade=true > /dev/null 2>&1
fi