FROM node:12-alpine as builder

# Create app directory
WORKDIR /usr/src

# install bash
RUN apk add --no-cache bash python make g++ gcc

# Install the app dependencies
COPY ./backend/package*.json ./backend/
RUN cd ./backend && npm i --force

COPY ./frontend/package*.json ./frontend/
RUN cd ./frontend && npm i

COPY ./backend ./backend
COPY ./frontend ./frontend

# Copy over source files of crypto library
COPY ./backend/mp-crypto ./backend/mp-crypto

# This script will install dependencies inside /mp-crypto
# and add the custom weier curve to the elliptic package
RUN chmod +x ./backend/crypto.sh && ./backend/crypto.sh

# build backend
RUN cd ./backend && npm run build
COPY ./backend/src/database/db.json ./backend/dist/src/database/db.json
COPY ./backend/src/database/defaultChainspec.json ./backend/dist/src/database/defaultChainspec.json
COPY ./backend/solidity/toDeploy ./backend/dist/solidity/toDeploy

# build frontend
RUN cd ./frontend && npm run build

FROM node:12-alpine

ENV VOTING_AUTH_BACKEND_PORT=4001
ENV VOTING_AUTH_BACKEND_IP=localhost
ENV VOTING_AUTH_FRONTEND_PORT=3001
ENV VOTING_AUTH_FRONTEND_IP=localhost
ENV PARITY_NODE_PORT=7011
ENV PARITY_NODE_IP=172.1.1.171
ENV NODE_ENV=development
ENV REACT_APP_AUTH_FRONTEND_IP=localhost
ENV REACT_APP_AUTH_PORT=3001
ENV REACT_APP_AUTH_BACKEND_IP=localhost
ENV REACT_APP_AUTH_BACKEND_PORT=4001

# Create app directory
WORKDIR /usr/src

# Install app dependencies
COPY --from=builder /usr/src/backend/node_modules /usr/src/backend/node_modules
COPY --from=builder /usr/src/frontend/node_modules /usr/src/frontend/node_modules

# copy the dist
COPY --from=builder /usr/src/backend/dist /usr/src/backend/dist
COPY --from=builder /usr/src/frontend/build /user/src/frontend/build

EXPOSE 4001
EXPOSE 3001

CMD ["node", "./backend/dist/src/server.js"]