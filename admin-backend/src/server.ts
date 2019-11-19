import express from 'express'
import https from 'https'
import fs from 'fs'
import helmet from 'helmet'

import { config } from 'dotenv'
import { resolve } from 'path'

// load environment variables based on NODE_ENV
const isProduction: boolean = process.env.NODE_ENV === 'production' ? true : false
const DOTENV_FILE: string = isProduction ? '.production' : '.development'
config({ path: resolve(__dirname, `../envs/.env${DOTENV_FILE}`) })

const server = express()

// default route to test
server.get('/', (req, res) => {
  res.json({
    test: 'Test',
  })
})

if (isProduction) {
  // adds helmet middleware for security
  server.use(helmet())

  // certificates need to be loaded as well
  const options = {
    key: fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/cert.pem'),
    passphrase: process.env.passphrase,
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
