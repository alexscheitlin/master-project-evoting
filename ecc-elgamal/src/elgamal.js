const BN = require("bn.js");
const random = require("random");
const print = false;

function encrypt(message, pk) {
  // generate a random value
  const randomValue = new BN(random.int(1, p - 2), 10);
  console.log("random value\t", randomValue);

  // compute c1: generator^randomValue
  let c1 = gen.pow(randomValue).mod(p);
  print && console.log("c1\t", c1);

  // compute s: h^randomValue whereby
  // h = publicKey => h = g^privateKeyOfReceiver (h is publically available)
  const s = pk.pow(randomValue).mod(p);
  print && console.log("s\t", s);

  // compute c2: s*message
  const c2 = s.mul(message).mod(p);
  print && console.log("c2\t", c2);

  return [c1, c2];
}

function decrypt(sk, cipherText) {
  let c1 = cipherText[0];
  let c2 = cipherText[1];

  // compute s: c1^privateKey
  let s = c1.pow(sk).mod(p);
  print && console.log("s\t", s);

  // compute s^-1: the multiplicative inverse of s (probably the most difficult)
  let s_inverse = s.invm(p);
  print && console.log("s^-1\t", s_inverse);

  // compute m: c2 * s^-1 | c2 / s
  let m_ = c2.mul(s_inverse).mod(p);
  print && console.log("m_\t", m_);

  // alternative computation
  // 1. compute p-x
  const pMinusX = p.sub(sk);
  print && console.log("p - x\t", pMinusX);

  // 2. compute pre-result s^(p-x)
  const sPowPMinusX = s.pow(pMinusX).mod(p);
  print && console.log("s^(p-x)\t", sPowPMinusX);

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

const p = new BN(7, 10);
const gen = new BN(3, 10);
const sk = new BN(random.int(1, p - 2), 10);
const pk = gen.pow(sk).mod(p);
print && console.log("public key\t", pk);

const message = new BN(random.int(1, p - 1), 10);
console.log("plaintext\t", message);

for (let i = 0; i < 10; i++) {
  decrypt(sk, encrypt(message, pk, randomValue));
  console.log("\n");
}
