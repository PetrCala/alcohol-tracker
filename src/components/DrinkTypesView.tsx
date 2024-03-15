import {StyleSheet, Text, View} from 'react-native';
import DrinkingSessionDrinksWindow from './DrinkingSessionDrinksWindow';
import {DrinksList} from '@src/types/database';
import DrinkDataProps from '@src/types/various/DrinkDataProps';

export type DrinkTypesViewProps = {
  drinkData: DrinkDataProps;
  currentDrinks: DrinksList | undefined;
  setCurrentDrinks: (newDrinks: DrinksList | undefined) => void;
  availableDrinks: number;
};

const DrinkTypesView = ({
  drinkData,
  currentDrinks,
  setCurrentDrinks,
  availableDrinks,
}: DrinkTypesViewProps) => {
  return (
    <View style={styles.mainContainer}>
      <View style={styles.tab}>
        <Text style={styles.tabText}>Drinks consumed</Text>
      </View>
      {drinkData.map(drink => (
        <DrinkingSessionDrinksWindow
          key={drink.key} // JS unique key property - no need to list
          drinkKey={drink.key}
          iconSource={drink.icon}
          currentDrinks={currentDrinks}
          setCurrentDrinks={setCurrentDrinks}
          availableDrinks={availableDrinks}
        />
      ))}
    </View>
  );
};

export default DrinkTypesView;

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    backgroundColor: 'white',
  },
  tab: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: '100%',
    borderColor: '#212421',
    borderWidth: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10,
  },
  tabText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: 'black',
  },
});
