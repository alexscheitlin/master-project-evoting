import React, { useState } from 'react';

type VoteProps = {
  title: string;
  question: string;
};

type VoteState = {
  title: string;
  question: string;
};

export const Vote: React.FC = () => {
  const [question, setQuestion] = useState<string>('');

  const handleInputChange = (event: React.FormEvent<HTMLInputElement>) => {
    setQuestion(event.currentTarget.value);
  };

  return (
    <div>
      <h1>E-Voting Admin Backend</h1>
      <h2>Please enter a new question for the vote to be created?</h2>
      <div>
        <label style={styles.vote}>Voting Question</label>
        <input style={styles.vote} type="text" onChange={handleInputChange}></input>
        <label style={styles.vote}>{question}</label>
      </div>
    </div>
  );
};

const styles = {
  vote: {
    margin: '0 1em 0 0'
  }
};
