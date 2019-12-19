import React, { useState } from 'react'

import LoginForm from '../components/LoginForm/LoginForm'
import { EIdentityProviderService } from '../services'
import { useVoterStore } from '../store'
import { delay } from '../util/helper'

const LoginPage: React.FC = () => {
  const voterState = useVoterStore()
  const [loading, setLoading] = useState(false)

  const handleLogin = async (username: string, password: string): Promise<void> => {
    try {
      setLoading(true)
      await delay(500)
      const token = await EIdentityProviderService.getToken(username, password)
      setLoading(false)
      voterState.setToken(token)
      voterState.setAuthenicated(true)
      voterState.setError(false)
      voterState.setMessage('')
    } catch (error) {
      console.log(error)
      setLoading(false)
      voterState.setError(true)
      voterState.setMessage('Login failed. Wrong username or password.')
      voterState.logout()
    }
  }

  return <LoginForm onLogin={handleLogin} loading={loading} />
}

export default LoginPage
