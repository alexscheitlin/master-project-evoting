sealerNr=$1

# copy keys
cp ../keys/sealer$sealerNr.json ../../sealer/node/sealer.json
cp ../keys/sealer$sealerNr.pwd ../../sealer/node/sealer.pwd

# create .env
touch .env
echo PARITY_VERSION=stable  >> .env
echo NETWORK_NAME=Parity_PoA  >> .env
echo SIGNER_ADDRESS=0x$(cat ../keys/sealer$sealerNr.json | jq --raw-output .address)  >> .env

# copy chainspec
cp ../chainspec/chain$sealerNr.json ../../sealer/node/chain.json

# boot the node with the given config
docker-compose -f ../../sealer/docker-compose.sealer.yml up --build --detach

# delete keys, chainspec and .env
rm .env
rm ../../sealer/node/sealer.json
rm ../../sealer/node/sealer.pwd
rm ../../sealer/node/chain.json