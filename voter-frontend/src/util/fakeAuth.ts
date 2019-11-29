// REPLACE WITH CALLS TO BACKEND
export const delay = (t: number) => new Promise(resolve => setTimeout(resolve, t));

interface AuthResponse {
  token: string;
}

export const loginUser = (username: string, password: string) => {
  return delay(100).then(() => new Promise<AuthResponse>(resolve => setTimeout(resolve({token: '123456789'}), 3000)));
};

export const logoutUser = () => {
  return delay(500).then(() => new Promise(resolve => resolve));
};
