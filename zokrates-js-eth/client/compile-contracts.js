let zokrates = require('zokrates-js-node');
const fs = require('fs');

if (typeof Window === 'undefined') {
  global.Window = {};
}

const code = `
def main(private field a) -> (field):
  field result = if a == 0 then 1 else 0 fi
  return result
`;

// function importResolver(location, path) {
//   // implement your resolving logic here
//   return {
//     source: 'def main() -> (): return',
//     location: path
//   };
// }

// zokrates.initialize(importResolver).then(() => {
//   // we have to initialize wasm module before calling api functions
//   let result = zokrates.compile('def main() -> (): return', 'main');
//   console.log(result);
// });

function importResolver(location, path) {
  // implement your resolving logic here
  return {
    source: code,
    location: path
  };
}

zokrates.initialize(importResolver).then(() => {
  let program = zokrates.compile(code, 'main');
  console.log(program);

  try {
    const keys = zokrates.setup(program);
    console.log(keys);
  } catch (error) {
    console.log('ERROR MESSAGE: ', error);
  }

  // // generate a solidity contract, this should eventually be deployed
  // // by the system beforehand
  // const contract = zokrates.exportSolidityVerifier(verifierKey, true);

  // fs.writeFile('../contracts/Verifier.sol', contract, error => {
  //   error ? console.log(error) : console.log('contract saved');
  // });

  // const keys = {
  //   verifierKey: verifierKey,
  //   provingKey: provingKey
  // };

  // fs.writeFile('keys.json', JSON.stringify(keys), error => {
  //   error ? console.log(error) : console.log('keys saved');
  // });
});
