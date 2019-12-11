FROM node:12-alpine

# install bash
RUN apk add --no-cache bash

# Create app directory
WORKDIR /usr/src/backend

# Install app dependencies
COPY package*.json ./

RUN npm install --force
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .
COPY ./wallet ./wallet
# Copy over source files of crypto library
COPY ./mp-crypto ./mp-crypto

EXPOSE 4004

# This script will install dependencies inside /mp-crypto
# and add the custom weier curve to the elliptic package
RUN chmod +x crypto.sh
RUN ./crypto.sh