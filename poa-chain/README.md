# Parity Ethereum Proof of Authority Chain

Set up the chain in two phases:

1. Create Accounts
2. Register Nodes

In the first phase, all nodes are started and accounts will be generated. Then, then nodes need to be shut down and restarted with a different configuration. In the second phase, the nodes are connected with each other ant transactions can be made.

## Prerequisites

### JQ

Install JQ (https://stedolan.github.io/jq/download/) to process JSON in the command-line:

```bash
# ubuntu
sudo apt-get install jq

# fedora
sudo dnf install jq
```

### BC

Install BC (Basic Calculator) to convert hex numbers to decimal numbers:

```bash
# ubuntu
sudo apt-get install bc

# fedora
sudo dnf install bc
```

## Geth (Go Ethereum)

_Only do this step if you want to deploy smart contracts and interact with the deployed contracts._

Install Geth: https://github.com/ethereum/go-ethereum/wiki/Installing-Geth

### Parity Ethereum Client

_Only do this step if you want to run the chain without docker._

1. Download the binary to this project's folder from:
   `https://github.com/paritytech/parity-ethereum/releases/tag/v2.5.9`
2. Make the binary executable:
   `chmod +x parity`

### Parity Docker Image

_Only do this step if you want to run the chain with docker._

`docker pull parity/parity:stable`

## Configuration

Within the `use-docker` file, either write `true` or `false` to indicate whether the blockchain should be set up within docker containers or on the localhost.

## Phase 1: Create Accounts

1. Start authority node 1 (using the configuration for phase 1) and create the address for the first authority:

   ```bash
   ./start-node.sh auth1 1
   ./create-account.sh 8541 auth1 auth1

   # {"jsonrpc":"2.0","result":"0x0019dd4a8857af4969971a352f7b5bdd1fc5f6c0","id":0}
   ```

2. Start authority node 2 (using the configuration for phase 1) and create the address for the second authority:

   ```bash
   ./start-node.sh auth2 1
   ./create-account.sh 8542 auth2 auth2

   # {"jsonrpc":"2.0","result":"0x000bcd493c3674f754335ae9fed13f206a716cde","id":0}
   ```

3. Start authority node 3 (using the configuration for phase 1) and create the address for the third authority:

   ```bash
   ./start-node.sh auth3 1
   ./create-account.sh 8543 auth3 auth3

   # {"jsonrpc":"2.0","result":"0x00373f0317411aa5cc7a4005c67bacc3c5c4e7c9","id":0}
   ```

4. Start the user node (using the configuration for phase 1) and create the address for the user:

   ```bash
   ./start-node.sh user 1
   ./create-account.sh 8540 user user

   # {"jsonrpc":"2.0","result":"0x004ec07d2329997267ec62b4166639513386f32e","id":0}
   ```

5. Stop all four nodes.

Alternative for steps 1 to 4: start all nodes and call `./create-account-all.sh`

Summary:

```bash
Authority 1:   0x0019dd4a8857af4969971a352f7b5bdd1fc5f6c0
Authority 2:   0x000bcd493c3674f754335ae9fed13f206a716cde
Authority 3:   0x00373f0317411aa5cc7a4005c67bacc3c5c4e7c9
User:          0x004ec07d2329997267ec62b4166639513386f32e
```

## Phase 2: Register Nodes

1. Start all nodes (using the configuration for phase 2):

   ```bash
   ./start-node.sh auth1 2
   ./start-node.sh auth2 2
   ./start-node.sh auth3 2
   ./start-node.sh user 2
   ```

2. Register authority nodes 2 and 3 and the user node to authority node 1 at port 8041 (registration will be broadcasted to the other nodes):

    ```bash
    ./register-node.sh 8542
    ./register-node.sh 8543
    ./register-node.sh 8540

    # alternative
    ./register-node-all.sh
    ```

## Make Transactions

Check account balances:

```bash
$ ./get-balance.sh user
balance of user - 0x004ec07d2329997267ec62b4166639513386f32e is 10000000000000000000000 (0x21e19e0c9bab2400000)

$ ./get-balance.sh auth1
balance of auth1 - 0x0019dd4a8857af4969971a352f7b5bdd1fc5f6c0 is 0 (0x0)
```

Send Tokens:

```bash
./send-tokens.sh user auth1
balance of sender   (user) 10000000000000000000000
balance of receiver (auth1) 0
transaction ......
balance of sender   (user) 9999999999999999999000
balance of receiver (auth1) 1000


./send-tokens.sh user auth2
balance of sender   (user) 9999999999999999999000
balance of receiver (auth2) 0
transaction ......
balance of sender   (user) 9999999999999999989000
balance of receiver (auth2) 10000
```

## Deploy Smart Contract

Within the terminal in the `solidity-contract-testing` folder:

1. Compile and deploy the smart contract: `./compile.sh contracts/Dummy.sol`

2. Open geth (using the user account): `geth attach http://127.0.0.1:8542`

Within the geth console:

3. Load the contract: `loadScript('test.js')`

4. Call a function of the contract: `test.helloGuys()`

## Reset

Call `./rest.sh` to wipe the nodes and chain (accounts will be deleted).
