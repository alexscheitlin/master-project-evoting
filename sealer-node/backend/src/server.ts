import express from 'express'
import fs from 'fs'
import helmet from 'helmet'
import cors from 'cors'

import { config } from 'dotenv'

import logger from './utils/logger'
import { setupDB } from './database/database'
import startContainer from './routes/startContainer'

config()

// get NODE_ENV "param"
const NODE_ENV = process.env.NODE_ENV

// setup express server with request body parsing and logging
const server = express()
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(logger)
server.use(cors({ origin: ['http://localhost:3004'] }))

// add all routes
server.use('/', startContainer)

// setup the database
setupDB()

server.listen(process.env.PORT, () => {
  console.log(`HTTP server started at http://localhost:${process.env.PORT}`)
})
