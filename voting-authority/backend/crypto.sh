#!/bin/bash

readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# install and build mp-crypto
cd $dir/mp-crypto && npm install
cd $dir/mp-crypto && npm run build

# add custom curve to the elliptic package
chmod +x $dir/mp-crypto/copyCustomCurve.sh
$dir/mp-crypto/copyCustomCurve.sh

# create directory named mp-crypto inside backend/node_modules
mkdir -p $dir/node_modules/mp-crypto

# copy over the whole mp-crypto project
cp -r $dir/mp-crypto $dir/node_modules/

# cleanup
rm -rf $dir/mp-crypto
