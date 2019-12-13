#!/bin/bash

########################################
# relative directories
########################################
readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly parentDir="$(dirname "$dir")"

########################################
# start backend on localhost
########################################
echo "########################################################"
echo "# >>>>>> You need to start the frontend manually <<<<< #"
echo "########################################################"
echo "# - go to /frontend and run npm run start:localhost    #"
echo "########################################################"

cd $dir/backend
npm run serve:localhost
