import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { Routes } from './Router';

import styled from 'styled-components';

const Layout = styled.div`
  padding: 1em;
`;

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes />
      </Layout>
    </Router>
  );
};

export default App;