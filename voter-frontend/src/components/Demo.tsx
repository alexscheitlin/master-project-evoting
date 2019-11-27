import React from 'react';
import {FiniteFieldVoting} from './FiniteFieldVoting';
import {EllipticCurveVoting} from './EllipticCurveVoting';

const Demo: React.FC = () => {
  return (
    <>
      <FiniteFieldVoting />
      <EllipticCurveVoting />
    </>
  );
};

export default Demo;
