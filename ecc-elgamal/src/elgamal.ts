const BN = require("bn.js");
const random = require("random");
const printConsole = true;

const encrypt = (message: any, pk: any, p: any): [any, any] => {
  // generate a random value
  const randomValue = new BN(random.int(1, p - 2), 10);
  console.log("random value (r)", randomValue);

  // compute c1: generator^randomValue
  let c1 = gen.pow(randomValue).mod(p);
  printConsole && console.log("c1\t\t", c1);

  // compute s: h^randomValue whereby
  // h = publicKey => h = g^privateKeyOfReceiver (h is publically available)
  const s = pk.pow(randomValue).mod(p);
  printConsole && console.log("s\t\t", s);

  // compute mh: generator^message
  const mh = gen.pow(message).mod(p);
  printConsole && console.log("mh\t\t", mh);

  // compute c2: s*message_homomorphic
  const c2 = s.mul(mh).mod(p);
  printConsole && console.log("c2\t\t", c2);
  printConsole && console.log("------------------------");

  return [c1, c2];
};

const add = (em1: [any, any], em2: [any, any]): [any, any] => {
  return [em1[0].mul(em2[0]).mod(p), em1[1].mul(em2[1]).mod(p)];
};

const decrypt = (cipherText: [any, any], sk: any, p: any, gen: any) => {
  let c1 = cipherText[0];
  let c2 = cipherText[1];

  // compute s: c1^privateKey
  let s = c1.pow(sk).mod(p);
  printConsole && console.log("s\t\t", s);

  // compute s^-1: the multiplicative inverse of s (probably the most difficult)
  let s_inverse = s.invm(p);
  printConsole && console.log("s^-1\t\t", s_inverse);

  // compute m: c2 * s^-1 | c2 / s
  let m_h = c2.mul(s_inverse).mod(p);
  printConsole && console.log("m_h\t\t", m_h);

  // alternative computation
  // 1. compute p-2
  const pMinusX = p.sub(new BN(2, 10));
  //const pMinusX = p.sub(new BN(2, 10));
  printConsole && console.log("p - 2\t\t", pMinusX);

  // 2. compute pre-result s^(p-x)
  const sPowPMinusX = s.pow(pMinusX).mod(p);
  printConsole && console.log("s^(p-x)\t\t", sPowPMinusX);

  // 3. compute message - msg = c2*s^(p-x)
  let msg_homo = c2.mul(sPowPMinusX).mod(p);
  printConsole && console.log("msg_homo\t", msg_homo);

  // 4.
  let m_ = new BN(1, 10);
  while (
    !gen
      .pow(m_)
      .mod(p)
      .eq(m_h)
  ) {
    m_ = m_.add(new BN(1, 10));
  }

  let msg = new BN(1, 10);
  while (
    !gen
      .pow(msg)
      .mod(p)
      .eq(msg_homo)
  ) {
    msg = msg.add(new BN(1, 10));
  }

  console.log("plaintexts\t", m_, msg);
  console.log(
    "are plaintexts the same?",
    msg.eq(message),
    msg.eq(m_),
    m_.eq(message)
  );
  printConsole && console.log("------------------------");

  return msg;
};

const p = new BN(7, 10);
const gen = new BN(3, 10);
const sk = new BN(random.int(1, p - 2), 10);
const pk = gen.pow(sk).mod(p);

const message = new BN(random.int(1, p - 1), 10);
for (let i = 0; i < 10; i++) {
  printConsole && console.log("prime      (p)\t", p);
  printConsole && console.log("generator  (g)\t", gen);
  printConsole && console.log("private key(x)\t", sk);
  printConsole && console.log("           (h)\t", pk);
  console.log("plaintext  (m)\t", message);
  printConsole && console.log("------------------------");
  decrypt(encrypt(message, pk, p), sk, p, gen);
  console.log("\n");
}

// plaintext check may be wrong as it is checked against the message from above
const m1 = new BN(4, 10);
const e_m1 = encrypt(m1, pk, p);
const d_m1 = decrypt(e_m1, sk, p, gen);

const m2 = new BN(2, 10);
const e_m2 = encrypt(m2, pk, p);
const d_m2 = decrypt(e_m2, sk, p, gen);

const d_sum = decrypt(add(e_m1, e_m2), sk, p, gen);
console.log(d_sum);
