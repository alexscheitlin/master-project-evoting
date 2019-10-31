#!/bin/bash
passphrase="user"
password="user"

header="Content-Type: application/json"
host="localhost:8542"

method="parity_newAccountFromPhrase"
params='"'$passphrase'", "'$password'"'
data='{"jsonrpc":"2.0","method":"'$method'","params":['$params'],"id":0}'
result=$(curl -s --data "$data" -H "$header" -X POST $host)

echo $result
