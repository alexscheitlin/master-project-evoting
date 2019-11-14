#!/bin/bash

# docker
rm -rf ./storage

# localhost
rm -rf /tmp/auth1
rm -rf /tmp/auth2
rm -rf /tmp/auth3
rm -rf /tmp/user

# init docker
mkdir -p ./storage/auth1
mkdir -p ./storage/auth2
mkdir -p ./storage/auth3
mkdir -p ./storage/user
