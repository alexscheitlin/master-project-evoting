import express from 'express'
import { getListFromDB } from '../database/database'
import { Identity, IdentityToken } from '../models'

const router: express.Router = express.Router()

// database table names
const IDENTITIES: string = 'identities'
const TOKENS: string = 'tokens'

// http response messages
const SUCCESS_MSG: string = 'Successfully stored tokens!'
const INVALID: string = 'Authentication failed!'
const NOT_REGISTERED: string = 'This user is not registered for voting!'

export const doesUserExist = (identities: Identity[], username: string): boolean => {
  return identities.map(i => i.username).includes(username)
}

export const isPasswordCorrect = (identities: Identity[], username: string, password: string): boolean => {
  const identity: Identity | undefined = identities.find(i => i.username === username)

  if (!identity) {
    return false
  }

  return identity.password === password
}

export const getUuid = (identities: Identity[], username: string): string => {
  const identity: Identity | undefined = identities.find(i => i.username === username)

  if (!identity) {
    return ''
  }

  return identity.uuid
}

export const getToken = (tokens: IdentityToken[], uuid: string): string => {
  const token: IdentityToken | undefined = tokens.find(t => t.uuid == uuid)

  if (!token) {
    return ''
  }

  return token.token
}

router.post('/getToken', (req, res) => {
  const username: string = req.body.username
  const password: string = req.body.password
  const identities = <Identity[]>getListFromDB(IDENTITIES)
  const tokens = <IdentityToken[]>getListFromDB(TOKENS)

  if (!doesUserExist(identities, username)) {
    res.status(400).json({ success: false, msg: INVALID + `username ${username}` })
    return
  }

  if (!isPasswordCorrect(identities, username, password)) {
    res.status(400).json({ success: false, msg: INVALID + `password ${password}` })
    return
  }

  const token = getToken(tokens, getUuid(identities, username))

  if (!token) {
    res.status(400).json({ success: false, msg: NOT_REGISTERED })
    return
  }

  res.status(201).json({ success: true, msg: SUCCESS_MSG, token: token })
})

export default router
