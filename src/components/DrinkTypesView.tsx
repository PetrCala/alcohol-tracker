import {StyleSheet, View} from 'react-native';
import type {DrinkingSession, DrinkKey} from '@src/types/onyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useLocalize from '@hooks/useLocalize';
import DrinkData from '@libs/DrinkData';
import * as DS from '@userActions/DrinkingSession';
import {findDrinkNameTranslationKey} from '@libs/DataHandling';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import CONST from '@src/CONST';
import useTheme from '@hooks/useTheme';
import * as KirokuIcons from './Icon/KirokuIcons';
import Icon from './Icon';
import SessionDrinksInputWindow from './Buttons/SessionDrinksInputWindow';
import Button from './Button';
import Text from './Text';

export type DrinkTypesViewProps = {
  /** The session to render */
  session: DrinkingSession;
};

function DrinkTypesView({session}: DrinkTypesViewProps) {
  const {translate} = useLocalize();
  const {preferences} = useDatabaseData();
  const styles = useThemeStyles();
  const theme = useTheme();

  const handleAddDrinks = (drinkKey: DrinkKey, amount: number) => {
    DS.updateDrinks(
      session?.id,
      drinkKey,
      amount,
      CONST.DRINKS.ACTIONS.ADD,
      preferences?.drinks_to_units,
    );
  };

  const handleRemoveDrinks = (drinkKey: DrinkKey, amount: number) => {
    DS.updateDrinks(
      session?.id,
      drinkKey,
      amount,
      CONST.DRINKS.ACTIONS.REMOVE,
      preferences?.drinks_to_units,
    );
  };

  return (
    <View style={localStyles.mainContainer}>
      <View style={[localStyles.tab, styles.borderColorTheme]}>
        <Text style={styles.headerText}>
          {translate('liveSessionScreen.drinksConsumed')}
        </Text>
      </View>
      <View>
        {DrinkData.map(drink => {
          const drinkKey = drink.key;
          const iconSource = drink.icon;
          const drinkName = translate(findDrinkNameTranslationKey(drinkKey));
          const iconSize = drinkKey === CONST.DRINKS.KEYS.SMALL_BEER ? 22 : 28;

          return (
            <View key={drink.key} style={localStyles.sessionDrinkContainer}>
              <View style={localStyles.iconContainer}>
                <Icon
                  fill={theme.textDark}
                  src={iconSource}
                  height={iconSize}
                  width={iconSize}
                />
              </View>
              <Text style={[styles.flexGrow1, styles.ml1]}>{drinkName}</Text>
              <Button
                style={[styles.bgTransparent, styles.p1]}
                onPress={() => handleRemoveDrinks(drinkKey, 1)}
                icon={KirokuIcons.Minus}
                iconFill={theme.textDark}
              />
              <SessionDrinksInputWindow
                drinks={session?.drinks}
                drinkKey={drinkKey}
                sessionId={session?.id}
              />
              <Button
                style={[styles.bgTransparent, styles.p1]}
                onPress={() => handleAddDrinks(drinkKey, 1)}
                icon={KirokuIcons.Plus}
                iconFill={theme.textDark}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default DrinkTypesView;

// eslint-disable-next-line @typescript-eslint/no-use-before-define
const localStyles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    paddingBottom: 4,
  },
  tab: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderTopWidth: 1,
    marginHorizontal: 12,
  },
  sessionDrinkContainer: {
    paddingTop: 4,
    paddingBottom: 4,
    marginLeft: 12,
    marginRight: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    marginLeft: 4,
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
