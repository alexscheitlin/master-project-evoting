import cors from 'cors'
import { config } from 'dotenv'
import express from 'express'

import { setupDB } from './database/database'
import chainspec from './routes/chainspec'
import generateKeys from './routes/generateKeys'
import peer from './routes/peer'
import register from './routes/register'
import logger from './utils/logger'

config()

// setup express server with request body parsing and logging
const server = express()
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(logger)
server.use(cors({ origin: 'http://localhost:' + process.env.FRONTEND_PORT }))

// add all routes
server.use('/', register)
server.use('/', generateKeys)
server.use('/', chainspec)
server.use('/', peer)

// setup the database
setupDB()

console.log(process.env.FRONTEND_PORT)

server.listen(process.env.BACKEND_PORT, () => {
  console.log(`HTTP server started at http://localhost:${process.env.BACKEND_PORT}`)
  console.log(`This parity node will be running on ${process.env.SEALER_NODE_PORT}`)
})
