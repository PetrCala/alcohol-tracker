import React, { useState, useEffect, useRef } from 'react';
import { 
    Keyboard,
    TextInput, 
    TouchableOpacity, 
    StyleSheet 
} from 'react-native';


type Props = {
    currentUnits: number;
    onUnitsChange: (newUnits: number) => void;
}

const SessionUnitsInputWindow = (props: Props) => {
    const { currentUnits, onUnitsChange } = props;
    const [units, setUnits] = useState<number>(currentUnits);
    const [inputValue, setInputValue] = useState<string>(currentUnits.toString());
    const inputRef = useRef<TextInput>(null);
  
    useEffect(() => {
        setUnits(currentUnits);
    }, [currentUnits]);


    const handleKeyPress = (event: {nativeEvent: {key:string}}) => {
        let updatedValue: string = '0';
        const key = event.nativeEvent.key;
        
        if (key === 'Backspace') {
            if (inputValue.length > 1){
                updatedValue = inputValue.slice(0, -1); // Longer than 1
            } else {
                updatedValue = '0';
            };
            if (inputValue !== '0'){
                setInputValue(updatedValue);
            };
        } else if (!isNaN(Number(key))) {
            if (inputValue === '0'){
                updatedValue = key;
                setInputValue(updatedValue);
            } else if (inputValue.length < 2){
                // Append the number to the current inputValue if digits < 2
                updatedValue = inputValue + key;
                setInputValue(updatedValue);
            } else {
                updatedValue = inputValue; // Same value 
            };
        };

        // Update units
        let numericValue = parseFloat(updatedValue);
        if (isNaN(numericValue)) {
            numericValue = 0;
        }

        if (numericValue !== units){
            setUnits(numericValue);
            onUnitsChange(numericValue);
        };
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
        <TouchableOpacity 
            activeOpacity={1} 
            onPress={handleContainerPress} 
            style={styles.drinkingSessionClickableTextContainer}
        >
          <TextInput
              ref={inputRef}
              style={styles.drinkingSessionClickableTextStyle}
              value={units.toString()}
              onKeyPress={handleKeyPress}
              keyboardType="numeric"
              caretHidden={true}
              blurOnSubmit={true}
              onSubmitEditing={() => inputRef.current && inputRef.current.blur()} // Hide keyboard
              maxLength={2}
          />
        </TouchableOpacity>
    );
};
  
export default SessionUnitsInputWindow;

const styles = StyleSheet.create({
    drinkingSessionClickableTextContainer: {
      padding: 15,
      borderRadius: 8,
      borderWidth: 2,
      marginBottom: 15,
      width: 300,
      alignItems: 'center',
      borderColor: '#212421',
      backgroundColor: 'white',
    },
    drinkingSessionClickableTextStyle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#212421',
    },
    drinkingSessionClickableTextInput: {
      fontSize: 18,
      fontWeight: 'bold',
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: 'white',
      borderRadius: 4,
      color: '#212421'
    },
});