import { cleanStringForFirebaseKey } from '../../../src/utils/strings';

describe('cleanStringForFirebaseKey', () => {
  it('should replace sequences of invalid characters and/or whitespaces with a single underscore', () => {
    const input = ".#   []$";
    const output = cleanStringForFirebaseKey(input);
    expect(output).toBe("_");
  });

  it('should handle strings with interspersed valid characters correctly', () => {
    const input = "John .#[]$ Doe";
    const output = cleanStringForFirebaseKey(input);
    expect(output).toBe("john_doe");
  });

  it('should handle empty strings', () => {
    const input = "";
    const output = cleanStringForFirebaseKey(input);
    expect(output).toBe("");
  });

  it('should handle strings without invalid characters or spaces', () => {
    const input = "JohnDoe";
    const output = cleanStringForFirebaseKey(input);
    expect(output).toBe("johndoe");
  });

  it('should handle only spaces', () => {
    const input = "   ";
    const output = cleanStringForFirebaseKey(input);
    expect(output).toBe("_");
  });
});
