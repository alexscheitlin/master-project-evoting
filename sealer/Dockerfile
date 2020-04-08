FROM node:12-alpine as builder

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

# create app directory
WORKDIR /usr/src

# install build dependencies
RUN apk add --no-cache bash python make g++ gcc openssh-client git

# copy the backend folder and install the backend
COPY ./backend ./backend
RUN cd ./backend && npm i

# copy the frontend folder and install the frontend
COPY ./frontend ./frontend
RUN cd ./frontend && npm i

# build backend
RUN cd ./backend && npm run build

# build frontend
RUN cd ./frontend && npm run build

# remove the dev node_modules and install the production version (backend-only)
RUN rm -rf ./backend/node_modules
RUN cd ./backend && npm i --production

## STAGE 2 -> only copy the important stuff from the previous stage
FROM node:12-alpine

# create app directory
WORKDIR /usr/src

# copy the backend: production node_modules and wallet folder
COPY --from=builder /usr/src/backend/node_modules /usr/src/backend/node_modules
COPY --from=builder /usr/src/backend/wallet /usr/src/backend/wallet

# copy the output (dist and build) folder
COPY --from=builder /usr/src/backend/dist /usr/src/backend/dist
COPY --from=builder /usr/src/frontend/build /usr/src/frontend/build

CMD ["node", "./backend/dist/server.js"]