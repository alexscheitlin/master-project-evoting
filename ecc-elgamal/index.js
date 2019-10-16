var EC = require('elliptic').ec;
var ec = new EC('secp256k1');

// Generate keys
var key1 = ec.genKeyPair();
var key1Private = key1.getPrivate();
var key1Public = key1.getPublic();

console.log('private key:\n', key1Private);
console.log('public key:\n', key1Public);

var key2 = ec.genKeyPair();

var shared1 = key1.derive(key2.getPublic());
var shared2 = key2.derive(key1.getPublic());

console.log('Both shared secrets are BN instances');
console.log(shared1.toString(16));
console.log(shared2.toString(16));
