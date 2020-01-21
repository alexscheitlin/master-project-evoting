#!/bin/bash

########################################
# relative directories
########################################
readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly parentDir="$(dirname "$dir")"
readonly parentParentDir="$(dirname "$parentDir")"

# copy json files needed to run
mkdir -p $dir/dist/contract-abis
cp $dir/src/contract-abis/Ballot.json $dir/dist/contract-abis/Ballot.json
cp $dir/src/database/db_default.json $dir/dist/database/db_default.json
cp $dir/src/database/db.json $dir/dist/database/db.json
cp -r $dir/src/chainspec $dir/dist/chainspec