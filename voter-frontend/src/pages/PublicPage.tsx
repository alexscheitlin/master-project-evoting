import React from 'react';
import {Link} from 'react-router-dom';

const PublicPage: React.FC = () => {
  return (
    <div>
      <h1>Public Page</h1>
      <button>
        <Link to={'/login'}>To Login</Link>
      </button>
    </div>
  );
};

export default PublicPage;
