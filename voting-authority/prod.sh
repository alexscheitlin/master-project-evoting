#!/bin/bash

########################################
# relative directories
########################################
readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly parentDir="$(dirname "$dir")"
readonly parentParentDir="$(dirname "$parentDir")"


###########################################
# Cleanup
###########################################
rm -f $dir/.env

###########################################
# Mode
###########################################
mode=production
echo "The mode is: $mode"

###########################################
# Config
# - the config file with all IPs and ports
###########################################
globalConfig=$parentDir/system.json
githubConfig=$parentDir/github.json

# check if the github config json exists -> if not we stop the process
if [ ! -f "$githubConfig" ]; then
    echo "$githubConfig doesn't exist! Please create it!"
    exit
fi

###########################################
# ENV variables
###########################################
# - Specify the Github credentials
GITHUB_TOKEN=$(cat $githubConfig | jq .github.token | tr -d \")
GITHUB_EMAIL=$(cat $githubConfig | jq .github.email | tr -d \")
GITHUB_USER=$(cat $githubConfig | jq .github.user | tr -d \")

###########################################
# write ENV variables into .env
###########################################
echo GITHUB_TOKEN=$GITHUB_TOKEN >> $dir/.env
echo GITHUB_USER=$GITHUB_USER >> $dir/.env
echo GITHUB_EMAIL=$GITHUB_EMAIL >> $dir/.env
