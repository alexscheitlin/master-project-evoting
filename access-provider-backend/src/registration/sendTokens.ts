import express from 'express'
import { addToList } from '../database/database'

const router: express.Router = express.Router()

// database table names
const VALID_SIGNUP_TOKENS: string = 'validSignupTokens'

// http response messages
const SUCCESS_MSG: string = 'Successfully stored tokens!'

router.post('/sendTokens', (req, res) => {
  const tokens: string[] = req.body.tokens || []
  addToList(VALID_SIGNUP_TOKENS, tokens)
  res.status(201).json({ success: true, msg: SUCCESS_MSG })
})

export default router
