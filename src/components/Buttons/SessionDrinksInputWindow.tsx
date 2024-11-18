import React, {useState, useRef, useMemo, useEffect} from 'react';
import {
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {sumDrinksOfSingleType} from '@libs/DataHandling';
import * as DSUtils from '@src/libs/DrinkingSessionUtils';
import * as DS from '@userActions/DrinkingSession';
import type {DrinkingSessionId, DrinkKey, DrinksList} from '@src/types/onyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useTheme from '@hooks/useTheme';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import Log from '@libs/Log';
import CONST from '@src/CONST';

type SessionDrinksInputWindowProps = {
  /** ID of the drinking session */
  sessionId: DrinkingSessionId;

  /** Key of the drinking session */
  drinkKey: DrinkKey;
};

const SessionDrinksInputWindow = ({
  sessionId,
  drinkKey,
}: SessionDrinksInputWindowProps) => {
  const styles = useThemeStyles();
  const theme = useTheme();
  const {preferences} = useDatabaseData();
  const session = DSUtils.getDrinkingSessionData(sessionId);
  const [inputValue, setInputValue] = useState<string>('');
  const inputRef = useRef<TextInput>(null);

  const handleKeyPress = (event: {nativeEvent: {key: string}}): void => {
    if (!preferences || !session) {
      Log.warn('SessionDrinksInputWindow', 'No preferences or session');
      return;
    }

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

      const availableUnits = DSUtils.calculateAvailableUnits(
        session.drinks,
        preferences.drinks_to_units,
      );

      // if (numericValue > availableUnits + inputValueNumeric) {
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
    if (!preferences || !session) {
      Log.warn('SessionDrinksInputWindow', 'No preferences or session');
      return;
    }
    if (isNaN(numericValue)) {
      numericValue = 0;
    }
    const typeSum = parseFloat(inputValue);

    if (numericValue == typeSum) {
      return;
    } // Do nothing if the value is the same

    const shouldAdd = numericValue > typeSum;
    const numberToModify = Math.abs(numericValue - typeSum);
    const action = shouldAdd
      ? CONST.DRINKS.ACTIONS.ADD
      : CONST.DRINKS.ACTIONS.REMOVE;

    DS.updateDrinks(
      sessionId,
      drinkKey,
      numberToModify,
      action,
      preferences.drinks_to_units,
    );
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

  // Update input value when drinks change
  useEffect(() => {
    const newInputValue = sumDrinksOfSingleType(
      session?.drinks,
      drinkKey,
    ).toString();
    setInputValue(newInputValue);
  }, [session?.drinks, drinkKey]);

  if (!session || !preferences) {
    return;
  }

  return (
    <View style={localStyles.drinksInputContainer}>
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={1}
        onPress={handleContainerPress}
        style={[
          localStyles.drinksInputButton,
          {
            backgroundColor:
              sumDrinksOfSingleType(session?.drinks, drinkKey) > 0
                ? theme.appColor
                : theme.cardBG,
          },
        ]}>
        <TextInput
          accessibilityLabel="Text input field"
          ref={inputRef}
          style={[styles.textLarge, styles.textStrong]}
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

const localStyles = StyleSheet.create({
  drinksInputContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  drinksInputButton: {
    width: 43,
    height: 43,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
