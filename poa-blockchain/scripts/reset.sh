#!/bin/bash

readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# stop all controllers (frontends and backends)
docker stop $dir/stop-containers.sh controller

# stop all sealers
docker stop $dir/stop-containers.sh sealer
