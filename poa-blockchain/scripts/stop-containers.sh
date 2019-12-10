#!/bin/bash

# stop and remove all docker containers starting with the passed string
docker ps --filter name=$1* -aq | xargs docker stop | xargs docker rm