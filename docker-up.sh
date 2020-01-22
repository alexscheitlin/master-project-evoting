#!/bin/bash

shouldBuild=0

echo '##############################################'
echo '# STARTING E-VOTING SYSTEM                   #'
echo '##############################################'
echo

if [[ $1 == '--build' ]]; then
    
    echo '> building docker containers'
    shouldBuild=1
else
    echo '> using existing containers...'
    echo '> if you wish to build the docker containers, run:' 
    echo '> ./docker-up.sh --build'
fi

echo
echo '> starting Voting Authority'
./voting-authority/docker-start.sh $shouldBuild

echo
echo '> starting Access Provider Backend'
./access-provider-backend/docker-start.sh $shouldBuild

echo
echo '> starting Identity Provider Backend'
./identity-provider-backend/docker-start.sh $shouldBuild

echo
echo '> starting 3 Blockchain Sealer Nodes'
./poa-blockchain/scripts/dev-chain-sealers.sh $shouldBuild

echo
echo '> starting Blockchain Explorer Dashboard'
./ethstats/docker-start.sh $shouldBuild

echo 
echo '-------------------------------------------------'
echo '> Running Docker Containers'
echo '-------------------------------------------------'
docker ps
