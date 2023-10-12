import React, {useState, useEffect} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import BasicButton from '../Buttons/BasicButton';
import MenuIcon from '../Buttons/MenuIcon';
import { ModalFadeTransition } from '@react-navigation/stack/lib/typescript/src/TransitionConfigs/TransitionPresets';

type NumericSliderProps = {
    visible: boolean;
    transparent: boolean;
    heading: string,
    step: number;
    value: number;
    maxValue: number;
    onRequestClose: () => void;
    onSave: (value: number) => void;
};

const NumericSlider = (props: NumericSliderProps) => {
    const {
        visible,
        transparent,
        heading,
        step,
        value,
        maxValue,
        onRequestClose,
        onSave
    } = props;
    const [localValue, setLocalValue] = useState<number>(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleSliderChange = (value: number) => {
        let newValue = parseFloat(value.toFixed(1))
        setLocalValue(newValue);
    }

    return (
        <Modal
            animationType='none'
            transparent={transparent}
            visible={visible}
            onRequestClose={onRequestClose}
        >
        <View style={styles.modalContainer}>
        <View style={styles.modalView}>
            <View style={styles.valueTextContainer}>
                <Text style={styles.valueText}>{heading}</Text>
                <Text style={styles.valueText}>{localValue}</Text>
            </View>
            <View style={styles.sliderContainer}>
                <Slider
                    value={localValue}
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={maxValue}
                    step={step}
                    minimumTrackTintColor="#000"
                    maximumTrackTintColor="#000"
                    thumbTintColor="#000"
                    onValueChange={handleSliderChange}
                    tapToSeek={true}
                />
            </View>
            <View style={styles.saveButtonsDelimiter}/>
            <View style={styles.saveButtonsContainer}>
              <BasicButton 
                  text='Save'
                  buttonStyle={styles.saveButton}
                  textStyle={styles.saveButtonText}
                  onPress={() => onSave(localValue)}
              />
              <BasicButton 
                  text='Cancel'
                  buttonStyle={styles.cancelButton}
                  textStyle={styles.cancelButtonText}
                  onPress={onRequestClose}
              />
            </View>
        </View>
        </View>
        </Modal>
    );
};

export default NumericSlider;


const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // This will fade the background
  },
  modalView: {
    backgroundColor: '#FFFF99',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  valueTextContainer: {
    marginTop: 10,
    height: 50,
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 25,
    color: 'black',
    alignSelf: 'center',
    margin: 5,
  },
  sliderContainer: {
    justifyContent: 'center',
    margin: 10,
    marginTop: 15,
    marginBottom: 5,
  },
  slider: {
    width: 280, 
    height: 40
  },
  saveButtonsDelimiter: {
    height: 5,
    width: '100%',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#000',
  },
  saveButtonsContainer: {
    width: '100%',
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "column",
    backgroundColor: '#FFFF99',
    marginBottom: 2,
  },
  saveButton: {
    width: 150,
    backgroundColor: '#fcf50f',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
    margin: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    width: '100%',
    backgroundColor: '#ffff99',
    padding: 6,
    margin: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
