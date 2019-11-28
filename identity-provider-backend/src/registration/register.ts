import express from 'express'

const router: express.Router = express.Router()

// http response messages
const SUCCESS_MSG: string = 'Successfully registered voters!'

router.post('/registerVoters', (req, res) => {
  const voters: string = req.body.voters
  console.log(voters)

  // TODO: validate and store

  const success: boolean = true

  if (success) {
    res.status(201).json({ success: true, msg: SUCCESS_MSG })
  } else  {
    res.status(400).json({ success: false, msg: 'Ooops' })
  }
})

export default router
