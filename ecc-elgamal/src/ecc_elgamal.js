const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const BN = require("bn.js");

const random = require("random");

const hash = ec.hash;

// Generate keys
var alice = ec.genKeyPair();
var alicePrivate = alice.getPrivate();
var alicePublic = alice.getPublic();

// console.log("private key:\n", alicePrivate);
// console.log("public key:\n", alicePublic);

// var bob = ec.genKeyPair();

// var shared1 = alice.derive(bob.getPublic());
// var shared2 = bob.derive(alice.getPublic());

// console.log("Both shared secrets are BN instances");
// console.log(shared1.toString(16));
// console.log(shared2.toString(16));

// TODO
// 1. Choose a message to encrypt i.e. a point on the curve
const pointToEncrypt_Message = null;

// 1.1 Decide for a point on the curve
// 1.2 Retrieve a valid point on the curve
// lookup the params for secp256k1 => a, b, q, p
// y^2 = (x^3 + ax + b) mod q
// y = sqrt (x^3 + ax + b) mod q

// 2. Choose a random value that lies on the curve +
const randomValue = new BN(3, 10);
console.log(randomValue);

const message = new BN(2, 10);
console.log(message);

decrypt(alicePrivate, encrypt(message, alicePublic, randomValue));

function encrypt(message, publicKeyReceiver, randomValue) {
  // INPUTS: message is a ECC point, publicKey is a

  console.log("public key:", publicKeyReceiver);

  // ADDITIONALLY, the generator g of the curve is required
  generator = ec.g;
  console.log("generator:", generator);

  // compute c1: generator^randomValue
  let c1 = generator.mul(randomValue, 10, ec.curve.p);
  console.log("c1:", c1, ec.curve.validate(c1));

  // compute s: h^randomValue whereby h = publicKey => h = g^privateKeyOfReceiver (h is publically available)
  const s = publicKeyReceiver.mul(randomValue, 10, ec.curve.p);
  console.log("s:", s, ec.curve.validate(s));

  // compute c2: s*message
  let c2 = s.mul(message, 10, ec.curve.p);
  console.log("c2:", c2);

  return [c1, s, c2];
}

function decrypt(privateKey, cipherText) {
  let c1 = cipherText[0];
  let s_ = cipherText[1];
  let c2 = cipherText[2];

  // compute s: c1^privateKey
  let s = c1.mul(privateKey);
  console.log("s:", s, ec.curve.validate(s), s_.eq(s));

  // compute s^-1: the multiplicative inverse of s (probably the most difficult)
  let s_inverse = null;

  // compute m: c2 * s^-1
  console.log("p:", ec.curve.p);
  console.log("privateKey:", privateKey);

  const pMinusX = ec.curve.p.sub(privateKey, 10, ec.curve.p);
  console.log("p - x:", pMinusX);

  const some = s.mul(pMinusX, 10, ec.curve.p);
  console.log("s^(p-x):", some, ec.curve.validate(some));

  let msg = c2.mul(some.x, 10, ec.curve.p);
  console.log("message:", msg, msg.eq(message));

  return msg;
}
