export {}
import { expect } from 'chai'
import { describe } from 'mocha'
import sinon from 'sinon'
import * as Utils from '../src/utils/addressVerification'
import * as DB from '../src/database/database'

describe('Utils Tests', () => {
  describe('verifyAddress - Ethereum Address Validation Tests', () => {
    const TABLE_VOTERS: string = 'voters'

    beforeEach(() => {
      // stub for the DB call -> returns an empty list
      sinon
        .stub(DB, 'getListFromDB')
        .withArgs('voters')
        .returns([''])
    })

    afterEach(() => {
      sinon.restore()
    })

    it('should fail -> since address is empty', () => {
      const address: string = ''
      const isValid: boolean = Utils.verifyAddress(TABLE_VOTERS, address)
      expect(isValid).to.be.false
    })

    it('should fail -> since address is not a valid Ethereum address', () => {
      const invalidAddress: string = 'TestHelloWorld'
      const isAddressValid: boolean = Utils.verifyAddress(TABLE_VOTERS, invalidAddress)
      expect(isAddressValid).to.be.false

      const anotherInvalidAddress: string = '0xC1595B46c0FBCf185E972D31F443D91C2E2549F1'
      const isOtherAddressValid: boolean = Utils.verifyAddress(TABLE_VOTERS, anotherInvalidAddress)
      expect(isOtherAddressValid).to.be.false
    })

    it('should pass -> since address it is a valid Ethereum address', () => {
      const validAddress: string = '0xC1595B46c0FBCf185E972D31F443D91C2E2549F8'
      const isAddressValid: boolean = Utils.verifyAddress(TABLE_VOTERS, validAddress)
      expect(isAddressValid).to.be.true

      const anotherValidAddress: string = '0xc1912fee45d61c87cc5ea59dae31190fffff232d'
      const isOtherAddressValid: boolean = Utils.verifyAddress(TABLE_VOTERS, anotherValidAddress)
      expect(isOtherAddressValid).to.be.true
    })
  })
})
