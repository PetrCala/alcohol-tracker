import {StyleSheet, Text, View} from 'react-native';
import DrinkingSessionDrinksWindow from './DrinkingSessionDrinksWindow';
import type {DrinksList} from '@src/types/onyx';
import type DrinkDataProps from '@libs/DrinkData/types';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

export type DrinkTypesViewProps = {
  drinkData: DrinkDataProps;
  currentDrinks: DrinksList | undefined;
  setCurrentDrinks: (newDrinks: DrinksList | undefined) => void;
  availableUnits: number;
};

const DrinkTypesView = ({
  drinkData,
  currentDrinks,
  setCurrentDrinks,
  availableUnits,
}: DrinkTypesViewProps) => {
  const styles = useThemeStyles();

  return (
    <View style={localStyles.mainContainer}>
      <View style={[localStyles.tab, styles.borderColorTheme]}>
        <Text style={localStyles.tabText}>Drinks consumed</Text>
      </View>
      <View>
        {drinkData.map(drink => (
          <DrinkingSessionDrinksWindow
            key={drink.key} // JS unique key property - no need to list
            drinkKey={drink.key}
            iconSource={drink.icon}
            currentDrinks={currentDrinks}
            setCurrentDrinks={setCurrentDrinks}
            availableUnits={availableUnits}
          />
        ))}
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
    marginLeft: 12,
    marginRight: 12,
  },
  tabText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: 'black',
  },
});
