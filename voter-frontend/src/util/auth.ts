export const fakeAuth = {
  isAuthenticated: false,
  authenticate(cb: Function) {
    fakeAuth.isAuthenticated = true;
    setTimeout(cb, 100); // fake async
  },
  signout(cb: Function) {
    fakeAuth.isAuthenticated = false;
    setTimeout(cb, 100);
  },
};
