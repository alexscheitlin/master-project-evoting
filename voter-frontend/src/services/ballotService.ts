import { FFelGamal } from 'mp-crypto';
import BN from 'bn.js';
import Web3 from 'web3';

// HELPERS
export const toSystemParams = (params: BN[]): FFelGamal.SystemParameters => {
  const systemParams: FFelGamal.SystemParameters = {
    p: new BN(params[0]),
    q: new BN(params[1]),
    g: new BN(params[2]),
  };
  return systemParams;
};

const toHex = (number: BN) => Web3.utils.toHex(number);

/**
 * Sends a vote to the blockchain to be verified and accepted
 * @param proof proof of the vote
 * @param vote the cipher of the vote
 * @param contract the contract object
 * @param wallet the ETH address
 */
const submitVote = async (
  proof: FFelGamal.Proof.MembershipProof,
  vote: FFelGamal.Cipher,
  contract: any,
  wallet: string,
) => {
  try {
    await contract.methods
      .vote(
        [toHex(vote.a), toHex(vote.b)],
        [toHex(proof.a0), toHex(proof.a1)],
        [toHex(proof.b0), toHex(proof.b1)],
        [toHex(proof.c0), toHex(proof.c1)],
        [toHex(proof.f0), toHex(proof.f1)],
      )
      .send({ from: wallet });
    return true;
  } catch (error) {
    throw new Error(`Vote submission failed: ${error.message}`);
  }
};

const getContractParameters = async (contract: any): Promise<[BN, FFelGamal.SystemParameters]> => {
  let systemParameters: FFelGamal.SystemParameters;
  let publicKey: BN;

  try {
    const paramsFromContract = await contract.methods.getParameters().call();

    systemParameters = toSystemParams(paramsFromContract);
  } catch (error) {
    throw new Error(`Unable to get system parameters from contract: ${error.message}`);
  }

  try {
    publicKey = await contract.methods.getPublicKey().call();
  } catch (error) {
    throw new Error(`Unable to get public key from contract: ${error.message}`);
  }

  return [new BN(publicKey), systemParameters];
};

export const castYesVote = async (contract: any, wallet: string): Promise<boolean> => {
  const [publicKey, systemParameters] = await getContractParameters(contract);
  const vote = FFelGamal.Voting.generateYesVote(systemParameters, publicKey);
  const proof = FFelGamal.Proof.Membership.generateYesProof(vote, systemParameters, publicKey, wallet);

  try {
    await submitVote(proof, vote, contract, wallet);
    return true;
  } catch (error) {
    throw new Error(`Could not send vote and proof to contract: ${error.message}`);
  }
};

export const castNoVote = async (contract: any, wallet: string): Promise<boolean> => {
  const [publicKey, systemParameters] = await getContractParameters(contract);
  // generate and submit noVote
  const vote = FFelGamal.Voting.generateNoVote(systemParameters, publicKey);
  const proof = FFelGamal.Proof.Membership.generateNoProof(vote, systemParameters, publicKey, wallet);

  try {
    await submitVote(proof, vote, contract, wallet);
    return true;
  } catch (error) {
    throw new Error(`Could not send vote and proof to contract: ${error.message}`);
  }
};
