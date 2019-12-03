import express from 'express'
import https from 'https'
import fs from 'fs'
import helmet from 'helmet'
import cors from 'cors'

import { config } from 'dotenv'
import { resolve } from 'path'

import logger from './utils/logger'
import register from './registration/register'
import sendTokens from './registration/sendTokens'
import { setupDB } from './database/database'

// load environment variables based on NODE_ENV
const isProduction: boolean = process.env.NODE_ENV === 'production' ? true : false
const DOTENV_FILE: string = isProduction ? '.production' : '.development'
config({ path: resolve(__dirname, `../envs/.env${DOTENV_FILE}`) })

// setup express server with request body parsing and logging
const server = express()
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(logger)
server.use(cors({ origin: 'http://localhost:3000' }))

// add all routes
server.use('/', register)
server.use('/', sendTokens)

// setup the database
setupDB()

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
  https.createServer(options, server).listen(process.env.PORT, () => {
    console.log(`HTTPS server started at https://localhost:${process.env.PORT}`)
  })
} else {
  // start the Express server
  server.listen(process.env.PORT, () => {
    console.log(`HTTP server started at http://localhost:${process.env.PORT}`)
  })
}
