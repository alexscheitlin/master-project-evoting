import cors from 'cors'
import { config } from 'dotenv'
import express from 'express'
import fs from 'fs'
import path from 'path'

import { setupDB } from './database/database'
import chainspec from './routes/chainspec'
import generateKeys from './routes/generateKeys'
import peer from './routes/peer'
import register from './routes/register'
import state from './routes/state'
import decrypt from './routes/decrypt'
import deploy from './routes/deploy'
import ballotState from './routes/ballotState'
import logger from './utils/logger'

config()

// setup express server with request body parsing and logging
const server = express()
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(logger)
server.use(
  cors({
    origin: [
      `http://${process.env.SEALER_FRONTEND_IP}:${process.env.SEALER_FRONTEND_PORT}`,
      `http://localhost:${process.env.SEALER_FRONTEND_PORT}`,
    ],
  })
)

// add all routes
server.use('/', register)
server.use('/', generateKeys)
server.use('/', chainspec)
server.use('/', peer)
server.use('/', state)
server.use('/', decrypt)
server.use('/', deploy)
server.use('/', ballotState)

// static serving of frontend
const localPath: string = '/../../frontend/build/'
const dockerPath: string = '/../../../frontend/build/'

if (fs.existsSync(path.join(__dirname, localPath))) {
  console.log(path.join(__dirname, localPath), 'exists!')
  server.use(express.static(path.join(__dirname, localPath)))

  server.get('/', (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname, localPath, 'index.html'))
  })
} else if (fs.existsSync(path.join(__dirname, dockerPath))) {
  console.log(path.join(__dirname, dockerPath), 'exists!')
  server.use(express.static(path.join(__dirname, dockerPath)))

  server.get('/', (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname, dockerPath, 'index.html'))
  })
} else {
  console.log("No path exists! -> check the 'build' folder of the frontend.")
}

// setup the database
setupDB()

server.listen({ port: process.env.SEALER_BACKEND_PORT }, () => {
  console.log(`HTTP server started at http://${process.env.SEALER_BACKEND_IP}:${process.env.SEALER_BACKEND_PORT}.`)
  console.log(
    `The sealer frontend runs here: http://${process.env.SEALER_FRONTEND_IP}:${process.env.SEALER_FRONTEND_PORT}`
  )
  console.log(
    `This sealer's parity node will be running on http://${process.env.PARITY_NODE_IP}:${process.env.PARITY_NODE_PORT}.`
  )
  console.log()
})
