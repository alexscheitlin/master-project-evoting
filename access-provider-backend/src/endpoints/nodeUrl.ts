import express from 'express';
import { serverConfig } from '../config';

const router: express.Router = express.Router()

router.get('/getNodeURL', (req, res) => {
  res.status(200).json({ node: serverConfig.nodeUrl })
})

export default router
