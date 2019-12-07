# PoA Blockchain

Responsible for starting multiple sealers. The template for one sealer is in `sealer/`.

### `/keys`

This directory contains all pre-created sealer-keys that are needed to boot up a sealer node and in a later stage the parity-node aswell.

### `/scripts`

This directory contains minimal scripts to:

- start a blockchain with three parity-nodes with `dev-chain.sh`
- start 1 sealer (only frontend + backend) with `start-sealer.sh`
- and some helper scripts
