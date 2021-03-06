import cors from 'cors'
import { config } from 'dotenv'
import express from 'express'
import path from 'path'
import fs from 'fs'

import { setupDB } from './database/database'
import chainspec from './endpoints/chainspec'
import connection from './endpoints/connection'
import deploy from './endpoints/deploy'
import publicKey from './endpoints/publicKey'
import state from './endpoints/state'
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
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3010',
      'http://localhost:3011',
      'http://localhost:3012',
      'http://localhost:3013',
      'http://localhost:4002',
      'http://172.1.1.131:3011', // sealer 1 frontend,
      'http://172.1.1.132:3012', // sealer 2 frontend,
      'http://172.1.1.133:3013', // sealer 3 frontend
      'http://172.1.1.141:4011', // sealer 1 backend,
      'http://172.1.1.142:4012', // sealer 2 backend,
      'http://172.1.1.143:4013', // sealer 3 backend
      `http://${process.env.VOTING_AUTH_FRONTEND_IP}:${process.env.VOTING_AUTH_FRONTEND_PORT}`,
      `http://172.1.1.173:7013`,
      `http://localhost:7013`,
      `http://172.1.1.172:7012`,
      `http://localhost:7012`,
      `http://172.1.1.171:7011`,
      `http://localhost:7011`,
    ],
  })
)

// add all routes
server.use('/', chainspec)
server.use('/', connection)
server.use('/', deploy)
server.use('/', publicKey)
server.use('/', state)

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

// start the Express server
server.listen({ port: process.env.VOTING_AUTH_BACKEND_PORT }, () => {
  console.log(
    `HTTP server started at http://${process.env.VOTING_AUTH_BACKEND_IP}:${process.env.VOTING_AUTH_BACKEND_PORT}`
  )
  console.log(
    'FRONTEND RUNS ON:',
    `http://${process.env.VOTING_AUTH_FRONTEND_IP}:${process.env.VOTING_AUTH_FRONTEND_PORT}`
  )
})
