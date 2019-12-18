import { expect } from 'chai'
import { describe } from 'mocha'

import * as Shuffle from '../src/utils/shuffle'

describe('Shuffle', () => {
  it('should shuffle an array', () => {
    var array = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    var shuffledArray = Shuffle.shuffle(array)

    expect(array.length).to.be.equal(shuffledArray.length)

    let counter = 0
    for (let i = 0; i < array.length; i++) {
      array[i] === shuffledArray[i] && counter++
    }

    expect(array.length).not.to.be.equal(counter)
  })
})
