// // eslint-disable-next-line import/no-import-module-exports
// import mockRNLocalize from 'react-native-localize/mock';

// module.exports = mockRNLocalize;

jest.mock('react-native-localize', () => ({
  getLocales: () => [
    {countryCode: 'GB', languageTag: 'en-GB', languageCode: 'en', isRTL: false},
    {countryCode: 'US', languageTag: 'en-US', languageCode: 'en', isRTL: false},
    {countryCode: 'CZ', languageTag: 'cs-CZ', languageCode: 'cs', isRTL: false},
  ],

  getNumberFormatSettings: () => ({
    decimalSeparator: '.',
    groupingSeparator: ',',
  }),

  getCalendar: () => 'gregorian', // or "japanese", "buddhist"
  getCountry: () => 'CZ',
  getCurrencies: () => ['USD', 'EUR'], // can be empty array
  getTemperatureUnit: () => 'celsius', // or "fahrenheit"
  getTimeZone: () => 'Europe/Prague',
  uses24HourClock: () => true,
  usesMetricSystem: () => true,

  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));
