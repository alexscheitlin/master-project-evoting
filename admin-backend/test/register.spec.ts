export {}
import { expect } from 'chai'
import { describe } from 'mocha'
import sinon from 'sinon'
import * as Registration from '../src/register'

describe('Voter Registration Tests', () => {
  describe('Ethereum Address Validation Tests', () => {
    beforeEach(() => {
      // stub for the DB call -> returns an empty list
      sinon
        .stub(Registration, 'getFromDB')
        .withArgs('registeredAddresses')
        .returns([''])
    })

    afterEach(() => {
      sinon.restore()
    })

    it('should fail -> since address is empty', () => {
      const address: string = ''
      const isValid: boolean = Registration.verifyAddress(address)
      expect(isValid).to.be.false
    })

    it('should fail -> since address is not a valid Ethereum address', () => {
      const address: string = 'TestHelloWorld'
      const isValid: boolean = Registration.verifyAddress(address)
      expect(isValid).to.be.false
    })

    it('should pass -> since address it is a valid Ethereum address', () => {
      const address: string = '0xC1595B46c0FBCf185E972D31F443D91C2E2549F8'
      const isValid: boolean = Registration.verifyAddress(address)
      expect(isValid).to.be.true
    })
  })

  describe('Signup Token Validation Tests', () => {
    beforeEach(() => {
      // stubs for the DB calls
      // -> returns an empty list for table: usedSignupTokens
      // -> returns ['ab34920'] for table: validSignupTokens
      sinon
        .stub(Registration, 'getFromDB')
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
