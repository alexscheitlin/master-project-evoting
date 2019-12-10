# PoA Blockchain

Responsible for starting multiple sealers for the blockchain. The template for one sealer is in `sealer/`.

### `/keys`

This directory contains all pre-created sealer-keys that are needed to boot up a sealer node and in a later stage the parity-node.

### Dev Chain (only 3 parity-nodes)

run `./dev-chain-parity-nodes.sh`

This will start three parity-nodes and register their enodes with each other.

```bash
# Sealer 0
# Parity-node port 7010

# Sealer 1
# Parity-node port 7011

# Sealer 2
# Parity-node port 7012
```

### Dev Chain (3 full sealers)

run `./dev-chain-sealers.sh`

This wills start three full sealers, meaning 1 frontend, 1 backend and 1 parity-node per sealer.

**Have some patience, this takes a few minutes to start everything up.**

```bash
# Sealer 0
# ---------------------
# Backend     port 4010
# Frontend    port 3010
# Parity-node port 7010*

# Sealer 1
# ---------------------
# Backend     port 4011
# Frontend    port 3011
# Parity-node port 7011*

# Sealer 2
# ---------------------
# Backend     port 4012
# Frontend    port 3012
# Parity-node port 7012*
```

### Docker Commands

assume `docker ps`output this:

```bash
CONTAINER ID  IMAGE             COMMAND                 ... PORTS       NAMES
5d47f3836a61  sealer2_authority "/bin/parity --jsonr…"  ... 5001/tcp... sealer2_authority_1
f4eba04fbf07  sealer1_authority "/bin/parity --jsonr…"  ... 5001/tcp... sealer1_authority_1
c3dbdc54c67a  sealer0_authority "/bin/parity --jsonr…"  ... 5001/tcp... sealer0_authority_1
```

#### Show output from container (like starting it without --detach)

**`docker logs -f sealer2_authority_1`**

#### Get a bash shell inside a container to look around etc.

**`docker exec -it controller_2_frontend_1 bash`**

will give you root access to the container

```bash
root@0b3abdb2a1f2:/usr/src/frontend#
root@0b3abdb2a1f2:/usr/src/frontend# ls
Dockerfile  README.md  node_modules  package-lock.json	package.json  public  src  tsconfig.json
```

to exit

```bash
root@0b3abdb2a1f2:/usr/src/frontend# exit
```
