import axios from 'axios';

export const config = {
  url: 'http://localhost:8545',
  backend: 'http://localhost:3001',
};

axios.defaults.baseURL = 'http://localhost:3001';
