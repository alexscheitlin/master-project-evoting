FROM node:12-alpine as builder 

WORKDIR /usr/src/backend

RUN apk add --no-cache python gcc g++ make

# Install app dependencies
COPY package*.json ./

RUN npm install --force
# If you are building your code for production
# RUN npm ci --only=production

FROM node:12-alpine

# Create app directory
WORKDIR /usr/src/backend

# copy node_modules from previous build step
COPY --from=builder /usr/src/backend/node_modules /usr/src/backend/node_modules

# Bundle app source
COPY . .
COPY ./wallet ./wallet