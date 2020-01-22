#!/bin/bash

##############################################
# Check if network e-voting existst
#
# - if it doesn't, it will create it
##############################################
network_name=$1

exists=$(docker network ls | grep -c $network_name)

# check if parity-nodes docker network exists, otherwise create it
if [[ $exists == 1 ]]; then
    echo "> $network_name network already exists...using existing network."
else
    echo "> creating network: $network_name"
    docker network create $network_name \
    --driver=bridge \
    --subnet=172.1.1.0/24 \
    --gateway=172.1.1.1 \
    --opt com.docker.network.bridge.enable_icc=true \
    --opt com.docker.network.bridge.enable_ip_masquerade=true > /dev/null 2>&1
fi