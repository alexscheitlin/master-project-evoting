FROM node:13-alpine

# Create app directory
WORKDIR /usr/src/backend

# Install app dependencies
COPY package*.json ./

RUN npm install --force
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 CMD [ "curl localhost:4000/state" ]

EXPOSE 4004
CMD [ "npm", "run", "clean:db", "&&", "npm", "run", "serve:dev" ]