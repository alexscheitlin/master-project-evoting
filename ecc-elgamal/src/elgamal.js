const BN = require("bn.js");

const random = require("random");

function encrypt(message, pk, randomValue) {
  // INPUTS: message is a ECC point, publicKey is a

  console.log("public key\t", pk);

  // ADDITIONALLY, the generator g of the curve is required
  console.log("generator\t", gen);

  // compute c1: generator^randomValue
  let c1 = gen.pow(randomValue).mod(p);
  console.log("c1\t", c1);

  // compute s: h^randomValue whereby h = publicKey => h = g^privateKeyOfReceiver (h is publically available)
  // compute c2: s*message
  const s = pk.pow(randomValue).mod(p);
  const c2 = s.mul(message).mod(p);
  console.log("s\t", s);
  console.log("c2\t", c2);

  return [c1, c2];
}

function decrypt(sk, cipherText) {
  let c1 = cipherText[0];
  let c2 = cipherText[1];

  // compute s: c1^privateKey
  let s = c1.pow(sk).mod(p);
  console.log("s\t", s);

  // compute s^-1: the multiplicative inverse of s (probably the most difficult)
  let s_inverse = null;

  // compute m: c2 * s^-1
  let m_ = c2.div(s);
  console.log("m_\t", m_);

  // alternative computation
  // 1. compute p-x
  const pMinusX = p.sub(sk);
  console.log("p - x\t", pMinusX);

  // 2. compute pre-result s^(p-x)
  const sPowPMinusX = s.pow(pMinusX).mod(p);
  console.log("s^(p-x)\t", sPowPMinusX);

  // 3. compute message - msg = c2*s^(p-x)
  let msg = c2.mul(sPowPMinusX).mod(p);
  console.log("plaintext\t", msg);
  console.log(
    "are plaintexts the same?",
    msg.eq(message),
    msg.eq(m_),
    m_.eq(message)
  );

  return msg;
}

const sk = new BN(2, 10);
const gen = new BN(3, 10);
const p = new BN(7, 10);
const pk = gen.pow(sk).mod(p);
console.log("public key\t", pk);

const randomValue = new BN(random.int(0, p - 1), 10);
console.log("random value\t", randomValue);

const message = new BN(5, 10);
console.log("plaintext\t", message);

decrypt(sk, encrypt(message, pk, randomValue));
