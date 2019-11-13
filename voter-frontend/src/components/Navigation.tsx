import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const Nav = styled.div`
  padding: 1em;
`;
const NavButton = styled.span`
  margin: 0 1em;
`;

export const Navigation: React.FC = () => {
  return (
    <Nav>
      <NavButton>
        <NavLink to={'/'}>FiniteField</NavLink>
      </NavButton>
      <NavButton>
        <NavLink to={'/curve'}>EcElGamal</NavLink>
      </NavButton>
    </Nav>
  );
};
