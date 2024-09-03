jest.mock('firebase/app', () => {
  return {
    auth: jest.fn(),
  };
});

// Usage
//    (firebase.auth as jest.Mocked<any>).mockReturnValueOnce({
//       currentUser: { email: 'example@gmail.com', uid: 1, emailVerified: true },
//     });
// const actual = App.getLoggedInUser();
