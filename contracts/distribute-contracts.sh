#!/bin/bash

readonly DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly PROJECT_DIR="$(dirname "$DIR")"

COMPILED_DIR=$DIR'/compiled'

# distribute to voting authority backend
DESTINATION_DIR="voting-authority-backend/solidity/toDeploy/"
CONTRACTS=("Ballot.json" "ModuloMathLib.json")

echo
echo "Distributing your contracts..."
echo "==========================="

echo "> Distribute to: $DESTINATION_DIR"
for contract in "${CONTRACTS[@]}"; do
    echo "  - $contract"
    cp $COMPILED_DIR/$contract $PROJECT_DIR/$DESTINATION_DIR
done
echo

# distribute to voter frontend
DESTINATION_DIR="voter-frontend/src/contract-abis/"
CONTRACTS=("Ballot.json")

echo "> Distribute to: $DESTINATION_DIR"
for contract in "${CONTRACTS[@]}"; do
    echo "  - $contract"
    cp $COMPILED_DIR/$contract $PROJECT_DIR/$DESTINATION_DIR
done
echo

echo "> If you want to distribute more contracts, please adjust 'distribute.contracts.sh'."
