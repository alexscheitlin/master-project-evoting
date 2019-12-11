readonly name=$(basename $0)
readonly dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# input
sealerNr=$1

# create env file for docker-compose
echo BACKEND_PORT=401$sealerNr >> $dir/.env
echo FRONTEND_PORT=301$sealerNr >> $dir/.env

# shutdown everything the docker-compose up started, includes network created + services
docker-compose -p controller_$sealerNr -f docker-compose.yml down

# remove temporary env file
rm -f $dir/.env