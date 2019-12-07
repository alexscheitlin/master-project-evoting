FROM node:12

# Create app directory
WORKDIR /usr/src/backend

# Install app dependencies
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 4004
CMD [ "npm", "run", "serve:dev" ]