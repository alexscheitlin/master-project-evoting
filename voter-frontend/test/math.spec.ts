const BigNumberVerifier = artifacts.require('../contracts/BigNumberVerifier.sol');
const BN = require("bn.js")

const { createRandomInputVariable, smallRandom } = require("../test/helper/helper")

contract.only('Test BigNumberLib Math', () => {
  it(`Test Simple Addition`, async function () {
    // deploy contract and pass system parameters
    const verifierInstance = await BigNumberVerifier.new();
    const depl = await BigNumberVerifier.deployed();
    console.log(depl)

    for (let i = 0; i < 5; i++) {

      const a = smallRandom()
      const b = smallRandom()

      const a_bn = new BN(a.value, 16);
      const b_bn = new BN(b.value, 16);
      console.log("a:", a_bn.toString(10), "b:", b_bn.toString(10))

      const a_hex = "0x" + a_bn.toString(16)
      const b_hex = "0x" + b_bn.toString(16)
      console.log(a_hex, b_hex)

      const a_bitlen = a_bn.bitLength()
      const b_bitlen = b_bn.bitLength()

      console.log("local result = \t", a_bn.add(b_bn).toString(10))

      const result = await depl.testAddition(a_hex, a_bitlen, b_hex, b_bitlen)
      console.log(result)
      // .then(function (result) {
      //   console.log("a:", result['logs'][0]['args']['0'].toString(10))
      //   console.log("b:", result['logs'][1]['args']['0'].toString(10))
      //   console.log("eth result = \t", result['logs'][2]['args']['0'].toString(10))
      //   console.log(result)
      // }).catch(function (error) {
      //   console.log(error)
      // })
    }
  });
});
