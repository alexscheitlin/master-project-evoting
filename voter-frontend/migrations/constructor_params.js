const params = {
  // finite field elGamal
  ff: {
    // empty parameters, as it is needed by the constructor
    // are set correctly in each new test, not here
    PublicKey: {
      p: '', // prime
      q: '', // prime factor: p = 2*q+1
      g: '', // generator
      h: '',
    },
  },
};

module.exports.params = params;
