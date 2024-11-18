import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import type {
  DrinkingSessionId,
  DrinkKey,
  Drinks,
  DrinksList,
} from '@src/types/onyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useLocalize from '@hooks/useLocalize';
import DrinkData from '@libs/DrinkData';
import * as DSUtils from '@libs/DrinkingSessionUtils';
import * as DS from '@userActions/DrinkingSession';
import {useState} from 'react';
import {addDrinks, findDrinkName, sumDrinkTypes} from '@libs/DataHandling';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import CONST from '@src/CONST';
import Icon from './Icon';
import SessionDrinksInputWindow from './Buttons/SessionDrinksInputWindow';
import Button from './Button';
import useTheme from '@hooks/useTheme';

export type DrinkTypesViewProps = {
  /** ID of the session to render */
  sessionId: DrinkingSessionId;
};

const DrinkTypesView = ({sessionId}: DrinkTypesViewProps) => {
  const {translate} = useLocalize();
  const {preferences} = useDatabaseData();
  const styles = useThemeStyles();
  const theme = useTheme();

  const handleAddDrinks = (drinks: Drinks) => {
    DS.updateDrinks(
      sessionId,
      drinks,
      preferences?.drinks_to_units,
      CONST.DRINKS.ACTIONS.ADD,
    );
  };

  const handleRemoveDrinks = (drinks: Drinks) => {
    DS.updateDrinks(
      sessionId,
      drinks,
      preferences?.drinks_to_units,
      CONST.DRINKS.ACTIONS.REMOVE,
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
          const drinkName = findDrinkName(drinkKey);
          const iconSize = drinkKey === CONST.DRINKS.KEYS.SMALL_BEER ? 22 : 28;

          return (
            <View key={drink.key} style={localStyles.sessionDrinkContainer}>
              <View style={localStyles.iconContainer}>
                <Icon src={iconSource} height={iconSize} width={iconSize} />
              </View>
              <Text style={localStyles.drinkInfoText}>{drinkName}</Text>
              <Button
                style={[styles.bgTransparent, styles.p1]}
                onPress={() => handleRemoveDrinks({[drinkKey]: 1})}
                icon={KirokuIcons.Minus}
                iconFill={theme.textDark}
              />
              <SessionDrinksInputWindow
                sessionId={sessionId}
                drinkKey={drinkKey}
                // Add more input parameters
              />
              <Button
                style={[styles.bgTransparent, styles.p1]}
                onPress={() => handleAddDrinks({[drinkKey]: 1})}
                icon={KirokuIcons.Plus}
                iconFill={theme.textDark}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default DrinkTypesView;

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
  drinkInfoText: {
    flexGrow: 1,
    fontSize: 14,
    color: 'black',
    alignSelf: 'center',
    marginLeft: 5,
  },
});
