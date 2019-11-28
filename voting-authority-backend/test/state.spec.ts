export {}
import { expect } from 'chai'
import { describe } from 'mocha'

import * as State from '../src/state/state'

describe('Voting State Tests', () => {
  describe('checkIfStateIsValid - Voting State Change Check', () => {
    it('should pass -> valid input state', () => {
      const state1: string = 'VOTING'
      const state1IsValid: boolean = State.checkIfStateIsValid(state1)
      expect(state1IsValid).to.be.true

      const state2: string = 'PRE_VOTING'
      const state2IsValid: boolean = State.checkIfStateIsValid(state2)
      expect(state2IsValid).to.be.true

      const state3: string = 'POST_VOTING'
      const state3IsValid: boolean = State.checkIfStateIsValid(state3)
      expect(state3IsValid).to.be.true
    })

    it('should fail -> invalid state input', () => {
      const state1: string = null
      const state1IsValid: boolean = State.checkIfStateIsValid(state1)
      expect(state1IsValid).to.be.false

      const state2: string = ''
      const state2IsValid: boolean = State.checkIfStateIsValid(state2)
      expect(state2IsValid).to.be.false

      const state3: string = 'AFTER_VOTING'
      const state3IsValid: boolean = State.checkIfStateIsValid(state3)
      expect(state3IsValid).to.be.false
    })
  })
})
