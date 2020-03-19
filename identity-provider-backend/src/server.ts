import cors from 'cors'
import { config } from 'dotenv'
import express from 'express'

import { setupDB } from './database/database'
import getToken from './endpoints/getToken'
import register from './endpoints/register'
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
    origin: ['http://localhost:3000', 'http://172.1.1.30:3000', 'http://localhost:4003', 'http://172.1.1.43:4003'],
  })
)

// add all routes
server.use('/', register)
server.use('/', getToken)

// setup the database
setupDB()

// start the Express server
server.listen(process.env.IDENTITY_PROVIDER_BACKEND_PORT, () => {
  console.log(
    `HTTP server started at http://${process.env.IDENTITY_PROVIDER_BACKEND_IP}:${process.env.IDENTITY_PROVIDER_BACKEND_PORT}`
  )
})
