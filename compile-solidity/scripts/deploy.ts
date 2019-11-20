const Web3 = require("web3");
const compiledContract = require("../build/SimpleStorage.json");

const provider = new Web3.providers.HttpProvider("http://localhost:8545");
const web3 = new Web3(provider);

const deployContract = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log(`Attempting to deploy from account: ${accounts[0]}`);

  const deployedContract = await new web3.eth.Contract(compiledContract.abi)
    .deploy({
      data: "0x" + compiledContract.evm.bytecode.object,
      arguments: [10] // arguments for contructor of contract
    })
    .send({
      from: accounts[0],
      gas: "2000000"
    });

  // test if contract methods can be called
  const val = await deployedContract.methods.get().call();
  console.log("VALUE 1", val);

  await deployedContract.methods.set(5).send({ from: accounts[0] });
  const changedVal = await deployedContract.methods.get().call();
  console.log("VALUE 2", changedVal);

  console.log(
    `Contract deployed at address: ${deployedContract.options.address}`
  );

  provider.engine.stop();
};

deployContract()
  .then(res => console.log("success"))
  .catch(err => console.log(err));
