import {isNonEmptyObject} from '../../../src/utils/validation';

describe('isNonEmptyObject', () => {
  it('should return true for non-empty objects', () => {
    const nonEmptyObject = {key: 'value'};
    expect(isNonEmptyObject(nonEmptyObject)).toBeTruthy();
  });

  it('should return false for empty objects', () => {
    const emptyObject = {};
    expect(isNonEmptyObject(emptyObject)).toBeFalsy();
  });

  it('should return false for non-object types', () => {
    const testData = [
      42,
      'string',
      true,
      null,
      undefined,
      [],
      () => {},
      Symbol('sym'),
    ];
    testData.forEach(value => {
      expect(isNonEmptyObject(value)).toBeFalsy();
    });
  });

  it('should not throw an exception for null or undefined values', () => {
    const values = [null, undefined];
    values.forEach(value => {
      expect(() => isNonEmptyObject(value)).not.toThrow();
    });
  });

  it('should return false for arrays, even if they are not empty', () => {
    const nonEmptyArray = [1, 2, 3];
    expect(isNonEmptyObject(nonEmptyArray)).toBeFalsy();
  });

  it('should return false undefined', () => {
    const nonEmptyArray = undefined;
    expect(isNonEmptyObject(nonEmptyArray)).toBeFalsy();
  });
});
