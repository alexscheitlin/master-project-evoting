#!/bin/bash    

###############################################################################
# Example Call
###############################################################################
# ./get-balance.sh auth1

###############################################################################
# Input Validation
###############################################################################

# check if a node is provided
if [ -z "$1" ]; then
    echo 'Specify a node!'
    echo '[ auth1 | auth2 | auth3 | user ]'
    exit
fi

# verify that the provided node is configured
if [[ $1 != 'auth1' && $1 != 'auth2' && $1 != 'auth3' && $1 != 'user' ]]; then
    echo 'node' $1 'is not configured'
    exit
fi

###############################################################################
# Main
###############################################################################

auth1="0x82f876d4bbb1b017e0d730f12d9721e0a2b1fe16"
auth2="0x98b32c998f16e36cff94b430c656335d682e78dd"
auth3="0x3e5006ae356a01f2b6fa1c473fb49d73a609d4eb"
user="0x004ec07d2329997267ec62b4166639513386f32e"  

# get the address of the specified node
case "$1" in
    "auth1")
        account=$auth1
        ;;
    "auth2")
        account=$auth2
        ;;
    "auth3")
        account=$auth3
        ;;
    "user")
        account=$user
        ;;
esac

# get balance
host="localhost:$2"
method="eth_getBalance"
params='"'$account'", "latest"'
result=$(./execute-rpc-call.sh "$host" "$method" "$params" | jq -r .result)

# convert hex to dec
hex=$result
dec=$(echo $result | cut -c 3-)
dec=$(echo "ibase=16; ${dec^^}" | bc)

# if the second argument is 'no' only output the balance
if [[ $2 = 'no' ]] ; then
    echo $dec
else
    echo "balance of" $1 '-' $account "is" $dec '('$hex')'
fi
