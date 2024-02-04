import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {DrinkingSessionUnitWindowProps} from '../types/components';
import SessionUnitsInputWindow from './Buttons/SessionUnitsInputWindow';
import {
  addUnits,
  findUnitName,
  removeUnits,
  sumUnitTypes,
} from '../utils/dataHandling';
import {UnitTypesKeys, UnitTypesProps, UnitsObject} from '../types/database';

const DrinkingSessionUnitWindow = ({
  unitKey,
  iconSource,
  currentUnits,
  setCurrentUnits,
  availableUnits,
  typeSum,
  setTypeSum,
}: DrinkingSessionUnitWindowProps) => {
  const handleAddUnits = (units: UnitTypesProps) => {
    let newUnitCount = sumUnitTypes(units); // Number of added units
    if (newUnitCount > 0 && newUnitCount <= availableUnits) {
      let newUnits: UnitsObject = addUnits(currentUnits, units);
      setCurrentUnits(newUnits);
      setTypeSum(typeSum + newUnitCount);
    }
  };

  const handleRemoveUnits = (
    unitType: (typeof UnitTypesKeys)[number],
    count: number,
  ) => {
    if (typeSum > 0) {
      let newUnits: UnitsObject = removeUnits(currentUnits, unitType, count);
      setCurrentUnits(newUnits);
      setTypeSum(typeSum - count);
    }
  };

  const unitName = findUnitName(unitKey);

  return (
    <View style={styles.sessionUnitContainer}>
      <Image source={iconSource} style={styles.iconStyle} />
      <Text style={styles.unitInfoText}>{unitName}</Text>
      <TouchableOpacity
        style={styles.adjustUnitsButton}
        onPress={() => handleRemoveUnits(unitKey, 1)}>
        <Image
          source={require('../../assets/icons/minus.png')}
          style={styles.adjustUnitsIcon}
        />
      </TouchableOpacity>
      <SessionUnitsInputWindow
        unitKey={unitKey}
        currentUnits={currentUnits}
        setCurrentUnits={setCurrentUnits}
        availableUnits={availableUnits}
        typeSum={typeSum}
        setTypeSum={setTypeSum}
        styles={styles}
      />
      <TouchableOpacity
        style={styles.adjustUnitsButton}
        onPress={() => handleAddUnits({[unitKey]: 1})}>
        <Image
          source={require('../../assets/icons/plus.png')}
          style={styles.adjustUnitsIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

export default DrinkingSessionUnitWindow;

const styles = StyleSheet.create({
  sessionUnitContainer: {
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: '#fcf50f',
    flexDirection: 'row',
    padding: 2,
  },
  iconStyle: {
    width: 30,
    height: 30,
    marginLeft: 5,
    marginRight: 5,
    alignSelf: 'center',
  },
  unitInfoText: {
    flexGrow: 1,
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold',
    alignSelf: 'center',
    marginLeft: 5,
  },
  unitsInputContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  unitsInputButton: {
    width: 43,
    height: 43,
    borderRadius: 5,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#212421',
    backgroundColor: 'white',
  },
  unitsInputText: {
    width: 43,
    height: 43,
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#212421',
  },
  adjustUnitsButton: {
    width: 50,
    height: 50,
    alignSelf: 'flex-end',
    alignContent: 'center',
    justifyContent: 'center',
  },
  adjustUnitsIcon: {
    width: 17,
    height: 17,
    alignSelf: 'center',
  },
});
