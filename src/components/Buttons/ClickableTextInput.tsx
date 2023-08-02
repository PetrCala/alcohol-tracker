import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import styles from '../../styles';


type Props = {
    text: string;
    currentUnits: number;
    onUnitsChange: (newUnits: number) => void;
}

const ClickableTextInput = (props: Props) => {
    const { text, currentUnits, onUnitsChange } = props;
    const [units, setUnits] = useState(currentUnits);
    const [isTextInputVisible, setTextInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState(currentUnits.toString());
  
    useEffect(() => {
        // Update the local state when external state changes
        setUnits(currentUnits);
        setInputValue(currentUnits.toString());
      }, [currentUnits]);

    const handleChangeText = (text: string) => {
        setInputValue(text);
    };

    const handleTextInputSubmit = () => {
        let numericValue = parseFloat(inputValue);
        if (isNaN(numericValue)) {
            numericValue = 0; // If no units, set to 0
        }
        setUnits(numericValue);
        onUnitsChange(numericValue); // Call the external handler to update the units
        setTextInputVisible(false);
    };

    const toggleTextInput = () => {
        setTextInputVisible(!isTextInputVisible);
    };
  
    return (
      <TouchableOpacity onPress={toggleTextInput} style={styles.drinkingSessionClickableTextContainer}>
        {isTextInputVisible ? (
            <TextInput
                style={styles.drinkingSessionClickableTextStyle}
                value={inputValue.toString()}
                onChangeText={handleChangeText}
                keyboardType="numeric"
                autoFocus
                onSubmitEditing={handleTextInputSubmit}
                onPressOut={() => console.log('hello')}
            />
        ) : (
            <Text style={styles.drinkingSessionClickableTextInput}>
                Consumed: {units} {units !== 1 ? 'units' : 'unit'}
            </Text>
        )}
      </TouchableOpacity>
    );
  };
  
  export default ClickableTextInput;