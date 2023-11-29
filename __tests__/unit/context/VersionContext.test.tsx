import { validateAppVersion } from "../../../src/utils/validation";

describe('validateAppVersion', () => {
    // Mock the current version of the application
    let mockCurrentVersion = '5.6.7';
    // Mock minimum required versions to test against
    let olderMinorVersion = '5.6.6';
    let newerMinorVersion = '5.6.8';
    let olderMiddleVersion = '5.5.8';
    let newerMiddleVersion = '5.7.8';
    let olderMajorVersion = '4.6.8';
    let newerMajorVersion = '6.6.8';

    it('validates minor version number correctly', () => {
        let olderMinorVersionResult = validateAppVersion(olderMinorVersion, mockCurrentVersion);
        let newerMinorVersionResult = validateAppVersion(newerMinorVersion, mockCurrentVersion);

        expect(olderMinorVersionResult.success).toBe(true);
        expect(newerMinorVersionResult.success).toBe(false);
    });

    it('validates middle version number correctly', () => {
        let olderMiddleVersionResult = validateAppVersion(olderMiddleVersion, mockCurrentVersion);
        let newerMiddleVersionResult = validateAppVersion(newerMiddleVersion, mockCurrentVersion);

        expect(olderMiddleVersionResult.success).toBe(true);
        expect(newerMiddleVersionResult.success).toBe(false);
    });

    it('validates major version number correctly', () => {
        let olderMajorVersionResult = validateAppVersion(olderMajorVersion, mockCurrentVersion);
        let newerMajorVersionResult = validateAppVersion(newerMajorVersion, mockCurrentVersion);

        expect(olderMajorVersionResult.success).toBe(true);
        expect(newerMajorVersionResult.success).toBe(false);
    });

});