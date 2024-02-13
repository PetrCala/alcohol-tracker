import {validateAndParseInputToTimestamp} from '@libs/Utils';

describe('Test validateAndParseInputToTimestamp', () => {
  const validInput = '2020-01-01 00:00';
  const invalidInput = 'abcd-01-01 00:00';
  const invalidInput2 = 'asdfbs';

  it('should handle valid input', () => {
    const timestamp = validateAndParseInputToTimestamp(validInput);
    expect(timestamp).toBe(1577833200000);
  });

  it('should return a timestamp', () => {
    const timestamp = validateAndParseInputToTimestamp('2020-01-01 00:00');
    expect(typeof timestamp).toBe('number');
  });

  it('should handle invalid input 1', () => {
    expect(() => {
      validateAndParseInputToTimestamp(invalidInput);
    }).toThrow();
  });

  it('should handle invalid input 2', () => {
    expect(() => {
      validateAndParseInputToTimestamp(invalidInput2);
    }).toThrow();
  });
});
