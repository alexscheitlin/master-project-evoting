#!/bin/bash
passphrase="node0"
password="node0"

header="Content-Type: application/json"
host="localhost:8540"

method="parity_newAccountFromPhrase"
params='"'$passphrase'", "'$password'"'
data='{"jsonrpc":"2.0","method":"'$method'","params":['$params'],"id":0}'
result=$(curl -s --data "$data" -H "$header" -X POST $host)

echo $result
