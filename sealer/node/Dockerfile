ARG PARITY_VERSION=${PARITY_VERSION}
FROM parity/parity:${PARITY_VERSION}

ARG NETWORK_NAME=${NETWORK_NAME}

USER root

# copy into /parity/config/
COPY --chown=parity ./node/authority.toml /parity/config/authority.toml
COPY --chown=parity ./node/chain.json /parity/config/chain.json

# COPY --chown=parity ./node/authority.json /home/parity/.local/share/io.parity.ethereum/keys/${NETWORK_NAME}/authority.json

# copy key file
COPY --chown=parity ./node/sealer.json /home/parity/.local/share/io.parity.ethereum/keys/${NETWORK_NAME}/authority.json

# copy password to /parity
COPY --chown=parity ./node/sealer.pwd /parity/authority.pwd

# copy network key
COPY --chown=parity ./node/sealer.network.key /home/parity/.local/share/io.parity.ethereum/network/key

RUN mkdir -p /home/parity/.local/share/io.parity.ethereum/chains/${NETWORK_NAME}/db
RUN chown -R parity: /home/parity/.local/share/io.parity.ethereum

USER parity
