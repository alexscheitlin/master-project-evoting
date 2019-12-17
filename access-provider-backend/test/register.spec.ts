export {}
import { expect } from 'chai'
import { describe } from 'mocha'
import sinon from 'sinon'
import * as Registration from '../src/endpoints/register'
import * as DB from '../src/database/database'

describe('Voter Registration Tests', () => {
  describe('verifyVoterToken - Signup Token Validation Tests', () => {
    beforeEach(() => {
      // stubs for the DB calls
      // -> returns an empty list for table: usedSignupTokens
      // -> returns ['ab34920'] for table: validSignupTokens
      sinon
        .stub(DB, 'getListFromDB')
        .withArgs('usedSignupTokens')
        .returns([''])
        .withArgs('validSignupTokens')
        .returns(['ab89ef0'])
    })

    afterEach(() => {
      sinon.restore()
    })

    it('should fail -> since token is empty', () => {
      const token: string = ''
      const isValid: boolean = Registration.verifyVoterToken(token)
      expect(isValid).to.be.false
    })

    it('should fail -> since address is not a valid Ethereum address', () => {
      const token: string = 'TestHelloWorld'
      const isValid: boolean = Registration.verifyVoterToken(token)
      expect(isValid).to.be.false
    })

    it('should pass -> since address it is a valid Ethereum address', () => {
      const token: string = 'ab89ef0'
      const isValid: boolean = Registration.verifyVoterToken(token)
      expect(isValid).to.be.true
    })
  })
})
