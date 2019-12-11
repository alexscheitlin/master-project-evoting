FROM node:13-alpine

# Create app directory
WORKDIR /usr/src/frontend

# Install app dependencies
COPY package*.json ./

RUN npm install --force
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 40004
CMD [ "npm", "run", "start" ]