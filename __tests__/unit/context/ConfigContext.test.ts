import {validateAppVersion} from '../../../src/libs/Validation';

describe('validateAppVersion', () => {
  // Mock the current version of the application
  const mockCurrentVersion = '5.6.7-0';
  // Mock minimum required versions to test against
  const olderMinorVersion = '5.6.6-0';
  const newerMinorVersion = '5.6.8-0';
  const olderMiddleVersion = '5.5.8-0';
  const newerMiddleVersion = '5.7.8-0';
  const olderMajorVersion = '4.6.8-0';
  const newerMajorVersion = '6.6.8-0';
  const olderBuildNumber = '5.6.7-1';
  const newerBuildNumber = '5.6.7-2';
  const newerVersionWithLowerBuildNumber = '5.6.8-0';

  it('validates minor version number correctly', () => {
    const olderMinorVersionResult = validateAppVersion(
      olderMinorVersion,
      mockCurrentVersion,
    );
    const newerMinorVersionResult = validateAppVersion(
      newerMinorVersion,
      mockCurrentVersion,
    );

    expect(olderMinorVersionResult.success).toBe(true);
    expect(newerMinorVersionResult.success).toBe(false);
  });

  it('validates middle version number correctly', () => {
    const olderMiddleVersionResult = validateAppVersion(
      olderMiddleVersion,
      mockCurrentVersion,
    );
    const newerMiddleVersionResult = validateAppVersion(
      newerMiddleVersion,
      mockCurrentVersion,
    );

    expect(olderMiddleVersionResult.success).toBe(true);
    expect(newerMiddleVersionResult.success).toBe(false);
  });

  it('validates major version number correctly', () => {
    const olderMajorVersionResult = validateAppVersion(
      olderMajorVersion,
      mockCurrentVersion,
    );
    const newerMajorVersionResult = validateAppVersion(
      newerMajorVersion,
      mockCurrentVersion,
    );

    expect(olderMajorVersionResult.success).toBe(true);
    expect(newerMajorVersionResult.success).toBe(false);
  });

  it('validates build number correctly', () => {
    const olderBuildNumberResult = validateAppVersion(
      olderBuildNumber,
      newerBuildNumber,
    );

    expect(olderBuildNumberResult.success).toBe(true);
  });

  it('validates version with lower build number correctly', () => {
    const newerVersionWithLowerBuildNumberResult = validateAppVersion(
      olderBuildNumber,
      newerVersionWithLowerBuildNumber,
    );

    expect(newerVersionWithLowerBuildNumberResult.success).toBe(true);
  });
});
