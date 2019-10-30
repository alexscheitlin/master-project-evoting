#!/bin/bash

readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
source "$dir/accounts.sh"

# get the address to get the balance from
case "$1" in
    "n0a")
        account=$n0_authority
        ;;
    "n1a")
        account=$n1_authority
        ;;
    "user")
        account=$user
        ;;
    *)
        echo "Specify an account as the first argument:"
        noAccount
        exit
esac

header="Content-Type: application/json"
host="localhost:8540"

method="eth_getBalance"
params='"'$account'", "latest"'
data='{"jsonrpc":"2.0","method":"'$method'","params":['$params'],"id":1}'
result=$(curl -s --data "$data" -H "$header" -X POST $host | jq -r .result)

hex=$result
dec=$(echo $result | cut -c 3-)
dec=$(echo "ibase=16; ${dec^^}" | bc)

if [[ $2 = 'no' ]] ; then
    echo $dec
else
    echo "balance of" $1 '-' $account "is" $dec '('$hex')'
fi

