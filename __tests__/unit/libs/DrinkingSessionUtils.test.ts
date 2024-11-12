import * as DSUtils from '@libs/DrinkingSessionUtils';
import type {DrinkingSession} from '@src/types/onyx';
import {createMockSession} from '../../../src/database/MockDatabase';
import CONST from '@src/CONST';
import {getZeroDrinksList} from '@libs/DataHandling';
import {differenceInDays, intervalToDuration} from 'date-fns';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

describe('determineSessionMostCommonDrink', () => {
  let session: DrinkingSession;

  beforeEach(() => {
    session = createMockSession(new Date());
  });

  it('identifies the most common drink with a single type', () => {
    session.drinks = {
      1588412400000: {beer: 3},
    };
    expect(DSUtils.determineSessionMostCommonDrink(session)).toBe(
      CONST.DRINKS.KEYS.BEER,
    );
  });

  it("returns 'other' in case there are multiple units with the highest count", () => {
    session.drinks = {
      1588412400000: {beer: 2, wine: 1},
      1588498800000: {beer: 1, cocktail: 3},
    };
    expect(DSUtils.determineSessionMostCommonDrink(session)).toBe(
      CONST.DRINKS.KEYS.OTHER,
    );
  });

  it('returns null in case all units are set to 0', () => {
    session.drinks = getZeroDrinksList();
    expect(DSUtils.determineSessionMostCommonDrink(session)).toBeNull();
  });

  it('returns null for a session with no drinks', () => {
    session.drinks = {};
    expect(DSUtils.determineSessionMostCommonDrink(session)).toBeNull();
  });
});

describe('shiftSessionDate', () => {
  let session: DrinkingSession;

  beforeEach(() => {
    session = createMockSession(new Date(2021, 5, 1));
  });

  /** Check that the timestamps of the new session have been shifted by a certain amount */
  const runTest = (newDate: Date, daysSubbed: number) => {
    const newSession = DSUtils.shiftSessionDate(session, newDate);
    expect(differenceInDays(session.start_time, newSession.start_time)).toBe(
      daysSubbed,
    );
    expect(differenceInDays(session.end_time, newSession.end_time)).toBe(
      daysSubbed,
    );
  };

  it('shifts the date of a session one day forward', () => {
    runTest(new Date(2021, 5, 2), -1); // Subbed -1 days
  });

  it('does not modify the original session', () => {
    runTest(new Date(session.start_time), 0);
  });

  it('shifts the date of a session one day backward', () => {
    runTest(new Date(2021, 4, 31), 1); // Subbed 1 day
  });
});
