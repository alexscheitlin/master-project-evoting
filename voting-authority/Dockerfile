FROM node:12-alpine as builder

# variables used to perform npm-cli-login
ARG GITHUB_TOKEN
ARG GITHUB_USER
ARG GITHUB_EMAIL
ARG PARITY_PORT
ARG PARITY_IP
ARG VA_PORT
ARG VA_IP

# env variables
ENV PARITY_NODE_PORT=$PARITY_PORT
ENV PARITY_NODE_IP=$PARITY_IP
ENV VOTING_AUTH_BACKEND_PORT=$VA_PORT
ENV VOTING_AUTH_BACKEND_IP=$VA_IP
ENV REACT_APP_AUTH_BACKEND_PORT=$VA_PORT
ENV REACT_APP_AUTH_BACKEND_IP=$VA_IP
ENV NODE_ENV=development

# Create app directory
WORKDIR /usr/src

# install build dependencies
RUN apk add --no-cache bash python make g++ gcc openssh-client git

# Install the app dependencies
COPY ./backend/package*.json ./backend/
COPY ./backend/.npmrc ./backend/

# install npm cli login to retrieve private package from github
RUN npm install -g npm-cli-login
RUN NPM_USER=${GITHUB_USER} NPM_PASS=${GITHUB_TOKEN} NPM_EMAIL=${GITHUB_EMAIL} NPM_REGISTRY=https://npm.pkg.github.com npm-cli-login

RUN cd ./backend && npm i

# install frontend
COPY ./frontend/package*.json ./frontend/
RUN cd ./frontend && npm i

# copy remaining files
COPY ./backend/src ./backend/src
COPY ./backend/tsconfig.json ./backend/tsconfig.json
COPY ./backend/postbuild.sh ./backend/postbuild.sh
COPY ./backend/solidity ./backend/solidity

COPY ./frontend/src ./frontend/src
COPY ./frontend/public ./frontend/public
COPY ./frontend/tsconfig.json ./frontend/tsconfig.json

# build backend
RUN cd ./backend && npm run build

# build frontend
RUN cd ./frontend && npm run build

RUN rm -rf ./backend/node_modules
RUN cd ./backend && npm i --production

## STAGE 2
FROM node:12-alpine

# env variable
ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src

# Install app dependencies
COPY --from=builder /usr/src/backend/node_modules /usr/src/backend/node_modules

# copy the dist
COPY --from=builder /usr/src/backend/dist /usr/src/backend/dist
COPY --from=builder /usr/src/frontend/build /usr/src/frontend/build

CMD ["node", "./backend/dist/src/server.js"]