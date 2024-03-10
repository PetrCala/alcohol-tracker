import React, {useState, useRef, useMemo} from 'react';
import {Keyboard, TextInput, TouchableOpacity, View} from 'react-native';
import {addUnits, removeUnits, sumUnitsOfSingleType} from '@libs/DataHandling';
import {UnitKey, Units, UnitsList} from '@src/types/database';

type SessionUnitsInputWindowProps = {
  unitKey: UnitKey;
  currentUnits: UnitsList | undefined;
  setCurrentUnits: (newUnits: UnitsList | undefined) => void;
  availableUnits: number;
  styles: {
    unitsInputContainer: {};
    unitsInputButton: {};
    unitsInputText: {};
  };
};

const SessionUnitsInputWindow = ({
  unitKey,
  currentUnits,
  setCurrentUnits,
  availableUnits,
  styles,
}: SessionUnitsInputWindowProps) => {
  const [inputValue, setInputValue] = useState<string>(
    sumUnitsOfSingleType(currentUnits, unitKey).toString(),
  );
  const inputRef = useRef<TextInput>(null);

  const handleKeyPress = (event: {nativeEvent: {key: string}}): void => {
    let updatedValue: string = '0';
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

      // Check that updatedValue is not greater than availableUnits
      let numericValue = parseFloat(updatedValue);
      if (isNaN(numericValue)) {
        numericValue = 0;
      }

      let inputValueNumeric = parseFloat(inputValue); // In case one digit is already input, adjust the availableUnits for this digit
      if (numericValue > availableUnits + inputValueNumeric) {
        return; // If the new value is greater than available units, do nothing.
      }

      setInputValue(updatedValue);
    }

    // Update units
    let numericValue = parseFloat(updatedValue);
    handleNewNumericValue(numericValue);
  };

  /** Given a new numeric value, update the necessary hooks upstream.
   *
   * @param numericValue The value to handle.
   * @return void, the upstream hooks get updated
   */
  const handleNewNumericValue = (numericValue: number): void => {
    if (isNaN(numericValue)) {
      numericValue = 0;
    }
    const typeSum = parseFloat(inputValue);

    if (numericValue == typeSum) return; // Do nothing if the value is the same
    // Determine whether the new value is higher or lower than the current one
    let newUnits: UnitsList | undefined = {...currentUnits};
    if (numericValue > typeSum) {
      // Add units
      let numberToAdd: number = numericValue - typeSum;
      let unitsToAdd: Units = {[unitKey]: numberToAdd};
      newUnits = addUnits(newUnits, unitsToAdd);
    } else {
      // Remove units
      let numberToRemove: number = typeSum - numericValue;
      newUnits = removeUnits(newUnits, unitKey, numberToRemove);
    }
    setCurrentUnits(newUnits);
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
    setInputValue(sumUnitsOfSingleType(currentUnits, unitKey).toString());
  }, [currentUnits, unitKey]);

  return (
    <View style={styles.unitsInputContainer}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleContainerPress}
        style={styles.unitsInputButton}>
        <TextInput
          ref={inputRef}
          style={styles.unitsInputText}
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

export default SessionUnitsInputWindow;
