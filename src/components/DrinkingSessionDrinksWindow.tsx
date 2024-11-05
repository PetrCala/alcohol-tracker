import type {ImageSourcePropType} from 'react-native';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import SessionDrinksInputWindow from './Buttons/SessionDrinksInputWindow';
import {
  addDrinks,
  findDrinkName,
  removeDrinks,
  sumDrinkTypes,
  sumDrinksOfSingleType,
} from '@libs/DataHandling';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import type {DrinkKey, Drinks, DrinksList} from '@src/types/onyx';
import Icon from './Icon';
import CONST from '@src/CONST';

type DrinkingSessionDrinksWindowProps = {
  drinkKey: DrinkKey;
  iconSource: ImageSourcePropType;
  currentDrinks: DrinksList | undefined;
  setCurrentDrinks: (newDrinks: DrinksList | undefined) => void;
  availableUnits: number;
};

const DrinkingSessionDrinksWindow = ({
  drinkKey,
  iconSource,
  currentDrinks,
  setCurrentDrinks,
  availableUnits,
}: DrinkingSessionDrinksWindowProps) => {
  const handleAddDrinks = (drinks: Drinks) => {
    const newDrinkCount = sumDrinkTypes(drinks); // Number of added drinks
    if (newDrinkCount > 0 && newDrinkCount <= availableUnits) {
      // TODO this could overflow
      const newDrinks: DrinksList | undefined = addDrinks(
        currentDrinks,
        drinks,
      );
      setCurrentDrinks(newDrinks);
    }
  };

  const handleRemoveDrinks = (drinkType: DrinkKey, count: number) => {
    if (sumDrinksOfSingleType(currentDrinks, drinkKey) > 0) {
      const newDrinks: DrinksList | undefined = removeDrinks(
        currentDrinks,
        drinkType,
        count,
      );
      setCurrentDrinks(newDrinks);
    }
  };

  const drinkName = findDrinkName(drinkKey);
  const iconSize = drinkKey === CONST.DRINKS.KEYS.SMALL_BEER ? 22 : 28;

  return (
    <View style={styles.sessionDrinkContainer}>
      <View style={styles.iconContainer}>
        <Icon src={iconSource} height={iconSize} width={iconSize} />
      </View>
      <Text style={styles.drinkInfoText}>{drinkName}</Text>
      <TouchableOpacity
        accessibilityRole="button"
        style={styles.adjustDrinksButton}
        onPress={() => handleRemoveDrinks(drinkKey, 1)}>
        <Image source={KirokuIcons.Minus} style={styles.adjustDrinksIcon} />
      </TouchableOpacity>
      <SessionDrinksInputWindow
        drinkKey={drinkKey}
        currentDrinks={currentDrinks}
        setCurrentDrinks={setCurrentDrinks}
        availableUnits={availableUnits}
      />
      <TouchableOpacity
        accessibilityRole="button"
        style={styles.adjustDrinksButton}
        onPress={() => handleAddDrinks({[drinkKey]: 1})}>
        <Icon src={KirokuIcons.Plus} additionalStyles={{alignSelf: 'center'}} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
    fontWeight: 'bold',
    alignSelf: 'center',
    marginLeft: 5,
  },
  adjustDrinksButton: {
    width: 50,
    height: 50,
    alignSelf: 'flex-end',
    alignContent: 'center',
    justifyContent: 'center',
  },
  adjustDrinksIcon: {
    width: 17,
    height: 17,
    alignSelf: 'center',
  },
});

export default DrinkingSessionDrinksWindow;
