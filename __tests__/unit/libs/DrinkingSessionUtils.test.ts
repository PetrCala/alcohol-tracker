import * as DSUtils from '@libs/DrinkingSessionUtils';
import type {DrinkingSession, DrinksList, DrinksToUnits} from '@src/types/onyx';
import {createMockSession} from '../../../src/database/MockDatabase';
import CONST from '@src/CONST';
import {getZeroDrinksList} from '@libs/DataHandling';

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

describe('calculateTotalUnits', () => {
  it('should return 0 if all drinks are 0', () => {
    const zeroDrinks: DrinksList = {
      1632423423: {
        beer: 0,
        cocktail: 0,
        other: 0,
      },
      1632434223: {
        beer: 0,
      },
    };
    const zeroDrinksToUnits: DrinksToUnits = {
      small_beer: 0,
      beer: 0,
      cocktail: 0,
      other: 0,
      strong_shot: 0,
      weak_shot: 0,
      wine: 0,
    };
    const result = DSUtils.calculateTotalUnits(zeroDrinks, zeroDrinksToUnits);
    expect(result).toBe(0);
  });

  it('should correctly handle missing keys in DrinksList', () => {
    const partialDrinks: DrinksList = {
      1632423423: {
        beer: 2,
        cocktail: 1,
      },
      1632434223: {
        other: 3,
      },
    };
    const sampleDrinksToUnits: DrinksToUnits = {
      small_beer: 3,
      beer: 5,
      cocktail: 10,
      other: 1,
      strong_shot: 15,
      weak_shot: 5,
      wine: 7,
    };
    const result = DSUtils.calculateTotalUnits(
      partialDrinks,
      sampleDrinksToUnits,
    );
    expect(result).toBe(2 * 5 + 1 * 10 + 3 * 1);
  });
});
