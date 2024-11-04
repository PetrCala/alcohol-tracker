import React from 'react';
import type {ScrollView} from 'react-native';
import {Text, View, StyleSheet, Switch, TextInput} from 'react-native';

type SessionSliderProps = {
  scrollViewRef: React.RefObject<ScrollView>;
  isBlackout: boolean;
  onBlackoutChange: (value: boolean) => void;
  note: string;
  onNoteChange: (value: string) => void;
};

const SessionDetailsSlider: React.FC<SessionSliderProps> = ({
  scrollViewRef,
  isBlackout,
  onBlackoutChange,
  note,
  onNoteChange,
}) => {
  return (
    // <View style={styles.container} onLayout={onFeatureLayout}>
    <View style={styles.container}>
      <View style={styles.tab}>
        <Text style={styles.tabText}>Session details</Text>
      </View>
      <View style={styles.sessionDetailsContainer}>
        <View
          style={[styles.tileContainerBase, styles.tileContainerHorizontal]}>
          <Text style={styles.tileHeading}>Blackout: </Text>
          <Switch
            value={isBlackout}
            onValueChange={value => onBlackoutChange(value)}
            trackColor={{false: '#767577', true: '#fcf50f'}}
            thumbColor={isBlackout ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
        <View
          style={[
            styles.tileContainerBase,
            styles.tileContainerVertical,
            {borderBottomWidth: 0},
          ]}>
          <Text style={styles.tileHeading}>Session note:</Text>
          <View style={styles.noteWindowContainer}>
            <TextInput
              accessibilityLabel="Text input field"
              defaultValue={note}
              style={styles.noteTextInput}
              onChangeText={value => onNoteChange(value)}
              placeholder={'Write your note here'}
              placeholderTextColor={'#a8a8a8'}
              keyboardType="default"
              maxLength={1000}
              multiline={true}
            />
          </View>
          {/* TODO add the date changer here! */}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  tab: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderColor: 'gray',
    borderTopWidth: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  tabText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: 'black',
  },
  tabArrow: {
    width: 25,
    height: 25,
    marginRight: 3,
  },
  tabArrowExpanded: {
    transform: [{rotate: '180deg'}],
  },
  tabArrowDefault: {},
  sessionDetailsContainer: {
    width: '100%',
  },
  tileContainerBase: {
    padding: 10,
    borderColor: 'gray',
    borderBottomWidth: 0,
    borderRadius: 5,
    marginLeft: 12,
    marginRight: 12,
  },
  tileContainerHorizontal: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  tileContainerVertical: {
    flexDirection: 'column',
    alignContent: 'flex-start',
  },
  tileHeading: {
    fontSize: 14,
    fontWeight: '500',
    color: 'black',
  },
  noteWindowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    backgroundColor: 'white',
    marginTop: 5,
  },
  noteTextInput: {
    width: '100%',
    height: 100,
    flexGrow: 1,
    flexShrink: 1,
    textAlignVertical: 'top',
    padding: 10,
    paddingTop: 10,
    borderRadius: 5,
    color: 'black',
  },
});

export default SessionDetailsSlider;
