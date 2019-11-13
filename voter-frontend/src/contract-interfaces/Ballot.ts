import BN from 'bn.js';

export interface BallotIF {
  test(): Promise<BN>;
}
