#!/bin/bash

########################################
# relative directories
########################################
readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly parentDir="$(dirname "$dir")"
readonly parentParentDir="$(dirname "$parentDir")"

# copy json files needed to run
cp $dir/src/database/db.json $dir/dist/src/database/db.json
cp $dir/src/database/defaultChainspec.json $dir/dist/src/database/defaultChainspec.json
cp -r $dir/solidity/toDeploy $dir/dist/solidity/toDeploy