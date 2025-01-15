import type {UnitsToColors, DrinksToUnits} from '@src/types/onyx';

// Realtime database test user information
const TEST_UID = 'dmXj9O2SqWWHPRtqtKGGdaUzGFt2';
const TEST_NICKNAME = 'test123';

// Unit tests test user database information
const MOCK_USER_IDS = [
  'mock-user-1',
  'mock-user-2',
  'mock-user-3',
  'mock-user-4',
  'mock-user-5',
];

const MOCK_SESSION_IDS = ['mock-session-1', 'mock-session-2', 'mock-session-3'];

const SAMPLE_UNITS_TO_COLORS: UnitsToColors = {
  yellow: 2,
  orange: 4,
};

const SAMPLE_DRINKS_TO_UNITS: DrinksToUnits = {
  small_beer: 3,
  beer: 5,
  cocktail: 10,
  other: 1,
  strong_shot: 15,
  weak_shot: 5,
  wine: 7,
};

export {
  TEST_UID,
  TEST_NICKNAME,
  MOCK_USER_IDS,
  MOCK_SESSION_IDS,
  SAMPLE_UNITS_TO_COLORS,
  SAMPLE_DRINKS_TO_UNITS,
};
