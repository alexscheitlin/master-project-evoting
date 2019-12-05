#!/bin/bash

readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

###############################################################################
# Example Call
###############################################################################
# ./send-tokens.sh user auth1
# ./send-tokens.sh user auth1 10000

###############################################################################
# Input Validation
###############################################################################

# check if a sender node is provided
if [ -z "$1" ]; then
    echo 'Specify a sender node!'
    echo '[ auth1 | auth2 | auth3 | user ]'
    exit
fi

# verify that the provided sender node is configured
if [[ $1 != 'auth1' && $1 != 'auth2' && $1 != 'auth3' && $1 != 'user' ]]; then
    echo 'node' $1 'is not configured'
    exit
fi

# check if a receiver node is provided
if [ -z "$2" ]; then
    echo 'Specify a receiver node!'
    echo '[ auth1 | auth2 | auth3 | user ]'
    exit
fi

# verify that the provided receiver node is configured
if [[ $2 != 'auth1' && $2 != 'auth2' && $2 != 'auth3' && $2 != 'user' ]]; then
    echo 'node' $2 'is not configured'
    exit
fi

# verify that the nodes are not the same
if [[ $1 == $2 ]]; then
    echo 'Really? Try again!'
    exit
fi

# check if the amount is specified
if [ -z "$3" ]; then
    # default amount
    amount=1000
else
    re='^[0-9]+$'
    if ! [[ $3 =~ $re ]] ; then
        echo "$3 is not a valid amount"
        exit
    else
        amount=$3
    fi
fi

###############################################################################
# Main
###############################################################################

auth1="0x82f876d4bbb1b017e0d730f12d9721e0a2b1fe16"
auth2="0x98b32c998f16e36cff94b430c656335d682e78dd"
user="0x004ec07d2329997267ec62b4166639513386f32e"  

# get the address of the sender node
case "$1" in
    "auth1")
        sender=$auth1
        ;;
    "auth2")
        sender=$auth2
        ;;
    "auth3")
        sender=$auth3
        ;;
    "user")
        sender=$user
        ;;
esac

# password="vupUEh2H7fKQiZ"
password="user"

# get the address of the sender node
case "$2" in
    "auth1")
        receiver=$auth1
        ;;
    "auth2")
        receiver=$auth2
        ;;
    "auth3")
        receiver=$auth3
        ;;
    "user")
        receiver=$user
        ;;
esac

# convert transaction amount from dec to hex
hex_amount=$(echo "ibase=10; obase=16; ${amount^^}" | bc)
hex_amount=0x$hex_amount

# print balances before the transaction
sender_balance="$( ./get-balance.sh $1 no )"
receiver_balance="$( ./get-balance.sh $2 no )"
echo "balance of sender   ($1)" $sender_balance
echo "balance of receiver ($2)" $receiver_balance

# check if sender has enough funds
if [[ $sender_balance < $amount ]]; then
    echo "not enough funds!"
    exit
fi


# make transaction
printf "transaction "
host="localhost:8545"
method="personal_sendTransaction"
params='{"from":"'$sender'","to":"'$receiver'","value":"'$hex_amount'"}, "'$password'"'
result=$(./execute-rpc-call.sh "$host" "$method" "$params")

# print balances after the transaction
sleep 1; printf "."
sleep 1; printf "."
sleep 1; printf "."
sleep 1; printf "."
sleep 1; printf "."
sleep 1; printf "."
echo ""
echo "balance of sender   ($1)" $( ./get-balance.sh $1 no )
echo "balance of receiver ($2)" $( ./get-balance.sh $2 no )
