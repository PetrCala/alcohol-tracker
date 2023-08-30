import React, { useState, useEffect, useRef } from 'react';
import { 
    Keyboard,
    TextInput, 
    TouchableOpacity,
    View
} from 'react-native';
import { SessionUnitsInputWindowProps } from '../../types/components';


const SessionUnitsInputWindow = (props: SessionUnitsInputWindowProps) => {
    const { currentUnits, setCurrentUnits, availableUnits, styles } = props;
    const [inputValue, setInputValue] = useState<string>(currentUnits.toString());
    const inputRef = useRef<TextInput>(null);


    const handleKeyPress = (event: { nativeEvent: { key: string } }) => {
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
    
            console.log(updatedValue)
            setInputValue(updatedValue);
        }
    
        // Update units
        let numericValue = parseFloat(updatedValue);
        if (isNaN(numericValue)) {
            numericValue = 0;
        }
    
        if (numericValue !== currentUnits) {
            setCurrentUnits(numericValue);
        }
    };

    const handleContainerPress = () => {
        if (inputRef.current && inputRef.current.isFocused()) {
            // Hide keyboard
            Keyboard.dismiss();
            inputRef.current.blur(); 
        } else {
            // Focus keyboard
            inputRef.current && inputRef.current.focus();
        };
    };
  
    return (
        <View style={styles.unitsInputContainer}>
            <TouchableOpacity 
                activeOpacity={1} 
                onPress={handleContainerPress} 
                style={styles.unitsInputButton}
            >
            <TextInput
                ref={inputRef}
                style={styles.unitsInputText}
                value={currentUnits.toString()}
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
