import React, {useState, useRef, useMemo} from 'react';
import {Keyboard, TextInput, TouchableOpacity, View} from 'react-native';
import {
  addDrinks,
  removeDrinks,
  sumDrinksOfSingleType,
} from '@libs/DataHandling';
import type {DrinkKey, Drinks, DrinksList} from '@src/types/onyx';

type SessionDrinksInputWindowProps = {
  drinkKey: DrinkKey;
  currentDrinks: DrinksList | undefined;
  setCurrentDrinks: (newDrinks: DrinksList | undefined) => void;
  availableUnits: number;
  styles: {
    drinksInputContainer: {};
    drinksInputButton: {};
    drinksInputText: {};
  };
};

const SessionDrinksInputWindow = ({
  drinkKey,
  currentDrinks,
  setCurrentDrinks,
  availableUnits,
  styles,
}: SessionDrinksInputWindowProps) => {
  const [inputValue, setInputValue] = useState<string>(
    sumDrinksOfSingleType(currentDrinks, drinkKey).toString(),
  );
  const inputRef = useRef<TextInput>(null);

  const handleKeyPress = (event: {nativeEvent: {key: string}}): void => {
    let updatedValue = '0';
    const key = event.nativeEvent.key;

    if (key === 'Backspace') {
      if (inputValue.length > 1) {
        updatedValue = inputValue.slice(0, -1); // Longer than 1
      } else {
        updatedValue = '0';
      }
      if (inputValue !== '0') {
        setInputValue(updatedValue);
      }
    } else if (!isNaN(Number(key))) {
      if (inputValue === '0') {
        updatedValue = key;
      } else if (inputValue.length < 2) {
        updatedValue = inputValue + key;
      } else {
        updatedValue = inputValue; // Same value
      }

      // Check that updatedValue is not greater than availableDrinks
      let numericValue = parseFloat(updatedValue);
      if (isNaN(numericValue)) {
        numericValue = 0;
      }

      const inputValueNumeric = parseFloat(inputValue); // In case one digit is already input, adjust the availableDrinks for this digit
      if (numericValue > availableUnits + inputValueNumeric) {
        return; // If the new value is greater than available units, do nothing.
      }

      setInputValue(updatedValue);
    }

    // Update drinks
    const numericValue = parseFloat(updatedValue);
    handleNewNumericValue(numericValue);
  };

  /** Given a new numeric value, update the necessary hooks upstream.
   *
   * @param numericValue The value to handle.
   * @returnsvoid, the upstream hooks get updated
   */
  const handleNewNumericValue = (numericValue: number): void => {
    if (isNaN(numericValue)) {
      numericValue = 0;
    }
    const typeSum = parseFloat(inputValue);

    if (numericValue == typeSum) {return;} // Do nothing if the value is the same
    // Determine whether the new value is higher or lower than the current one
    let newDrinks: DrinksList | undefined = {...currentDrinks};
    if (numericValue > typeSum) {
      // Add drinks
      const numberToAdd: number = numericValue - typeSum;
      const drinksToAdd: Drinks = {[drinkKey]: numberToAdd};
      newDrinks = addDrinks(newDrinks, drinksToAdd);
    } else {
      // Remove drinks
      const numberToRemove: number = typeSum - numericValue;
      newDrinks = removeDrinks(newDrinks, drinkKey, numberToRemove);
    }
    setCurrentDrinks(newDrinks);
  };

  const handleContainerPress = () => {
    if (inputRef.current && inputRef.current.isFocused()) {
      // Hide keyboard
      Keyboard.dismiss();
      inputRef.current.blur();
    } else {
      // Focus keyboard
      inputRef.current && inputRef.current.focus();
    }
  };

  useMemo(() => {
    setInputValue(sumDrinksOfSingleType(currentDrinks, drinkKey).toString());
  }, [currentDrinks, drinkKey]);

  return (
    <View style={styles.drinksInputContainer}>
      <TouchableOpacity accessibilityRole="button"
        activeOpacity={1}
        onPress={handleContainerPress}
        style={styles.drinksInputButton}>
        <TextInput accessibilityLabel="Text input field"
          ref={inputRef}
          style={styles.drinksInputText}
          value={inputValue}
          onKeyPress={handleKeyPress}
          keyboardType="numeric"
          caretHidden={true}
          blurOnSubmit={true}
          onSubmitEditing={() => inputRef.current && inputRef.current.blur()} // Hide keyboard
          maxLength={2}
        />
      </TouchableOpacity>
    </View>
  );
};

export default SessionDrinksInputWindow;
