import express from 'express'
import fs from 'fs'
import helmet from 'helmet'
import cors from 'cors'

import { config } from 'dotenv'

import logger from './utils/logger'
import { setupDB } from './database/database'
import register from './routes/register'
import boot from './routes/boot'

config()

// setup express server with request body parsing and logging
const server = express()
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(logger)
server.use(cors({ origin: 'http://localhost:' + process.env.FRONTEND_PORT }))

// add all routes
server.use('/', register)
server.use('/', boot)

// setup the database
setupDB()

console.log(process.env.FRONTEND_PORT)

server.listen(4000, () => {
  console.log(`HTTP server started at http://localhost:${4000}`)
  console.log(`The chain can be reached via: ${process.env.CHAIN_URL} if it's running`)
})
