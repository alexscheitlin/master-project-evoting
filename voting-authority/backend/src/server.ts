import cors from 'cors'
import { config } from 'dotenv'
import express from 'express'
import fs from 'fs'
import helmet from 'helmet'
import https from 'https'

import { setupDB } from './database/database'
import chainspec from './endpoints/chainspec'
import connection from './endpoints/connection'
import deploy from './endpoints/deploy'
import publicKey from './endpoints/publicKey'
import state from './endpoints/state'
import { requestLogger, responseLogger } from './utils/logger'

config()

// setup express server with request body parsing and logging
const server = express()
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(requestLogger)
server.use(responseLogger)
server.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3010',
      'http://localhost:3011',
      'http://localhost:3012',
      'http://localhost:3013',
      'http://localhost:4002',
      'http://172.1.1.131:3011', // sealer 1 frontend,
      'http://172.1.1.132:3012', // sealer 2 frontend,
      'http://172.1.1.133:3013', // sealer 3 frontend
      `http://${process.env.VOTING_AUTH_FRONTEND_IP}:${process.env.VOTING_AUTH_FRONTEND_PORT}`,
      `http://172.1.1.173:7013`,
      `http://localhost:7013`,
      `http://172.1.1.172:7012`,
      `http://localhost:7012`,
      `http://172.1.1.171:7011`,
      `http://localhost:7011`
    ],
  })
)
// add all routes
server.use('/', chainspec)
server.use('/', connection)
server.use('/', deploy)
server.use('/', publicKey)
server.use('/', state)

// setup the database
setupDB()

const isProduction = false
if (isProduction) {
  // adds the "Strict-Transport-Security" header.
  server.use(
    helmet.hsts({
      // one year
      maxAge: 31536000,
      includeSubDomains: true,
      force: true,
    })
  )

  // certificates need to be loaded as well
  const options: https.ServerOptions = {
    key: fs.readFileSync('./keys/cert/localhost.key'),
    cert: fs.readFileSync('./keys/cert/localhost.crt'),
    passphrase: process.env.passphrase,
    minVersion: 'TLSv1.2',
    ciphers: ['ECDHE-ECDSA-AES256-GCM-SHA384', 'ECDHE-ECDSA-AES128-GCM-SHA256', '!RC4', '!MD5', '!aNULL'].join(':'),
    ecdhCurve: 'prime256v1',

    // must be enabled if client certificate shall be requested
    requestCert: false,
  }

  // we will pass our 'server' to 'https'
  https.createServer(options, server).listen(process.env.VOTING_AUTH_BACKEND_PORT, () => {
    console.log(`HTTPS server started at https://${process.env.VOTING_AUTH_BACKEND_IP}:${process.env.VOTING_AUTH_BACKEND_PORT}`)
  })
} else {
  // start the Express server
  server.listen({ port: process.env.VOTING_AUTH_BACKEND_PORT }, () => {
    console.log(`HTTP server started at http://${process.env.VOTING_AUTH_BACKEND_IP}:${process.env.VOTING_AUTH_BACKEND_PORT}`)
    console.log('FRONTEND RUNS ON:', `http://${process.env.VOTING_AUTH_FRONTEND_IP}:${process.env.VOTING_AUTH_FRONTEND_PORT}`)
  })
}
