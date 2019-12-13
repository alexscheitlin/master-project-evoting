import cors from 'cors'
import { config } from 'dotenv'
import express from 'express'

import { setupDB } from './database/database'
import chainspec from './routes/chainspec'
import generateKeys from './routes/generateKeys'
import peer from './routes/peer'
import register from './routes/register'
import state from './routes/state'
import logger from './utils/logger'

config()

// setup express server with request body parsing and logging
const server = express()
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(logger)
server.use(
  cors({
    origin: [`http://${process.env.SEALER_FRONTEND_IP}:${process.env.SEALER_FRONTEND_PORT}`],
  })
)

// add all routes
server.use('/', register)
server.use('/', generateKeys)
server.use('/', chainspec)
server.use('/', peer)
server.use('/', state)

// setup the database
setupDB()

server.listen({ port: process.env.SEALER_BACKEND_PORT }, () => {
  console.log(`HTTP server started at http://${process.env.SEALER_BACKEND_IP}:${process.env.SEALER_BACKEND_PORT}.`)
  console.log(`The sealer frontend runs here: http://${process.env.SEALER_FRONTEND_IP}:${process.env.SEALER_FRONTEND_PORT}`)
  console.log(`This sealer's parity node will be running on http://${process.env.PARITY_NODE_IP}:${process.env.PARITY_NODE_PORT}.`)
  console.log()
})
