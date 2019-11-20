import express from 'express'
import https from 'https'
import fs from 'fs'
import helmet from 'helmet'

import { config } from 'dotenv'
import { resolve } from 'path'

import logger from './logger'
import register from './register'

// load environment variables based on NODE_ENV
const isProduction: boolean = process.env.NODE_ENV === 'production' ? true : false
const DOTENV_FILE: string = isProduction ? '.production' : '.development'
config({ path: resolve(__dirname, `../envs/.env${DOTENV_FILE}`) })

const server = express()
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(logger)

// add all routers
server.use('/', register)

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
