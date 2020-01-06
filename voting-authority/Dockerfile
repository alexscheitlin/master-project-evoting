FROM node:12-alpine as builder

# variables used to perform npm-cli-login
ARG GITHUB_TOKEN
ARG GITHUB_USER
ARG GITHUB_EMAIL

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

# env variables
ENV VOTING_AUTH_BACKEND_PORT=4001
ENV VOTING_AUTH_BACKEND_IP=172.1.1.41
ENV VOTING_AUTH_FRONTEND_PORT=3001
ENV VOTING_AUTH_FRONTEND_IP=localhost
ENV PARITY_NODE_PORT=7011
ENV PARITY_NODE_IP=172.1.1.171
ENV NODE_ENV=production
ENV REACT_APP_AUTH_FRONTEND_IP=localhost
ENV REACT_APP_AUTH_PORT=3001
ENV REACT_APP_AUTH_BACKEND_IP=172.1.1.41
ENV REACT_APP_AUTH_BACKEND_PORT=4001

# build backend
RUN cd ./backend && npm run build

# build frontend
RUN cd ./frontend && npm run build

FROM node:12-alpine

# env variables
ENV VOTING_AUTH_BACKEND_PORT=4001
ENV VOTING_AUTH_BACKEND_IP=172.1.1.41
ENV VOTING_AUTH_FRONTEND_PORT=3001
ENV VOTING_AUTH_FRONTEND_IP=localhost
ENV PARITY_NODE_PORT=7011
ENV PARITY_NODE_IP=172.1.1.171
ENV NODE_ENV=production
ENV REACT_APP_AUTH_FRONTEND_IP=localhost
ENV REACT_APP_AUTH_PORT=3001
ENV REACT_APP_AUTH_BACKEND_IP=172.1.1.41
ENV REACT_APP_AUTH_BACKEND_PORT=4001

# Create app directory
WORKDIR /usr/src

# Install app dependencies
COPY --from=builder /usr/src/backend/node_modules /usr/src/backend/node_modules
COPY --from=builder /usr/src/frontend/node_modules /usr/src/frontend/node_modules

# copy the dist
COPY --from=builder /usr/src/backend/dist /usr/src/backend/dist
COPY --from=builder /usr/src/frontend/build /usr/src/frontend/build

EXPOSE 4001

CMD ["node", "./backend/dist/src/server.js"]