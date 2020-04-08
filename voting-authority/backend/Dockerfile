FROM node:12-alpine as builder

# Create app directory
WORKDIR /usr/src/backend

# install build dependencies
RUN apk add --no-cache bash python make g++ gcc openssh-client git

# copy package json
COPY package*.json ./
COPY .npmrc ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

FROM node:12-alpine

# Create app directory
WORKDIR /usr/src/backend

COPY --from=builder /usr/src/backend/node_modules /usr/src/backend/node_modules

# Bundle app source
COPY . .

CMD npm run serve:dev:clean