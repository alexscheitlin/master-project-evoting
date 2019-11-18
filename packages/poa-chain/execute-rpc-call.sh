#!/bin/bash

# only call me within a script :)

host=$1
method=$2
params=$3
header="Content-Type: application/json"

data='{"jsonrpc":"2.0","method":"'$method'","params":['$params'],"id":0}'
result=$(curl -s --data "$data" -H "$header" -X POST $host)
echo $result
