export const setupGlobalMocks = () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(message => {
      // Silence the @firebase/database permission_denied warnings
      if (!message.includes('permission_denied')) {
        jest.requireActual('console').warn(message);
      }
    });
  });

  afterEach(() => {
    console.warn.mockRestore();
  });
};
