// Insipired by Zcoinofficial
const BigNumberMock = artifacts.require("BigNumberMock");

const BN = require('bn.js')

// wrapper for random number generator in browser -> makes it useable for different browsers
const brorand = require('brorand');

// is the same as native javascript BigInt -> but works as polyfill
const bigInt = require("big-integer");

const { createRandomInputVariable, createBN, createEncodedValue, createBitLength } = require("./helper/helper")

contract('BigNumber Mock Testing', function (accounts) {
  const init_runs = 1;
  for (let run = init_runs; run > 0; run--) {
    it("is prime function:\tRun " + (init_runs - run) + " - create random prime value, assert contract returns true", async function () {
      const instance = await BigNumberMock.new()

      // testing with prime value for zerocoin commitment right now.
      const prime_size = 128;
      let prime;
      let prime_bn;
      console.log("getting prime..")

      do {
        do {
          prime = new brorand.Rand().generate(prime_size);
          prime_bn = new bigInt(prime.toString('hex'), 16);

          //generate random values until we hit a probable prime (relatively fast).
        } while (!(prime_bn.isProbablePrime()));

        //verifies the value is definitely prime (slow).
      } while (!(prime_bn.isPrime()));
      console.log("Prime acquired.")

      //easier to use BN library in general apart from primality test
      prime_bn = new BN(prime, 16);

      //we now need to generate randomness values up to the number of bytes of the input.
      const bit_size = prime_bn.bitLength();
      const num_randomness = bit_size >= 1300 ? 2 :
        bit_size >= 850 ? 3 :
          bit_size >= 650 ? 4 :
            bit_size >= 550 ? 5 :
              bit_size >= 450 ? 6 :
                bit_size >= 400 ? 7 :
                  bit_size >= 350 ? 8 :
                    bit_size >= 300 ? 9 :
                      bit_size >= 250 ? 12 :
                        bit_size >= 200 ? 15 :
                          bit_size >= 150 ? 18 :
                            /* b >= 100 */ 27;

      // ceiling of bitlength / 8
      const num_bytes = Math.ceil(prime_bn.bitLength() / 8);

      //generate 'num_randomness' random values up to bit_size-1
      //send to contract as one value, along with num_randomness, and decode in assembly.
      let randomness = "";

      const mask = Math.pow(2, (prime_bn.bitLength() - 1) % 8) - 1;

      for (let i = 0; i < num_randomness; i++) {
        n = new brorand.Rand().generate(num_bytes);
        n[0] &= mask; //remove leading zeros outside of our range
        randomness = randomness.concat(n.toString('hex'));
      }

      const prime_val = prime_bn.toString('hex')

      //add any leading zeroes (not present from BN)
      const prime_enc = "0x" + (((prime_val.length % 64) != 0) ? "0".repeat(64 - (prime_val.length % 64)) : "") + prime_val

      const randomness_enc = "0x" + randomness

      const result = await instance.mock_is_prime.call(prime_enc, bit_size, randomness_enc, num_randomness)
        .then(function (actual_result) {
          assert.equal(true, actual_result, "returned prime value did not match.");
        })
    });

    it("Division function:\tRun " + (init_runs - run) + " - create random inputs for A and B, div to get C, pass all and assert equality from contract", async function () {
      const instance = await BigNumberMock.new()

      //set values for negative.
      const a_neg = false;
      const b_neg = false;
      const result_neg = false;

      const { value: a_val } = createRandomInputVariable()
      const a_bn = createBN(a_val, a_neg)

      // grab random values for a and b, ensuring b is not 0.
      let b_val;
      let b_bn;

      do {
        const { value: temp } = createRandomInputVariable()
        b_val = temp
        b_bn = createBN(b_val, b_neg)
      } while (b_bn == 0);

      // get result (a/b) and value as string
      const result_bn = a_bn.div(b_bn)
      const result_val = result_bn.toString('hex');

      // create bitlength in encoded form
      const { msb_enc: a_msb_enc } = createBitLength(a_bn)
      const { msb_enc: b_msb_enc } = createBitLength(b_bn)
      const { msb_enc: result_msb_enc } = createBitLength(result_bn)

      // encode vals for call.
      // encode 'extra' as neg||msb (calling separate values not possible so we encode neg and msb into one parameter)
      const { val_enc: a_val_enc, extra_enc: a_extra_enc } = createEncodedValue(a_val, a_neg, a_msb_enc)
      const { val_enc: b_val_enc, extra_enc: b_extra_enc } = createEncodedValue(b_val, b_neg, b_msb_enc)

      // add any leading zeroes (not present from BN)
      const result_val_enc = "0x" + ((result_val.length % 64 != 0) ? "0".repeat(64 - (result_val.length % 64)) : "") + result_val
      const result_extra_enc = "0x" + "0".repeat(63) + ((result_neg == true) ? "1" : "0") + result_msb_enc;

      const expected_result_msb = result_bn.bitLength();

      const result = await instance.mock_bn_div.call(a_val_enc, a_extra_enc, b_val_enc, b_extra_enc, result_val_enc, result_extra_enc)
        .then(function (actual_result) {
          assert.equal(result_val_enc, actual_result[0], "returned val did not match.\na_val: " + a_val + "\nb_val: " + b_val + "\nresult_val: " + result_val_enc + "\na_extra: " + a_extra_enc + "\nb_extra_enc: " + b_extra_enc + "\nresult_extra_enc: " + result_extra_enc + "\n");
          assert.equal(result_neg, actual_result[1], "returned neg did not match.");
          assert.equal(expected_result_msb, actual_result[2].valueOf(), "returned msb did not match.");
        })
    });

    it("Modular inverse function:\tRun " + (init_runs - run) + " - create inputs for base and modulus, get result, pass all, assert contract returns user_result (base*user_result)%modulus==1", async function () {
      const instance = await BigNumberMock.new()

      const a_neg = false
      const m_neg = false

      const { value: a_val } = createRandomInputVariable()
      const { value: m_val } = createRandomInputVariable()

      const a_bn = createBN(a_val, a_neg)
      const m_bn = createBN(m_val, m_neg)

      //get n ((a)(n) == 1 mod m)
      const n_bn = a_bn.invm(m_bn)

      // we're generating random values. if no modinverse exists, we have a revert case.
      const identityElement = a_bn.mul(n_bn).mod(m_bn);
      const valid = (identityElement == 1);

      console.log("identity element\t", identityElement.toString())
      console.log("modinverse exists?\t", valid)

      //get encoded values for call
      const { msb: a_msb_enc } = createBitLength(a_bn)
      const { msb: m_msb_enc } = createBitLength(m_bn)
      const { msb: n_msb_enc } = createBitLength(n_bn)

      const { val_enc: a_val_enc } = createEncodedValue(a_val, a_neg, a_msb_enc)
      const { val_enc: m_val_enc } = createEncodedValue(m_val, m_neg, m_msb_enc)

      // add any leading zeroes (not present from BN after calculation)
      let n_val_enc = n_bn.toString('hex')
      n_val_enc = "0x" + ((n_val_enc.length % 64 != 0) ? "0".repeat(64 - (n_val_enc.length % 64)) : "") + n_val_enc

      const one = "0x0000000000000000000000000000000000000000000000000000000000000001";

      //set false value for result
      const n_neg_enc = false;

      //if modinverse does not exist, execute this first block (ie. catch 'revert'). otherwise call as normal.
      if (!valid) {
        const result = await instance.mock_modinverse.call(a_val_enc, a_msb_enc, m_val_enc, m_msb_enc, n_val_enc, n_msb_enc)
          .then(function (actual_result) {
            assert(false, 'revert encountered');
            return true;
          },
            function (e) {
              assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/, "revert caught.");
            });
      }
      else {
        const result = await instance.mock_modinverse.call(a_val_enc, a_msb_enc, m_val_enc, m_msb_enc, n_val_enc, n_msb_enc)
          .then(function (actual_result) {
            // console.log(actual_result);
            assert.equal(n_val_enc, actual_result[0], "returned val did not match. \na_val: " + a_val_enc + "\nm_val: " + m_val_enc);
            assert.equal(n_neg_enc, actual_result[1], "returned neg did not match.");
            assert.equal(n_msb_enc, actual_result[2].valueOf(), "returned msb did not match. \na_val: " + a_val_enc + "\nm_val: " + m_val_enc + "\nn_val: " + n_val_enc);
            //return true;
          });
      }
    });

    it("Modmul function:\t\tRun " + (init_runs - run) + " - create random inputs for A and B, sub to get C, assert equality from contract", async function () {
      const instance = await BigNumberMock.new()

      const { value: a_val, neg: a_neg } = createRandomInputVariable()
      const { value: b_val, neg: b_neg } = createRandomInputVariable()
      const { value: mod_val, neg: mod_neg } = createRandomInputVariable()

      const a_bn = createBN(a_val, a_neg)
      const b_bn = createBN(b_val, b_neg)
      const mod_bn = createBN(mod_val, mod_neg)

      // calculates modmul.
      const res_bn = a_bn.mul(b_bn).mod(mod_bn);

      let expected_result_val = res_bn.toString('hex')
      let expected_result_neg;

      if (expected_result_val[0] == '-') {
        expected_result_neg = true;
        expected_result_val = expected_result_val.substr(1)
      } else {
        expected_result_neg = false;
      }

      // create bitlength in encoded form
      const { msb_enc: a_msb_enc } = createBitLength(a_bn)
      const { msb_enc: b_msb_enc } = createBitLength(b_bn)
      const { msb_enc: mod_msb_enc } = createBitLength(mod_bn)

      // create value encoded and extra part encoded
      const { val_enc: a_val_enc, extra_enc: a_extra_enc } = createEncodedValue(a_val, a_neg, a_msb_enc)
      const { val_enc: b_val_enc, extra_enc: b_extra_enc } = createEncodedValue(b_val, b_neg, b_msb_enc)
      const { val_enc: mod_val_enc, extra_enc: mod_extra_enc } = createEncodedValue(mod_val, mod_neg, mod_msb_enc)

      // add any leading zeroes (not present from BN)
      expected_result_val = "0x" + ((expected_result_val.length % 64 != 0) ? "0".repeat(64 - (expected_result_val.length % 64)) : "") + expected_result_val

      const expected_result_msb = res_bn.bitLength()

      instance.mock_modmul.call(a_val_enc, a_extra_enc, b_val_enc, b_extra_enc, mod_val_enc, mod_extra_enc).then(function (actual_result) {
        assert.equal(expected_result_val, actual_result[0], "returned val did not match. \na_val:\n" + a_val + "\nb_val:\n" + b_val + "\nmod_val:\n" + mod_val + "\na_msb:\n" + a_msb_enc + "\nb_msb:\n" + b_msb_enc + "\nmod_msb:\n" + mod_msb_enc + "\na_neg:\n" + a_neg + "\nb_neg:\n" + b_neg + "\nmod_neg:\n" + mod_neg + "\n");
        assert.equal(expected_result_neg, actual_result[1], "returned neg did not match. \na_val:\n" + a_val + "\nb_val:\n" + b_val + "\na_msb:\n" + a_msb_enc + "\nb_msb:\n" + b_msb_enc + "\n" + "\na_neg:\n" + a_neg + "\nb_neg:\n" + b_neg + "\n");
        assert.equal(expected_result_msb, actual_result[2].valueOf(), "returned msb did not match. \nresult: " + expected_result_val + "\na_val:\n" + a_val + "\nb_val:\n" + b_val + "\nmod_val:\n" + mod_val + "\na_msb:\n" + a_msb_enc + "\nb_msb:\n" + b_msb_enc + "\nb_msb:\n" + mod_msb_enc + "\n" + "\na_neg:\n" + a_neg + "\nb_neg:\n" + b_neg + "\n");
      })
    });

    it("Modexp function:\t\tRun " + (init_runs - run) + " - create fixed inputs for A and B, compute power modulo to get C, assert equality from contract", async function () {
      const instance = await BigNumberMock.new()

      const a_val = "6776352c8bcd1d6e6b7f5b825a2acebb7e77abbb7cc5ef55b1913d7ce0010f6ae20886db111d14c94bc045b5f145037481d8398998af7906086fb7dc25eab544bedac235f2a7fb6c540443495791eb3fd800719f075488c66c7f5028e5cbc21c974b2d365ff35f9ea1c7209de05b4465510cf03536ae6477fab203c86e50a4db";
      const b_val = "6e3b4d7e8980aba295c68e45e2f891d8e86a554185288c01f9008a86a7c96f05a7ef679958ac34d62744dd72af23212d10209cae7554c94fe5623c1b5d0af4e0d5af46cad9dc3860c2018acf16d9a7e14156cdccbf74ae93479e239292b7d04e343954b8519c61aeb4144a6d5f07c075602936a89980ae25f2d07938906d2849";
      const mod_val = "dc769afd130157452b8d1c8bc5f123b1d0d4aa830a511803f201150d4f92de0b4fdecf32b15869ac4e89bae55e46425a2041395ceaa9929fcac47836ba15e9c1ab5e8d95b3b870c18403159e2db34fc282ad9b997ee95d268f3c4725256fa09c6872a970a338c35d682894dabe0f80eac0526d5133015c4be5a0f27120da5093";

      const a_neg = false
      const b_neg = false
      const mod_neg = false

      const a_bn = createBN(a_val, a_neg)
      const b_bn = createBN(b_val, b_neg)
      const mod_bn = createBN(mod_val, mod_neg)

      // calculates the actual modulo operation
      const res_bn = a_bn.toRed(BN.red(mod_bn)).redPow(b_bn).fromRed();

      let expected_result_val = res_bn.toString('hex')
      let expected_result_neg;

      if (expected_result_val[0] == '-') {
        expected_result_neg = true;
        expected_result_val = expected_result_val.substr(1)
      } else {
        expected_result_neg = false;
      }

      // create bitlength in encoded form
      const { msb: a_msb, msb_enc: a_msb_enc } = createBitLength(a_bn)
      const { msb: b_msb, msb_enc: b_msb_enc } = createBitLength(b_bn)
      const { msb: mod_msb, msb_enc: mod_msb_enc } = createBitLength(mod_bn)

      // create value encoded and extra part encoded
      const { val_enc: a_val_enc, extra_enc: a_extra_enc } = createEncodedValue(a_val, a_neg, a_msb_enc)
      const { val_enc: b_val_enc, extra_enc: b_extra_enc } = createEncodedValue(b_val, b_neg, b_msb_enc)
      const { val_enc: mod_val_enc, extra_enc: mod_extra_enc } = createEncodedValue(mod_val, mod_neg, mod_msb_enc)

      // add any leading zeroes (not present from BN)
      expected_result_val = "0x" + ((expected_result_val.length % 64 != 0) ? "0".repeat(64 - (expected_result_val.length % 64)) : "") + expected_result_val

      const expected_result_msb = res_bn.bitLength()

      instance.mock_modexp.call(a_val_enc, a_extra_enc, b_val_enc, b_extra_enc, mod_val_enc, mod_extra_enc).then(function (actual_result) {
        assert.equal(expected_result_val, actual_result[0], "returned val did not match. \na_val:\n" + a_val + "\nb_val:\n" + b_val + "\nmod_val:\n" + mod_val + "\na_msb:\n" + a_msb_enc + "\nb_msb:\n" + b_msb_enc + "\nmod_msb:\n" + mod_msb_enc + "\na_neg:\n" + a_neg + "\nb_neg:\n" + b_neg + "\nmod_neg:\n" + mod_neg + "\n");
        assert.equal(expected_result_neg, actual_result[1], "returned neg did not match. \na_val:\n" + a_val + "\nb_val:\n" + b_val + "\na_msb:\n" + a_msb_enc + "\nb_msb:\n" + b_msb_enc + "\n" + "\na_neg:\n" + a_neg + "\nb_neg:\n" + b_neg + "\n");
        assert.equal(expected_result_msb, actual_result[2].valueOf(), "returned msb did not match. \nresult: " + expected_result_val + "\na_val:\n" + a_val + "\nb_val:\n" + b_val + "\nmod_val:\n" + b_val + "\na_msb:\n" + a_msb_enc + "\nb_msb:\n" + b_msb_enc + "\n" + "\na_neg:\n" + a_neg + "\nb_neg:\n" + b_neg + "\n");
      })
    });

    it("Modexp function:\t\tRun " + (init_runs - run) + " - create random inputs for A and B, compute modulo exponent to get C, assert equality from contract", async function () {
      instance = await BigNumberMock.new()

      const { value: a_val } = createRandomInputVariable()
      const { value: b_val } = createRandomInputVariable()
      const { value: mod_val } = createRandomInputVariable()

      // TODO all positive for now - need to implement inverse function to deal with negative exponent.
      const a_neg = false;
      const b_neg = false;
      const mod_neg = false;

      const a_bn = createBN(a_val, a_neg)
      const b_bn = createBN(b_val, b_neg)
      const mod_bn = createBN(mod_val, mod_neg)

      // calculates the actual BN operation: modexp.
      const res_bn = a_bn.toRed(BN.red(mod_bn)).redPow(b_bn).fromRed();

      let expected_result_val = res_bn.toString('hex')
      let expected_result_neg;

      if (expected_result_val[0] == '-') {
        expected_result_neg = true;
        expected_result_val = expected_result_val.substr(1)
      } else {
        expected_result_neg = false;
      }

      // create bitlength in encoded form
      const { msb: a_msb, msb_enc: a_msb_enc } = createBitLength(a_bn)
      const { msb: b_msb, msb_enc: b_msb_enc } = createBitLength(b_bn)
      const { msb: mod_msb, msb_enc: mod_msb_enc } = createBitLength(mod_bn)

      // create value encoded and extra part encoded
      const { val_enc: a_val_enc, extra_enc: a_extra_enc } = createEncodedValue(a_val, a_neg, a_msb_enc)
      const { val_enc: b_val_enc, extra_enc: b_extra_enc } = createEncodedValue(b_val, b_neg, b_msb_enc)
      const { val_enc: mod_val_enc, extra_enc: mod_extra_enc } = createEncodedValue(mod_val, mod_neg, mod_msb_enc)

      // add any leading zeroes (not present from BN)
      expected_result_val = "0x" + ((expected_result_val.length % 64 != 0) ? "0".repeat(64 - (expected_result_val.length % 64)) : "") + expected_result_val

      const expected_result_msb = res_bn.bitLength()

      console.log("a_bn bit length:\t" + a_msb);
      console.log("a_val_enc:\t" + a_val_enc)

      console.log("b_bn bit length:\t" + b_msb);
      console.log("b_val_enc:\t" + b_val_enc)

      console.log("mod_bn bit length:\t" + mod_msb);
      console.log("mod_val_enc\t:" + mod_val_enc);

      instance.mock_modexp.call(a_val_enc, a_extra_enc, b_val_enc, b_extra_enc, mod_val_enc, mod_extra_enc).then(function (actual_result) {
        assert.equal(expected_result_val, actual_result[0], "returned val did not match. \na_val:\n" + a_val + "\nb_val:\n" + b_val + "\nmod_val:\n" + mod_val + "\na_msb:\n" + a_msb_enc + "\nb_msb:\n" + b_msb_enc + "\nmod_msb:\n" + mod_msb_enc + "\na_neg:\n" + a_neg + "\nb_neg:\n" + b_neg + "\nmod_neg:\n" + mod_neg + "\n");
        assert.equal(expected_result_neg, actual_result[1], "returned neg did not match. \na_val:\n" + a_val + "\nb_val:\n" + b_val + "\na_msb:\n" + a_msb_enc + "\nb_msb:\n" + b_msb_enc + "\n" + "\na_neg:\n" + a_neg + "\nb_neg:\n" + b_neg + "\n");
        assert.equal(expected_result_msb, actual_result[2].valueOf(), "returned msb did not match. \nresult: " + expected_result_val + "\na_val:\n" + a_val + "\nb_val:\n" + b_val + "\nmod_val:\n" + b_val + "\na_msb:\n" + a_msb_enc + "\nb_msb:\n" + b_msb_enc + "\n" + "\na_neg:\n" + a_neg + "\nb_neg:\n" + b_neg + "\n");
      })
    });

    it("Multiplication function:\tRun " + (init_runs - run) + " - create random inputs for A and B, multiply to get C, assert equality from contract", async function () {
      instance = await BigNumberMock.new()

      const { value: a_val, neg: a_neg } = createRandomInputVariable()
      const { value: b_val, neg: b_neg } = createRandomInputVariable()

      const a_bn = createBN(a_val, a_neg)
      const b_bn = createBN(b_val, b_neg)

      // perform a simple BN multiply operation without modulo
      const res_bn = a_bn.mul(b_bn);

      let expected_result_val = res_bn.toString('hex')
      let expected_result_neg;

      if (expected_result_val[0] == '-') {
        expected_result_neg = true;
        expected_result_val = expected_result_val.substr(1)
      } else {
        expected_result_neg = false;
      }

      // create bitlength in encoded form -> different than in createBitLength()
      const a_msb_enc = a_bn.bitLength()
      const b_msb_enc = b_bn.bitLength()

      // create value encoded and extra part encoded
      const { val_enc: a_val_enc } = createEncodedValue(a_val, a_neg, a_msb_enc)
      const { val_enc: b_val_enc } = createEncodedValue(b_val, b_neg, b_msb_enc)

      const expected_result_msb = res_bn.bitLength()

      // add any leading zeroes (not present from BN)
      expected_result_val = "0x" + ((expected_result_val.length % 64 != 0) ? "0".repeat(64 - (expected_result_val.length % 64)) : "") + expected_result_val

      await instance.mock_bn_mul.call(a_val_enc, a_neg, a_msb_enc, b_val_enc, b_neg, b_msb_enc).then(function (actual_result) {
        assert.equal(expected_result_val, actual_result[0], "returned val did not match. \na_val:\n" + a_val + "\nb_val:\n" + b_val + "\na_msb:\n" + a_msb_enc + "\nb_msb:\n" + b_msb_enc + "\na_neg:\n" + a_neg + "\nb_neg:\n" + b_neg);
        assert.equal(expected_result_neg, actual_result[1], "returned neg did not match. \na_val:\n" + a_val + "\nb_val:\n" + b_val + "\na_msb:\n" + a_msb_enc + "\nb_msb:\n" + b_msb_enc + "\n" + "\na_neg:\n" + a_neg + "\nb_neg:\n" + b_neg + "\n");
        assert.equal(expected_result_msb, actual_result[2].valueOf(), "returned msb did not match. \nresult: " + expected_result_val + "\na_val:\n" + a_val + "\nb_val:\n" + b_val + "\na_msb:\n" + a_msb_enc + "\nb_msb:\n" + b_msb_enc + "\n" + "\na_neg:\n" + a_neg + "\nb_neg:\n" + b_neg + "\n");
      })
    });

    it("Addition function:\tRun " + (init_runs - run) + " - create random inputs for A and B, add to get C, assert equality from contract", async function () {
      const instance = await BigNumberMock.new()

      const { value: a_val, neg: a_neg } = createRandomInputVariable()
      const { value: b_val, neg: b_neg } = createRandomInputVariable()

      const a_bn = createBN(a_val, a_neg)
      const b_bn = createBN(b_val, b_neg)

      // perform a simple addition operation without modulo
      const res_bn = a_bn.add(b_bn);

      let expected_result_val = res_bn.toString('hex')
      let expected_result_neg;

      if (expected_result_val[0] == '-') {
        expected_result_neg = true;
        expected_result_val = expected_result_val.substr(1)
      } else {
        expected_result_neg = false;
      }

      // create bitlength in encoded form -> different than in createBitLength()
      const a_msb_enc = a_bn.bitLength()
      const b_msb_enc = b_bn.bitLength()

      // create value encoded and extra part encoded
      const { val_enc: a_val_enc } = createEncodedValue(a_val, a_neg, a_msb_enc)
      const { val_enc: b_val_enc } = createEncodedValue(b_val, b_neg, b_msb_enc)

      const expected_result_msb = res_bn.bitLength()

      // add any leading zeroes (not present from BN)
      expected_result_val = "0x" + ((expected_result_val.length % 64 != 0) ? "0".repeat(64 - (expected_result_val.length % 64)) : "") + expected_result_val

      instance.mock_bn_add.call(a_val_enc, a_neg, a_msb_enc, b_val_enc, b_neg, b_msb_enc)
        .then(function (actual_result) {
          console.log(actual_result)
          assert.equal(expected_result_val, actual_result[0], "returned val did not match. \na_val:\n" + a_val + "\nb_val:\n" + b_val + "\na_msb:\n" + a_msb_enc + "\nb_msb:\n" + b_msb_enc + "\na_neg:\n" + a_neg + "\nb_neg:\n" + b_neg);
          assert.equal(expected_result_neg, actual_result[1], "returned neg did not match. \na_val:\n" + a_val + "\nb_val:\n" + b_val + "\na_msb:\n" + a_msb_enc + "\nb_msb:\n" + b_msb_enc + "\n" + "\na_neg:\n" + a_neg + "\nb_neg:\n" + b_neg + "\n");
          assert.equal(expected_result_msb, actual_result[2].valueOf(), "returned msb did not match. \nresult: " + expected_result_val + "\na_val:\n" + a_val + "\nb_val:\n" + b_val + "\na_msb:\n" + a_msb_enc + "\nb_msb:\n" + b_msb_enc + "\n" + "\na_neg:\n" + a_neg + "\nb_neg:\n" + b_neg + "\n");
        })
    });

    it("Subtraction function:\tRun " + (init_runs - run) + " - create random inputs for A and B, sub to get C, assert equality from contract", async function () {
      instance = await BigNumberMock.new()

      const { value: a_val, neg: a_neg } = createRandomInputVariable()
      const { value: b_val, neg: b_neg } = createRandomInputVariable()

      const a_bn = createBN(a_val, a_neg)
      const b_bn = createBN(b_val, b_neg)

      // perform a simple subtraction without modulo
      const res_bn = a_bn.sub(b_bn);

      let expected_result_val = res_bn.toString('hex')
      let expected_result_neg;

      if (expected_result_val[0] == '-') {
        expected_result_neg = true;
        expected_result_val = expected_result_val.substr(1)
      } else {
        expected_result_neg = false;
      }

      // create bitlength in encoded form -> different than in createBitLength()
      const a_msb_enc = a_bn.bitLength()
      const b_msb_enc = b_bn.bitLength()

      // create value encoded and extra part encoded
      const { val_enc: a_val_enc } = createEncodedValue(a_val, a_neg, a_msb_enc)
      const { val_enc: b_val_enc } = createEncodedValue(b_val, b_neg, b_msb_enc)

      const expected_result_msb = res_bn.bitLength()

      //add any leading zeroes (not present from BN)
      expected_result_val = "0x" + ((expected_result_val.length % 64 != 0) ? "0".repeat(64 - (expected_result_val.length % 64)) : "") + expected_result_val

      instance.mock_bn_sub.call(a_val_enc, a_neg, a_msb_enc, b_val_enc, b_neg, b_msb_enc)
        .then(function (actual_result) {
          assert.equal(expected_result_val, actual_result[0], "returned val did not match. \na_val:\n" + a_val + "\nb_val:\n" + b_val + "\na_msb:\n" + a_msb_enc + "\nb_msb:\n" + b_msb_enc + "\na_neg:\n" + a_neg + "\nb_neg:\n" + b_neg);
          assert.equal(expected_result_neg, actual_result[1], "returned neg did not match. \na_val:\n" + a_val + "\nb_val:\n" + b_val + "\na_msb:\n" + a_msb_enc + "\nb_msb:\n" + b_msb_enc + "\n" + "\na_neg:\n" + a_neg + "\nb_neg:\n" + b_neg + "\n");
          assert.equal(expected_result_msb, actual_result[2].valueOf(), "returned msb did not match. \nresult: " + expected_result_val + "\na_val:\n" + a_val + "\nb_val:\n" + b_val + "\na_msb:\n" + a_msb_enc + "\nb_msb:\n" + b_msb_enc + "\n" + "\na_neg:\n" + a_neg + "\nb_neg:\n" + b_neg + "\n");
        })
    });

    it("Modadd function:\t\tRun " + (init_runs - run) + " - create random inputs for A and B, modadd to get C, assert equality from contract", async function () {
      const instance = await BigNumberMock.new()

      const rand = false;

      let { value: a_val, neg: a_neg } = createRandomInputVariable()
      let { value: b_val, neg: b_neg } = createRandomInputVariable()
      let { value: mod_val, neg: mod_neg } = createRandomInputVariable()

      if (rand) {
        a_val = 5
        a_neg = false
        b_val = 4
        b_neg = false
        mod_val = 6
        mod_neg = false
      }

      const a_bn = createBN(a_val, a_neg)
      const b_bn = createBN(b_val, b_neg)
      const mod_bn = createBN(mod_val, mod_neg)

      // calculates the operation: modadd.
      const res_bn = a_bn.add(b_bn).mod(mod_bn);
      console.log(res_bn.toString(), a_bn.toString(), b_bn.toString())

      let expected_result_val = res_bn.toString('hex')
      let expected_result_neg;

      if (expected_result_val[0] == '-') {
        expected_result_neg = true;
        expected_result_val = expected_result_val.substr(1)
      } else {
        expected_result_neg = false;
      }

      // create bitlength in encoded form
      const { msb_enc: a_msb_enc } = createBitLength(a_bn)
      const { msb_enc: b_msb_enc } = createBitLength(b_bn)
      const { msb_enc: mod_msb_enc } = createBitLength(mod_bn)

      // create value encoded and extra part encoded
      const { val_enc: a_val_enc, extra_enc: a_extra_enc } = createEncodedValue(a_val, a_neg, a_msb_enc)
      const { val_enc: b_val_enc, extra_enc: b_extra_enc } = createEncodedValue(b_val, b_neg, b_msb_enc)
      const { val_enc: mod_val_enc, extra_enc: mod_extra_enc } = createEncodedValue(mod_val, mod_neg, mod_msb_enc)

      // add any leading zeroes (not present from BN)
      expected_result_val = "0x" + ((expected_result_val.length % 64 != 0) ? "0".repeat(64 - (expected_result_val.length % 64)) : "") + expected_result_val
      const expected_result_msb = res_bn.bitLength()

      instance.mock_modadd.call(a_val_enc, a_extra_enc, b_val_enc, b_extra_enc, mod_val_enc, mod_extra_enc).then(function (actual_result) {
        console.log(actual_result)
        assert.equal(expected_result_val, actual_result[0], "returned val did not match. \na_val:\n" + a_val + "\nb_val:\n" + b_val + "\nmod_val:\n" + mod_val + "\na_msb:\n" + a_msb_enc + "\nb_msb:\n" + b_msb_enc + "\nmod_msb:\n" + mod_msb_enc + "\na_neg:\n" + a_neg + "\nb_neg:\n" + b_neg + "\nmod_neg:\n" + mod_neg + "\n");
        assert.equal(expected_result_neg, actual_result[1], "returned neg did not match. \na_val:\n" + a_val + "\nb_val:\n" + b_val + "\na_msb:\n" + a_msb_enc + "\nb_msb:\n" + b_msb_enc + "\n" + "\na_neg:\n" + a_neg + "\nb_neg:\n" + b_neg + "\n");
        assert.equal(expected_result_msb, actual_result[2].valueOf(), "returned msb did not match. \nresult: " + expected_result_val + "\na_val:\n" + a_val + "\nb_val:\n" + b_val + "\nmod_val:\n" + mod_val + "\na_msb:\n" + a_msb_enc + "\nb_msb:\n" + b_msb_enc + "\nb_msb:\n" + mod_msb_enc + "\n" + "\na_neg:\n" + a_neg + "\nb_neg:\n" + b_neg + "\n");
      })
    });
  }
});