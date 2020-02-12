# PoA Blockchain

Responsible for starting multiple sealers for the blockchain. The template for one sealer is in `sealer/`.

## What is a Sealer

A sealer consists of:

- a frontend (source files in `sealer/frontend`)
- a backend (source files in `sealer/backend`)
- Ethereum blockchain node (source files in `sealer/parity-node`)

### Keys

This directory contains all pre-created sealer-keys that are needed to boot up a sealer node and in a later stage the parity-node.

### Dev Chain (only 3 parity-nodes)

```bash
./dev-chain-parity-nodes.sh
```

This will start three parity-nodes and register their enodes with each other.

### Dev Chain (3 full sealers)

```bash
./dev-chain-sealers.sh
```

This wills start three **full sealers**: 1 frontend, 1 backend and 1 parity-node **per** sealer.

**Have some patience, this takes a few minutes to start everything up.**

### Docker Commands

assume the `docker ps` output looks like this:

```bash
CONTAINER ID  IMAGE             COMMAND                 ... PORTS       NAMES
5d47f3836a61  sealer2_authority "/bin/parity --jsonr…"  ... 5001/tcp... sealer2_authority_1
f4eba04fbf07  sealer1_authority "/bin/parity --jsonr…"  ... 5001/tcp... sealer1_authority_1
c3dbdc54c67a  sealer0_authority "/bin/parity --jsonr…"  ... 5001/tcp... sealer0_authority_1
```

#### Show output from container (like starting it without --detach)

```shell
docker logs -f sealer2_authority_1
```

#### Get a bash shell inside a container to look around etc.

```shell
docker exec -it controller_2_frontend_1 bash
```

will give you access to the container

```shell
root@0b3abdb2a1f2:/usr/src/frontend#
root@0b3abdb2a1f2:/usr/src/frontend# ls
Dockerfile  README.md  node_modules  package-lock.json	package.json  public  src  tsconfig.json
```

to exit

```shell
root@0b3abdb2a1f2:/usr/src/frontend# exit
```
