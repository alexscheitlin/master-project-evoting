import React, { useState } from 'react'

import LoginForm from '../components/LoginForm/LoginForm'
import { EIdentityProviderService } from '../services'
import { useErrorStore, useVoterStore } from '../store'
import { delay } from '../util/helper'
import { Snack } from '../components/Snackbar'

const LoginPage: React.FC = () => {
  const voterState = useVoterStore()
  const [loading, setLoading] = useState(false)
  const errorState = useErrorStore()

  const handleLogin = async (username: string, password: string): Promise<void> => {
    try {
      setLoading(true)
      await delay(500)
      const token = await EIdentityProviderService.getToken(username, password)
      setLoading(false)
      voterState.setToken(token)
      voterState.setAuthenicated(true)
      errorState.open('Successfully logged in', Snack.SUCCESS)
    } catch (error) {
      console.log(error)
      setLoading(false)
      voterState.logout()
      errorState.open('Login failed. Wrong username or password.', Snack.ERROR)
    }
  }

  return <LoginForm onLogin={handleLogin} loading={loading} />
}

export default LoginPage
