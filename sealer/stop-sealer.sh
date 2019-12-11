readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# input
sealerNr=$1
internal=10

# ports
echo SEALER_BE_PORT=401$sealerNr >> $dir/.env
echo FRONTEND_PORT=301$sealerNr >> $dir/.env

# internal IP's for BE <-> FE
echo SEALER_BE_IP=172.1.$internal$sealerNr.20 >> $dir/.env
echo FRONTEND_IP=172.1.$internal$sealerNr.10 >> $dir/.env
echo INTERNAL_IP_RANGE=172.1.$internal$sealerNr.0/24 >> $dir/.env

# ip and port of Vote Authority Backend (vote-auth network)
echo VOTH_AUTH_BE_IP=172.1.10.5 >> $dir/.env
echo VOTH_AUTH_BE_PORT=4001 >> $dir/.env

# ip of Sealer Backend in vot-auth network
echo VOTE_AUTH_NETWORK_IP=172.1.10.$sealerNr$internal >> $dir/.env

# ip of Sealer's Parity Node (parity-node network)
echo PARITY_NODE_IP=172.1.1.$sealerNr >> $dir/.env

# ip of Sealer Backend in parity-node network
echo PARITY_NETWORK_IP=172.1.1.10$sealerNr >> $dir/.env

# shutdown everything the docker-compose up started, includes network created + services
docker-compose -p controller_$sealerNr -f docker-compose.yml down

# remove temporary env file
rm -f $dir/.env