const setupGlobalMocks = () => {
  let originalWarn: typeof console.warn;

  beforeEach(() => {
    originalWarn = console.warn; // Save the original console.warn method
    jest.spyOn(console, 'warn').mockImplementation(message => {
      // Silence the @firebase/database permission_denied warnings
      if (!message.includes('permission_denied')) {
        originalWarn(message);
      }
    });
  });

  afterEach(() => {
    (console.warn as jest.Mock).mockRestore(); // Restore the original console.warn method
  });
};

export {setupGlobalMocks};
