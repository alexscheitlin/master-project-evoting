export {}
import fs from 'fs'
import { expect } from 'chai'
import { describe } from 'mocha'
import sinon from 'sinon'

import * as Chainspec from '../src/endpoints/chainspec'
import * as DB from '../src/database/database'

const CHAINSPEC: string = 'chainspec'

describe('Chainspec Tests', () => {
  describe('addValidatorToChainspec - Custom Chainspec Creation', () => {
    let defaultChainspec

    before(() => {
      defaultChainspec = JSON.parse(fs.readFileSync('./src/database/defaultChainspec.json', 'utf-8'))
    })

    beforeEach(() => {
      // create a deep clone of the DB object such that we only have to read the object once
      // but can modify, null, and reuse it multiple times without interfering with other tests
      const chainspecCopy = JSON.parse(JSON.stringify(defaultChainspec))

      // stubs for the DB calls
      // -> returns a chainspec containing a single validator for table: chainspec
      sinon
        .stub(DB, 'getObjectFromDB')
        .withArgs('chainspec')
        .returns(chainspecCopy)
    })

    afterEach(() => {
      sinon.restore()
    })

    it('should test -> valid addition of validator to chainspec', () => {
      const address: string = '0xC1595B46c0FBCf185E972D31F443D91C2E2549F8'
      const oldChainspec: any = DB.getObjectFromDB(CHAINSPEC)
      const newChainspec: any = Chainspec.addValidatorToChainspec(oldChainspec, address)

      const validator: string = newChainspec['engine']['authorityRound']['params']['validators']['list'][0]
      expect(validator).to.eql(address)
    })

    it('should throw Error -> unable to retrieve chainspec', () => {
      const address: string = '0xC1595B46c0FBCf185E972D31F443D91C2E2549F1'
      const oldChainspec: any = null

      // needs a lambda function so that expect can call the function itself
      expect(() => Chainspec.addValidatorToChainspec(oldChainspec, address)).to.throw(
        TypeError,
        'Cannot read chainspec since it is null.'
      )
    })

    it('should throw Error -> random part in JSON is null', () => {
      const address: string = '0xC1595B46c0FBCf185E972D31F443D91C2E2549F8'
      const oldChainspec: any = DB.getObjectFromDB(CHAINSPEC)
      oldChainspec['engine']['authorityRound']['params'] = null

      // needs a lambda function so that expect can call the function itself
      expect(() => Chainspec.addValidatorToChainspec(oldChainspec, address)).to.throw(TypeError)
    })

    it('should throw Error -> unable to retrieve validators from chainspec', () => {
      const address: string = '0xC1595B46c0FBCf185E972D31F443D91C2E2549F8'
      const oldChainspec: any = DB.getObjectFromDB(CHAINSPEC)
      oldChainspec['engine']['authorityRound']['params']['validators']['list'] = null

      // needs a lambda function so that expect can call the function itself
      expect(() => Chainspec.addValidatorToChainspec(oldChainspec, address)).to.throw(
        TypeError,
        'Validators cannot be retrieved from chainspec since it is null.'
      )
    })
  })

  //describe('GET Tests', () => {})

  //describe('POST Tests', () => {})
})
