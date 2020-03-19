FROM node:12-alpine as builder

# variables used during the build
ARG IP_PORT
ARG IP_IP
ARG AP_PORT
ARG AP_IP

# env variables
ENV IDENTITY_PROVIDER_BACKEND_PORT=$IP_PORT
ENV IDENTITY_PROVIDER_BACKEND_IP=$IP_IP
ENV ACCESS_PROVIDER_BACKEND_PORT=$AP_PORT
ENV ACCESS_PROVIDER_BACKEND_IP=$AP_IP
ENV NODE_ENV=development

# Create app directory
WORKDIR /usr/code

# install build dependencies
RUN apk add --no-cache bash python make g++ gcc openssh-client git

# Install app dependencies
COPY package*.json ./
COPY ./src ./src

RUN npm install

COPY tsconfig.json ./
COPY postbuild.sh ./
COPY ./src/database/db_default.json ./src/database/
COPY ./src/database/db.json ./src/database/
COPY ./src/database/identities ./src/database/
RUN npm run build   

# remove the dev node_modules and install the production version (backend-only)
RUN rm -rf ./node_modules
RUN npm install --production

## STAGE 2 -> only copy the important stuff from the previous stage
FROM node:12-alpine

# env variables
ENV NODE_ENV=production

# create app directory
WORKDIR /usr/code

# copy the backend: production node_modules
COPY --from=builder /usr/code/node_modules /usr/code/node_modules

# copy the output (dist) folder
COPY --from=builder /usr/code/dist /usr/code/dist

CMD ["node", "./dist/server.js"]
