import cors from 'cors'
import { config } from 'dotenv'
import express from 'express'

import { setupDB } from './database/database'
import nodeUrl from './endpoints/nodeUrl'
import register from './endpoints/register'
import sendTokens from './endpoints/sendTokens'
import { requestLogger, responseLogger } from './utils/logger'

config()

// setup express server with request body parsing and logging
const server = express()
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(requestLogger)
server.use(responseLogger)
server.use(cors({ origin: 'http://localhost:3000' }))

// add all routes
server.use('/', nodeUrl)
server.use('/', register)
server.use('/', sendTokens)

// setup the database
setupDB()

// start the Express server
server.listen(process.env.ACCESS_PROVIDER_BACKEND_PORT, () => {
  console.log(`HTTP server started at http://${process.env.ACCESS_PROVIDER_BACKEND_IP}:${process.env.ACCESS_PROVIDER_BACKEND_PORT}`)
})
