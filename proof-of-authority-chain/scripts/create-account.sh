#!/bin/bash

###############################################################################
# Example Call
###############################################################################
# ./create-account.sh 8541 phrase word

###############################################################################
# Input Validation
###############################################################################

# # check if a port is provided
# if [ -z "$1" ]; then
#     echo 'Specify a port!'
#     echo '[ 8541 | 8542 | 8543 | 8540 ]'
#     exit
# fi

# # verify that the provided port is configured
# if [[ $1 != '8541' && $1 != '8542' && $1 != '8543' && $1 != '8540' ]]; then
#     echo 'port' $1 'is not configured'
#     exit
# fi

# # check if a passphrase is provided
# if [ -z "$2" ]; then
#     echo 'Specify a passphrase!'
#     exit
# fi

# # check if a password is provided
# if [ -z "$3" ]; then
#     echo 'Specify a password!'
#     exit
# fi

###############################################################################
# Main
###############################################################################

passphrase=$2
password=$3

host="localhost:$1"
method="parity_newAccountFromPhrase"
params='"'$passphrase'", "'$password'"'

./execute-rpc-call.sh "$host" "$method" "$params"
