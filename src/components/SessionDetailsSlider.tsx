import React, {useState} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Animated,
  StyleSheet,
  Image,
  ScrollView,
  LayoutChangeEvent,
  Switch,
  TextInput,
} from 'react-native';
import * as KirokuIcons from '@src/components/Icon/KirokuIcons';

interface SessionSliderProps {
  scrollViewRef: React.RefObject<ScrollView>;
  isBlackout: boolean;
  onBlackoutChange: (value: boolean) => void;
  note: string;
  onNoteChange: (value: string) => void;
}

const SessionDetailsSlider: React.FC<SessionSliderProps> = ({
  scrollViewRef,
  isBlackout,
  onBlackoutChange,
  note,
  onNoteChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [heightAnim] = useState(new Animated.Value(0)); // Initial value for opacity
  const [featureY, setFeatureY] = useState(0);

  const onFeatureLayout = (event: LayoutChangeEvent) => {
    setFeatureY(250);
  };

  const toggleVisibility = () => {
    // if (isExpanded) {
    //     Animated.timing(heightAnim, {
    //         toValue: 0,
    //         duration: 200,
    //         useNativeDriver: false,
    //     }).start( () => {
    //         scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    //     });
    // } else {
    //     Animated.timing(heightAnim, {
    //         toValue: featureY, // Expand the container to this much
    //         duration: 200,
    //         useNativeDriver: false,
    //     })
    //     .start(() => {
    //         scrollViewRef.current?.scrollTo({ y: featureY, animated: true });
    //     });
    // }
    setIsExpanded(!isExpanded);
  };

  return (
    // <View style={styles.container} onLayout={onFeatureLayout}>
    <View style={styles.container}>
      <View style={styles.tab}>
        <Text style={styles.tabText}>Session details</Text>
      </View>
      {/* <TouchableOpacity style={styles.tab} onPress={toggleVisibility}>
                <Image 
                style={[
                    styles.tabArrow,
                    isExpanded ? styles.tabArrowExpanded : styles.tabArrowDefault
                ]}
                source={KirokuIcons.ArrowDown}
                />
            </TouchableOpacity> */}
      {/* {isExpanded ?
            <Animated.View 
            style={[
                styles.content,
                { height: heightAnim }
            ]}
            onLayout={!isExpanded ? onFeatureLayout : undefined}
            >
            */}
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
        <View style={[styles.tileContainerBase, styles.tileContainerVertical]}>
          <Text style={styles.tileHeading}>Session note:</Text>
          <View style={styles.noteWindowContainer}>
            <TextInput
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
        </View>
      </View>
      {/*
            </Animated.View>
            :
            null
            } */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  tab: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: '100%',
    borderColor: '#212421',
    borderWidth: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10,
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
  content: {
    width: '100%',
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    borderColor: '#212421',
    borderWidth: 1,
    padding: 5,
    overflow: 'hidden', // Hide when not expanded
  },
  sessionDetailsContainer: {
    width: '100%',
    backgroundColor: '#fcf50f',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
  },
  tileContainerBase: {
    padding: 10,
    backgroundColor: '#ffff99',
    borderColor: '#000',
    borderRadius: 5,
    borderWidth: 1,
    margin: 5,
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
    borderColor: '#000',
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
