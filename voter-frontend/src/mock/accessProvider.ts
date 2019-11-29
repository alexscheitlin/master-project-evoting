import {mock, axios} from './axiosMock';

// Mock any GET request
// arguments for reply are (status, data, headers)
mock.onGet('/fundWallet', {params: {token: '123456789', wallet: '0x02191612638124780216416783612739'}}).reply(200, {
  success: true,
  wallet: '0x02191612638124780216416783612739',
});

export const fundWallet = async (token: string, wallet: string) => {
  return new Promise(resolve =>
    axios.get('/fundWallet', {params: {token: token, wallet: wallet}}).then((res: any) => {
      return resolve(res.data);
    }),
  );
};
