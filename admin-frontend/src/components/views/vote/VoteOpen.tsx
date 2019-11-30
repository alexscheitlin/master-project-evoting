import React from 'react';
import { useGlobalState } from '../../../gloablState';

export const VoteOpen: React.FC = () => {
  const state = useGlobalState('voteState');
  const question = useGlobalState('voteQuestion');

  return (
    <div>
      <h1>The Vote Is Open!!!</h1>
      <p>{state}</p>
      <p>{question}</p>
    </div>
  );
};
