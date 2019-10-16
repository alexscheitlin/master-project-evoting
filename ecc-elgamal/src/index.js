const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const hash = ec.hash;
console.log(hash('test'));

// Generate keys
var alice = ec.genKeyPair();
var alicePrivate = alice.getPrivate();
var alicePublic = alice.getPublic();

console.log('private key:\n', alicePrivate);
console.log('public key:\n', alicePublic);

var bob = ec.genKeyPair();

var shared1 = alice.derive(bob.getPublic());
var shared2 = bob.derive(alice.getPublic());

console.log('Both shared secrets are BN instances');
console.log(shared1.toString(16));
console.log(shared2.toString(16));

// TODO
// 1. Choose a message to encrypt i.e. a point on the curve
const pointToEncrypt_Message = null;

// 1.1 Decide for a point on the curve
// 1.2 Retrieve a valid point on the curve
// lookup the params for secp256k1 => a, b, q, p
// y^2 = (x^3 + ax + b) mod q
// y = sqrt (x^3 + ax + b) mod q

// 2. Choose a random value that lies on the curve +
const randomValue = null;

function encrypt(message, publicKeyReceiver, randomValue) {
  // INPUTS: message is a ECC point, publicKey is a

  // ADDITIONALLY, the generator g of the curve is required
  generator = ec.g;

  // compute c1: generator^randomValue
  let c1 = null;

  // compute s: h^randomValue whereby h = publicKey => h = g^privateKeyOfReceiver (h is publically available)
  const s = null;

  // compute c2: s*message
  let c2 = null;

  return [c1, c2];
}

function decrypt(privateKey, cipherText) {
  let c1 = cipherText[0];
  let c2 = cipherText[1];

  // compute s: c1^privateKey
  let s = null;

  // compute s^-1: the multiplicative inverse of s (probably the most difficult)
  let s_inverse = null;

  // compute m: c2 * s^-1
  let message = null;

  return message;
}
