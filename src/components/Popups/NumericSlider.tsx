import React, {useState, useEffect, useMemo} from 'react';
import {Modal, StyleSheet, Text, View} from 'react-native';
import Slider from '@react-native-community/slider';
import BasicButton from '../Buttons/BasicButton';
import useThemeStyles from '@hooks/useThemeStyles';
import FullScreenModal from '@components/Modals/FullScreenModal';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';

type NumericSliderProps = {
  visible: boolean;
  heading: string;
  step: number;
  value: number;
  maxValue: number;
  onRequestClose: () => void;
  onSave: (value: number) => void;
};

const NumericSlider = ({
  visible,
  heading,
  step,
  value,
  maxValue,
  onRequestClose,
  onSave,
}: NumericSliderProps) => {
  const [localValue, setLocalValue] = useState<number>(value);
  const styles = useThemeStyles();
  const theme = useTheme();
  const {translate} = useLocalize();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSliderChange = (value: number) => {
    const newValue = parseFloat(value.toFixed(1));
    setLocalValue(newValue);
  };

  return (
    <FullScreenModal visible={visible} onClose={onRequestClose} hideCloseButton>
      <View style={styles.fullScreenCenteredContent}>
        <View style={[styles.justifyContentCenter, styles.alignItemsCenter]}>
          <Text style={[styles.textHeadline, styles.mb2]}>{heading}</Text>
          <Text style={styles.textHeadline}>{localValue}</Text>
        </View>
        <View style={styles.m4}>
          <Slider
            value={localValue}
            style={styles.numericSlider}
            minimumValue={0}
            maximumValue={maxValue}
            step={step}
            minimumTrackTintColor={theme.textDark}
            maximumTrackTintColor={theme.textDark}
            thumbTintColor={theme.textDark}
            onValueChange={handleSliderChange}
            tapToSeek={true}
          />
        </View>
        <View style={[styles.flexRow, styles.mt2]}>
          <Button
            text={translate('common.cancel')}
            style={[styles.mnw25, styles.ph2]}
            onPress={onRequestClose}
          />
          <Button
            style={[styles.mnw25, styles.ph2]}
            success
            text={translate('common.save')}
            onPress={() => onSave(localValue)}
          />
        </View>
      </View>
    </FullScreenModal>
  );
};

export default NumericSlider;
