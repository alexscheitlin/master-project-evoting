# #!/bin/bash

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

auth1="0x82f876d4bbb1b017e0d730f12d9721e0a2b1fe16"
auth2="0x98b32c998f16e36cff94b430c656335d682e78dd"
auth3="0x3e5006ae356a01f2b6fa1c473fb49d73a609d4eb"
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

# FIXME: password is always taken from nodes/docker/.../node.pwd
# password=$(cat $dir/nodes/docker/$1/node.pwd)
# password=vupUEh2H7fKQiZ
password=user

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
sender_balance="$( ./get-balance.sh $1 7010 )"
receiver_balance="$( ./get-balance.sh $2 7010 )"
echo "balance of sender   ($1)" $sender_balance
echo "balance of receiver ($2)" $receiver_balance

case "$1" in
    "auth0")
        port='7010'
        ;;
    "auth1")
        port='7011'
        ;;
    "auth2")
        port='7012'
        ;;
    "user")
        port='7010'
        ;;
esac

# make transaction
printf "transaction "
host="localhost:$port"
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
echo "balance of sender   ($1)" $( ./get-balance.sh $1 7010 )
echo "balance of receiver ($2)" $( ./get-balance.sh $2 7010 )
