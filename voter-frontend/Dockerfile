FROM node:12-alpine as builder

ARG AP_IP
ARG AP_PORT
ARG IP_IP
ARG IP_PORT

# env variables
ENV REACT_APP_ACCESS_PROVIDER_PORT=$AP_PORT
ENV REACT_APP_ACCESS_PROVIDER_IP=$AP_IP
ENV REACT_APP_IDENTITY_PROVIDER_PORT=$IP_PORT
ENV REACT_APP_IDENTITY_PROVIDER_IP=$IP_IP
ENV PORT=3000
ENV NODE_ENV=development

# create app directory
WORKDIR /usr/code

# install build dependencies
RUN apk add --no-cache bash python make g++ gcc openssh-client git

# copy the src & public folder
COPY . .
COPY .env ./.env

# install all dependencies (including dev)
RUN npm install

# build the frontend
RUN npm run build

## STAGE 2 -> only copy the important stuff from the previous stage
FROM node:12-alpine

# create app directory
WORKDIR /usr/code

# install serve
ENV NODE_ENV=production
RUN npm install -g serve

# copy the output (build & public) folder
COPY --from=builder /usr/code/build /usr/code/build
COPY --from=builder /usr/code/.env /usr/code/.env
COPY --from=builder /usr/code/public /usr/code/public

CMD ["serve", "-d -s build -l tcp://172.1.1.30:3000"]