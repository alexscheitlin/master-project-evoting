import React from 'react';
import { VotingState } from '../../../models/voting';

interface Props {
  votingState: VotingState;
  votingQuestion: string;
}

export const VoteOpen: React.FC<Props> = ({ votingState, votingQuestion }) => {
  return (
    <div>
      <h1>The Vote Is Open!!!</h1>
      <p>{votingState}</p>
      <p>{votingQuestion}</p>
    </div>
  );
};
