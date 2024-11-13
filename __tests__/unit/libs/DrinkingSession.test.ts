import * as DS from '@libs/actions/DrinkingSession';
import type {DrinkingSession} from '@src/types/onyx';
import {createMockSession} from '@src/database/MockDatabase';
import {differenceInDays} from 'date-fns';

describe('updateSessionDate', () => {
  let session: DrinkingSession;

  beforeEach(() => {
    session = createMockSession(new Date(2021, 5, 1));
  });

  /** Check that the timestamps of the new session have been shifted by a certain amount */
  const runTest = (newDate: Date, daysSubbed: number) => {
    const newSession = DS.updateSessionDate(session, newDate);
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
