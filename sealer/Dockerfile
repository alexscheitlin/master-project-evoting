FROM node:12-alpine as builder

# variables used to perform npm-cli-login
ARG GITHUB_TOKEN
ARG GITHUB_USER
ARG GITHUB_EMAIL
ARG SB_PORT
ARG SB_IP
ARG SF_PORT
ARG SF_IP
ARG PARITY_PORT
ARG PARITY_IP
ARG VA_PORT
ARG VA_IP

# env variables
ENV SEALER_BACKEND_PORT=$SB_PORT
ENV SEALER_BACKEND_IP=$SB_IP
ENV SEALER_FRONTEND_PORT=$SF_PORT
ENV SEALER_FRONTEND_IP=$SF_IP
ENV PARITY_NODE_PORT=$PARITY_PORT
ENV PARITY_NODE_IP=$PARITY_IP
ENV VOTING_AUTH_BACKEND_PORT=$VA_PORT
ENV VOTING_AUTH_BACKEND_IP=$VA_IP
ENV REACT_APP_VOTING_AUTH_BACKEND_PORT=$VA_PORT
ENV REACT_APP_VOTING_AUTH_BACKEND_IP=$VA_IP
ENV REACT_APP_SEALER_FRONTEND_PORT=$SF_PORT
ENV REACT_APP_SEALER_FRONTEND_IP=$SF_IP
ENV REACT_APP_SEALER_BACKEND_PORT=$SB_PORT
ENV REACT_APP_SEALER_BACKEND_IP=$SB_IP
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
COPY ./backend/postbuild.sh ./backend/postbuild.sh
COPY ./backend/tsconfig.json ./backend/tsconfig.json
COPY ./backend/wallet ./backend/wallet

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

# Create app directory
WORKDIR /usr/src

# Install app dependencies
COPY --from=builder /usr/src/backend/node_modules /usr/src/backend/node_modules
COPY --from=builder /usr/src/backend/wallet /usr/src/backend/wallet

# copy the dist
COPY --from=builder /usr/src/backend/dist /usr/src/backend/dist
COPY --from=builder /usr/src/frontend/build /usr/src/frontend/build

CMD ["node", "./backend/dist/server.js"]