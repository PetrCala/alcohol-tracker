import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import * as Localize from '@libs/Localize';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// TODO enable this after fixing the localize bugs
xdescribe('localize', () => {
  beforeAll(() => {
    Onyx.init({
      keys: {NVP_PREFERRED_LOCALE: ONYXKEYS.NVP_PREFERRED_LOCALE},
      initialKeyStates: {
        [ONYXKEYS.NVP_PREFERRED_LOCALE]: CONST.LOCALES.DEFAULT,
      },
    });
    return waitForBatchedUpdates();
  });

  afterEach(() => Onyx.clear());

  describe('formatList', () => {
    test.each([
      [
        [],
        {
          [CONST.LOCALES.DEFAULT]: '',
          [CONST.LOCALES.CS_CZ]: '',
        },
      ],
      [
        ['rory'],
        {
          [CONST.LOCALES.DEFAULT]: 'rory',
          [CONST.LOCALES.CS_CZ]: 'rory',
        },
      ],
      [
        ['rory', 'vit'],
        {
          [CONST.LOCALES.DEFAULT]: 'rory and vit',
          [CONST.LOCALES.CS_CZ]: 'rory and vit',
        },
      ],
      [
        ['rory', 'vit', 'jules'],
        {
          [CONST.LOCALES.DEFAULT]: 'rory, vit, and jules',
          [CONST.LOCALES.CS_CZ]: 'rory, vit and jules',
        },
      ],
      [
        ['rory', 'vit', 'ionatan'],
        {
          [CONST.LOCALES.DEFAULT]: 'rory, vit, and ionatan',
          [CONST.LOCALES.CS_CZ]: 'rory, vit and ionatan',
        },
      ],
    ])(
      'formatList(%s)',
      (
        input,
        {
          [CONST.LOCALES.DEFAULT]: expectedOutput,
          [CONST.LOCALES.CS_CZ]: expectedOutputCSCZ,
        },
      ) => {
        expect(Localize.formatList(input)).toBe(expectedOutput);
        // eslint-disable-next-line rulesdir/prefer-actions-set-data
        return Onyx.set(
          ONYXKEYS.NVP_PREFERRED_LOCALE,
          CONST.LOCALES.CS_CZ,
        ).then(() =>
          expect(Localize.formatList(input)).toBe(expectedOutputCSCZ),
        );
      },
    );
  });
});
