const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const crypto = require("crypto");
const BN = require("bn.js");

const UPPER_BOUND_RANDOM = new BN(
  "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2d",
  "hex",
  "be"
);
const RAND_SIZE_BYTES = 33;

// fix constants for values 1 and 0
const M_1 = ec.g.mul(new BN(1000, 10));
const M_0 = ec.g.mul(new BN(500, 10));
console.log(
  "constants are on curve?",
  ec.curve.validate(M_1) && ec.curve.validate(M_0)
);

function encrypt(message, pubK) {
  let randBytes = crypto.randomBytes(RAND_SIZE_BYTES);
  let randBN = new BN(randBytes);

  // ensure that the random value is in range [1,p-1]
  while (!randBN.lte(UPPER_BOUND_RANDOM)) {
    randBytes = crypto.randomBytes(RAND_SIZE_BYTES);
    randBN = new BN(randBytes);
  }

  // compute c1: generator ecc-multiply randomValue
  let c1 = ec.g.mul(randBN);
  console.log("Is c1 on the curve?", ec.curve.validate(c1));

  // compute s: h^randomValue
  // whereby h = publicKey => h = g^privateKeyOfReceiver (h is publically available)
  const s = pubK.mul(randBN);
  console.log("Is point s on the curve?", ec.curve.validate(s));

  // compute c2: s*message
  const c2 = s.add(message);
  console.log("is c2 on curve?", ec.curve.validate(c2));

  return [c1, c2];
}

function decrypt(cipherText, privK) {
  const c1 = cipherText[0];
  const c2 = cipherText[1];

  // compute s: c1^privateKey
  const s = c1.mul(privK);
  console.log("is s on the curve?", ec.curve.validate(s));

  // compute s^-1: the multiplicative inverse of s (probably the most difficult)
  let s_inverse = s.neg();
  console.log("is s^-1 on the curve?", ec.curve.validate(s_inverse));

  // compute m: c2 ecc-add s^-1
  const m = c2.add(s_inverse);
  console.log("is m on curve?", ec.curve.validate(m));

  return m;
}

function demo() {
  const keyPair = ec.genKeyPair();
  const privateKey = keyPair.getPrivate();
  const publicKey = keyPair.getPublic();

  const cipherText = encrypt(M_1, publicKey);
  const plainText = decrypt(cipherText, privateKey);

  console.log("are the messages the same?", plainText.eq(M_1));
}

demo();
