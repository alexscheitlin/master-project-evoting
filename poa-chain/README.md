# Ethereum POA Chain with Parity

## Prerequisite

Install JQ to process JSON in the command-line.

https://stedolan.github.io/jq/download/

Install BC (Basic calculator) to convert hex numbers to decimal numbers.

## Get Parity Ethereum Client Binary

1. Download the binary to this project's folder from:
   `https://github.com/paritytech/parity-ethereum/releases/tag/v2.5.9`
2. Make the binary executable
   `chmod +x parity`

## Run chain with simple nodes

1. Start node 0: `./1/scripts/start-node.sh 0`

2. Create the address for the first authority (on node 0): `./1/scripts/create-first-authority.sh`
   
   output: `{"jsonrpc":"2.0","result":"0x00bd138abd70e2f00903268f3db08f2d25677c9e","id":0}`

3. Create a user account: `./1/scripts/create-user.sh`
   
   output: `{"jsonrpc":"2.0","result":"0x004ec07d2329997267ec62b4166639513386f32e","id":0}`

4. Start node 1: `./1/scripts/start-node.sh 1`

5. Create the address for the second authority (on node 1): `./1/scripts/create-second-authority.sh`

    output: `{"jsonrpc":"2.0","result":"0x00aa39d30f0d20ff03a22ccfc30b7efbfca597c2","id":0}`

6. Stop both nodes.

Summary:

```
Node 0 Authority:   0x00bd138abd70e2f00903268f3db08f2d25677c9e
Node 1 Authority:   0x00aa39d30f0d20ff03a22ccfc30b7efbfca597c2
User:               0x004ec07d2329997267ec62b4166639513386f32e
```

## Run Chain with Sealer Nodes

1. Start node 1: `./2/scripts/start-node.sh 0`

2. Start node 1: `./2/scripts/start-node.sh 1`

### Connect the two Nodes

Only do this the first time: `./2/scripts/connect-nodes.sh`

### Make Transactions

Check account balances:

```bash
$ ./2/scripts/get-balance.sh n0a
balance of n0a - 0x00bd138abd70e2f00903268f3db08f2d25677c9e is 0 (0x0)

$ ./2/scripts/get-balance.sh n1a
balance of n1a - 0x00aa39d30f0d20ff03a22ccfc30b7efbfca597c2 is 0 (0x0)

$ ./2/scripts/get-balance.sh user
balance of user - 0x004ec07d2329997267ec62b4166639513386f32e is 10000000000000000000000 (0x21e19e0c9bab2400000)
```

Send Tokens (currently only possible to send from the user account):

```bash
$ ./2/scripts/send-tokens.sh user n0a
balance of sender   (user) 10000000000000000000000
balance of receiver (n0a) 0
transaction ...
{"jsonrpc":"2.0","result":"0x6fafdfb3d7596b2392ca8e52ba3065a6b50dfbdeff00a90ab8e87b93cf700d82","id":1}

$ ./2/scripts/get-balance.sh user
balance of user - 0x004ec07d2329997267ec62b4166639513386f32e is 9999999999999999999000 (0x21e19e0c9bab23ffc18)

$ ./2/scripts/get-balance.sh n0a
balance of n0a - 0x00bd138abd70e2f00903268f3db08f2d25677c9e is 1000 (0x3e8)
```

## Reset

Call `./rest.sh` to wipe the nodes and chain (accounts will be deleted).
