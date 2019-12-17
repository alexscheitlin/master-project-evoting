FROM node:12-alpine

# Create app directory
WORKDIR /usr/src/backend

# Install app dependencies
COPY package*.json ./

RUN npm install --force
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .