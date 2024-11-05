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
import CONST from '@src/CONST';
import type {DrinkKey, Drinks, DrinksList} from '@src/types/onyx';
import Icon from './Icon';

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

  return (
    <View style={styles.sessionDrinkContainer}>
      <View style={styles.iconContainer}>
        <Image
          source={iconSource}
          style={
            drinkKey === CONST.DRINKS.KEYS.SMALL_BEER
              ? styles.smallIconStyle
              : styles.normalIconStyle
          }
        />
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
        styles={styles}
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
    borderBottomWidth: 0,
    paddingTop: 4,
    paddingBottom: 4,
    marginLeft: 12,
    marginRight: 12,
    borderColor: 'gray',
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
  normalIconStyle: {
    width: '100%',
    height: '100%',
  },
  smallIconStyle: {
    width: '75%',
    height: '75%',
  },
  drinkInfoText: {
    flexGrow: 1,
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold',
    alignSelf: 'center',
    marginLeft: 5,
  },
  drinksInputContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  drinksInputButton: {
    width: 43,
    height: 43,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'gray',
    backgroundColor: 'white',
  },
  drinksInputText: {
    width: 43,
    height: 43,
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#212421',
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
