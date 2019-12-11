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
COPY ./wallet ./wallet
COPY ./mp-crypto ./mp-crypto

EXPOSE 4004

RUN chmod +x crypto.sh
RUN ./crypto.sh

# RUN yes |cp -rf ./node_modules/mp-crypto/node_modules/elliptic/lib/elliptic/curves.js ./node_modules/elliptic/lib/elliptic/curves.js

CMD ["npm", "run", "serve:dev" ]