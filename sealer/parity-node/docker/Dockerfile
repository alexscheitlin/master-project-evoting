# Builds a modified parity image
#
# If the image is used normally, we would only have user priviledges, meaning
# you cannot write to directories used by parity, such as /home/parity/.local/share/io.parity.ethereum.
# Therefore this Dockerfile is used to copy over directories and files (instead of mounting as volumes).
#
# We start as root user and then change owner to parity
#
# This allows us to copy over resources needed at runtime (e.g., the KeyStore file and Password)

FROM parity/parity:stable

ARG NETWORK_NAME=${NETWORK_NAME}
ARG ID=${ID}

USER root

COPY --chown=parity ./config/chain.json /parity/config/chain.json
COPY --chown=parity ./config/authority.toml /parity/config/authority.toml

COPY --chown=parity ./keys/sealer${ID}.json /home/parity/.local/share/io.parity.ethereum/keys/${NETWORK_NAME}/sealer.json
COPY --chown=parity ./keys/sealer${ID}.pwd /parity/sealer.pwd

RUN mkdir -p /home/parity/.local/share/io.parity.ethereum/chains/${NETWORK_NAME}/db
RUN chown -R parity: /home/parity/.local/share/io.parity.ethereum

USER parity