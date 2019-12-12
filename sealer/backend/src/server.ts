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
server.use(
  cors({ origin: [`http://localhost:${process.env.FRONTEND_PORT}`, `http://${process.env.FRONTEND_IP}:${process.env.FRONTEND_PORT}`] })
)

// add all routes
server.use('/', register)
server.use('/', generateKeys)
server.use('/', chainspec)
server.use('/', peer)

// setup the database
setupDB()

server.listen({ port: process.env.SEALER_BE_PORT }, () => {
  console.log(`HTTP server started at http://${process.env.SEALER_BE_IP}:${process.env.SEALER_BE_PORT}.`)
  console.log(`The sealer frontend runs here: ${process.env.FRONTEND_IP}:${process.env.FRONTEND_PORT}`)
  console.log(
    `This sealer's backend has IP: ${process.env.VOTE_AUTH_NETWORK_IP} in vote-auth network. Such that it can connect to the voting-authority backend ${process.env.VOTING_AUTH_BE_IP}:${process.env.VOTING_AUTH_BE_PORT}`
  )
  console.log(
    `This sealer's parity node will be running on ${process.env.PARITY_NODE_IP}:${process.env.SEALER_NODE_PORT}. Sealer's IP in parity-nodes network: ${process.env.PARITY_NETWORK_IP}`
  )
  console.log()
})
