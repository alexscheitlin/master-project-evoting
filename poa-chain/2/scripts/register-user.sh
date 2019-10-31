#!/bin/bash

header="Content-Type: application/json"

# obtain enode of user
data='{"jsonrpc":"2.0","method":"parity_enode","params":[],"id":0}'
enode=$(curl -s --data "$data" -H "$header" -X POST localhost:8542 | jq .result)

# add enode to node 0
data='{"jsonrpc":"2.0","method":"parity_addReservedPeer","params":['"$enode"'],"id":0}'
curl --data "$data" -H "$header" -X POST localhost:8540
