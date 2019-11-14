const BN = require("bn.js")
const crypto = require("crypto")

const random = require("random")

function createRandomInputVariable() {
  //assuming we can have up to 31 leading zeroes.
  const zeros = "0".repeat((Math.floor(Math.random() * 31) + 1) * 2)
  const size = ((Math.floor(Math.random() * 10) + 1) * 32) - (zeros.length / 2)

  //create random hex strings with leading zeroes
  const rand = crypto.randomBytes(size).toString('hex');
  let value = zeros + rand.toString('hex');

  while (zeros.length == 63 && value[62] == "0" && value[63] == "0") {
    value = value.substring(0, 62) + crypto.randomBytes(1).toString('hex') + value.substring(64)
  }

  // random boolean if value is negated or not
  const neg = Math.random() >= 0.5;

  return { value, size, zeros, neg }
}

function smallRandom() {
  const zeros = "0".repeat(63);
  const size = 1;
  const value = zeros + random.int(1, 15).toString(16);
  return { value, size, zeros, neg: false }
}

function createBN(a_val, a_neg) {
  return new BN((a_neg ? "-" : "") + a_val, 16);
}

function createBitLength(as_bn) {
  const msb = as_bn.bitLength()
  const msb_enc = "0".repeat(64 - msb.toString(16).length) + msb.toString(16)
  return { msb, msb_enc }
}

function createEncodedValue(val, neg, msb_enc) {
  const val_enc = "0x" + val
  const extra_enc = "0x" + "0".repeat(63) + ((neg == true) ? "1" : "0") + msb_enc;
  return { val_enc, extra_enc }
}

module.exports = {
  createRandomInputVariable,
  smallRandom,
  createBN,
  createBitLength,
  createEncodedValue
}