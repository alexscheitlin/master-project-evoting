#!/bin/bash

# $1 contracts/contract.sol

echo "var output=`./solc-static-linux --optimize --combined-json abi,bin,interface $1`;" > ./test.js

var="$(cat <<EOF
var array = Object.keys(output.contracts);
for (var i in array) {
  var contract = eth.contract(JSON.parse(output.contracts[array[i]].abi));
  var bytecode = '0x' + output.contracts[array[i]].bin;
  var txDeploy = {from:eth.accounts[0], data: bytecode, gas: 4700000};
  var test = contract.new(txDeploy,
    function (e, contract) {
      if (typeof contract.address !== 'undefined') {
        console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
    }
  });
}
EOF
)";

echo $var >> ./test.js