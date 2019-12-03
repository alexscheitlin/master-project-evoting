import { FFelGamal } from 'mp-crypto';

export const castYesVote = async (contract: any, wallet: string): Promise<string> => {
  // get system parameters from contract
  const params = await contract.methods.getParameters().call({ from: wallet });
  console.log(params);

  // get public key from contract

  // create vote
  // create proof
  // send to contract for validation
  // return proof for the voter
  return '<returned proof>';
};

export const castNoVote = async (contract: any, wallet: string): Promise<string> => {
  // get system parameters from contract
  const params = await contract.methods.getParameters().call({ from: wallet });
  console.log(params);

  // get public key from contract

  // create vote
  // create proof
  // send to contract for validation
  // return proof for the voter
  return '<returned proof>';
};
