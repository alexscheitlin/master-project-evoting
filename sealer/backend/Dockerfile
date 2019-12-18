FROM node:12-alpine as builder

# variables used to perform npm-cli-login
ARG GITHUB_TOKEN
ARG GITHUB_USER
ARG GITHUB_EMAIL

# Create app directory
WORKDIR /usr/src/backend

# install build dependencies
RUN apk add --no-cache bash python make g++ gcc openssh-client git

# copy package json
COPY package*.json ./
COPY .npmrc ./

# install npm cli login to retrieve private package from github
RUN npm install -g npm-cli-login
RUN NPM_USER=${GITHUB_USER} NPM_PASS=${GITHUB_TOKEN} NPM_EMAIL=${GITHUB_EMAIL} NPM_REGISTRY=https://npm.pkg.github.com npm-cli-login

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

FROM node:12-alpine 

# Create app directory
WORKDIR /usr/src/backend

COPY --from=builder /usr/src/backend/node_modules /usr/src/backend/node_modules

# Bundle app source
COPY . .
COPY ./wallet ./wallet

CMD npm run serve:dev:clean