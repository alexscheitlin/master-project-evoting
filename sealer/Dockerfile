FROM node:12-alpine as builder

# Create app directory
WORKDIR /usr/src

ARG GITHUB_TOKEN
ARG GITHUB_USER
ARG GITHUB_EMAIL

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

# env variables
ENV VOTING_AUTH_BACKEND_PORT=${VOTING_AUTH_BACKEND_PORT}
ENV VOTING_AUTH_BACKEND_IP=${VOTING_AUTH_BACKEND_IP}
ENV SEALER_BACKEND_PORT=${SEALER_BACKEND_PORT}
ENV SEALER_BACKEND_IP=${SEALER_BACKEND_IP}
ENV SEALER_FRONTEND_PORT=${SEALER_FRONTEND_PORT}
ENV SEALER_FRONTEND_IP=${SEALER_FRONTEND_IP}
ENV PARITY_NODE_PORT=${PARITY_NODE_PORT}
ENV PARITY_NODE_IP=${PARITY_NODE_IP}
ENV NODE_ENV=${NODE_ENV}
ENV REACT_APP_ACCESS_PROVIDER_IP=${ACCESS_PROVIDER_IP}
ENV REACT_APP_ACCESS_PROVIDER_PORT=${ACCESS_PROVIDER_PORT}
ENV REACT_APP_IDENTITY_PROVIDER_PORT=${IDENTITY_PROVIDER_PORT}
ENV REACT_APP_IDENTITY_PROVIDER_IP=${IDENTITY_PROVIDER_IP}
ENV REACT_APP_VOTING_AUTH_BACKEND_PORT=${VOTING_AUTH_BACKEND_PORT}
ENV REACT_APP_VOTING_AUTH_BACKEND_IP=${VOTING_AUTH_BACKEND_IP}

# build backend
RUN cd ./backend && npm run build

# build frontend
RUN cd ./frontend && npm run build

FROM node:12-alpine

# env variables
ENV VOTING_AUTH_BACKEND_PORT=${VOTING_AUTH_BACKEND_PORT}
ENV VOTING_AUTH_BACKEND_IP=${VOTING_AUTH_BACKEND_IP}
ENV SEALER_BACKEND_PORT=${SEALER_BACKEND_PORT}
ENV SEALER_BACKEND_IP=${SEALER_BACKEND_IP}
ENV SEALER_FRONTEND_PORT=${SEALER_FRONTEND_PORT}
ENV SEALER_FRONTEND_IP=${SEALER_FRONTEND_IP}
ENV PARITY_NODE_PORT=${PARITY_NODE_PORT}
ENV PARITY_NODE_IP=${PARITY_NODE_IP}
ENV NODE_ENV=${NODE_ENV}
ENV REACT_APP_ACCESS_PROVIDER_IP=${ACCESS_PROVIDER_IP}
ENV REACT_APP_ACCESS_PROVIDER_PORT=${ACCESS_PROVIDER_PORT}
ENV REACT_APP_IDENTITY_PROVIDER_PORT=${IDENTITY_PROVIDER_PORT}
ENV REACT_APP_IDENTITY_PROVIDER_IP=${IDENTITY_PROVIDER_IP}
ENV REACT_APP_VOTING_AUTH_BACKEND_PORT=${VOTING_AUTH_BACKEND_PORT}
ENV REACT_APP_VOTING_AUTH_BACKEND_IP=${VOTING_AUTH_BACKEND_IP}

# Create app directory
WORKDIR /usr/src

# Install app dependencies
COPY --from=builder /usr/src/backend/node_modules /usr/src/backend/node_modules
COPY --from=builder /usr/src/frontend/node_modules /usr/src/frontend/node_modules

# copy the dist
COPY --from=builder /usr/src/backend/dist /usr/src/backend/dist
COPY --from=builder /usr/src/frontend/build /usr/src/frontend/build

CMD ["node", "./backend/dist/server.js"]