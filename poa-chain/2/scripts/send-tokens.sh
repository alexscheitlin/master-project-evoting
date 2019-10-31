#!/bin/bash

readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly parentDir="$(dirname "$dir")"
source "$dir/accounts.sh"

# get the address to send the tokens from
case "$1" in
    "n0a")
        account_from=$n0_authority
        password=$(cat $parentDir/node0.pwd)
        ;;
    "n1a")
        account_from=$n1_authority
        password=$(cat $parentDir/node1.pwd)
        ;;
    "user")
        account_from=$user
        password=$(cat $parentDir/user.pwd)
        ;;
    *)
        echo "Specify an account as the first argument:"
        noAccount
        exit
esac

# get the address to send the tokens to
case "$2" in
    "n0a")
        account_to=$n0_authority
        ;;
    "n0u")
        account_to=$n0_user
        ;;
    "n1a")
        account_to=$n1_authority
        ;; 
    *)
        echo "Specify an account as the second argument:"
        noAccount
        exit
esac

# get the amount to send
#re='^[0-9]+$'
#if ! [[ $3 =~ $re ]] ; then
#   echo "Specify the amount to send a the third argument"
#   exit
#fi

#amount=$3
amount=1000
hex_amount=$(echo "ibase=10; obase=16; ${amount^^}" | bc)
hex_amount=0x$hex_amount

echo "balance of sender   ($1)" $( ./2/scripts/get-balance.sh $1 no )
echo "balance of receiver ($2)" $( ./2/scripts/get-balance.sh $2 no )

echo "transaction ..."

header="Content-Type: application/json"
host="localhost:8542"

method="personal_sendTransaction"
params='{"from":"'$account_from'","to":"'$account_to'","value":"'$hex_amount'"}, "'$password'"'
data='{"jsonrpc":"2.0","method":"'$method'","params":['$params'],"id":1}'
result=$(curl -s --data "$data" -H "$header" -X POST $host)

echo $result

#echo "balance of sender   ($1)" $( ./2/get-balance.sh $1 no )
#echo "balance of receiver ($2)" $( ./2/get-balance.sh $1 no )
