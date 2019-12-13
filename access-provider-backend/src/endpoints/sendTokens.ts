import express from 'express';

import { addToList, VALID_TOKENS_TABLE } from '../database/database';

const router: express.Router = express.Router()

// http response messages
const SUCCESS_MSG: string = 'Successfully stored tokens!'

router.post('/sendTokens', (req, res) => {
  const tokens: string[] = req.body.tokens || []
  addToList(VALID_TOKENS_TABLE, tokens)
  res.status(201).json({ success: true, msg: SUCCESS_MSG })
})

export default router
