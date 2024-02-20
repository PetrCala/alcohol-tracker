import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  BackHandler,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {PreferencesScreenProps} from '@src/types/screens';

import {useUserConnection} from '@context/global/UserConnectionContext';
import {useFirebase} from '@context/global/FirebaseContext';
import UserOffline from '@components/UserOffline';
import BasicButton from '@components/Buttons/BasicButton';
import {savePreferencesData} from '@database/preferences';
import YesNoPopup from '@components/Popups/YesNoPopup';
import CustomSwitch from '@components/CustomSwitch';
import NumericSlider from '@components/Popups/NumericSlider';
import {getDatabaseData} from '@context/global/DatabaseDataContext';
import {getDefaultPreferences} from '@database/users';
import MainHeader from '@components/Header/MainHeader';
import {Preferences} from '@src/types/database';
import CONST from '@src/CONST';

interface PreferencesListProps {
  id: string;
  initialContents: {key: string; label: string; value: string}[];
  onButtonPress: (key: string, label: string, value: number) => void;
}

const PreferencesList: React.FC<PreferencesListProps> = ({
  id,
  initialContents,
  onButtonPress,
}) => {
  return (
    <View style={styles.preferencesListContainer}>
      {initialContents.map((item, index) => {
        let itemValue = parseFloat(item.value);

        return (
          <View key={index} style={styles.preferencesListRowContainer}>
            <Text style={styles.preferencesListLabel}>{item.label}</Text>
            <View style={styles.preferencesListNumericContainer}>
              <TouchableOpacity
                style={styles.preferencesListButton}
                onPress={() => onButtonPress(item.key, item.label, itemValue)}>
                <Text style={styles.preferencesListText}>{itemValue}</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const PreferencesScreen = ({route, navigation}: PreferencesScreenProps) => {
  if (!route || !navigation) return null; // Should never be null
  const {auth, db} = useFirebase();
  const user = auth.currentUser;
  const {isOnline} = useUserConnection();
  const {userData, preferences} = getDatabaseData();
  const initialPreferences = useRef(preferences);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [sliderVisible, setSliderVisible] = useState<boolean>(false);
  const [sliderStep, setSliderStep] = useState<number>(1);
  const [sliderMaxValue, setSliderMaxValue] = useState<number>(5);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [sliderHeading, setSliderHeading] = useState<string>('');
  const [sliderList, setSliderList] = useState<string>('');
  const [sliderKey, setSliderKey] = useState<string>('');
  // Deconstruct the preferences
  let defaultPreferences = getDefaultPreferences();
  const [currentPreferences, setCurrentPreferences] = useState<Preferences>(
    preferences || defaultPreferences,
  );

  const havePreferencesChanged = () => {
    return (
      JSON.stringify(initialPreferences.current) !==
      JSON.stringify(currentPreferences)
    );
  };

  const handleGoBack = () => {
    if (havePreferencesChanged()) {
      setShowLeaveConfirmation(true); // Unsaved changes
    } else {
      navigation.goBack();
    }
  };

  const handleSavePreferences = async () => {
    if (!db || !user) return;
    try {
      await savePreferencesData(db, user.uid, currentPreferences);
      navigation.navigate('Main Menu Screen', {
        userData: userData,
        preferences: currentPreferences,
      });
    } catch (error: any) {
      Alert.alert('Preferences saving failed', error.message);
    }
  };

  const handleFirstDayOfWeekToggle = (value: boolean) => {
    let newValue = value ? 'Monday' : 'Sunday';
    setCurrentPreferences(prev => ({...prev, first_day_of_week: newValue}));
  };

  const updateUnitsToColors = (colorKey: string, value: number) => {
    // const updateUnitsToColors = (colorKey: keyof UnitsToColorsData, value: number) => {
    setCurrentPreferences(prev => ({
      ...prev,
      units_to_colors: {
        ...prev.units_to_colors,
        [colorKey]: value,
      },
    }));
  };

  // const updateUnitsToPoints = (unitKey: typeof UnitTypesKeys[number], value: number) => {
  const updateUnitsToPoints = (unitKey: string, value: number) => {
    setCurrentPreferences(prev => ({
      ...prev,
      units_to_points: {
        ...prev.units_to_points,
        [unitKey]: value,
      },
    }));
  };

  useMemo(() => {
    if (!preferences) return;
    let newPreferences = {
      first_day_of_week: preferences.first_day_of_week,
      units_to_colors: preferences.units_to_colors,
      units_to_points: preferences.units_to_points,
    };
    if (JSON.stringify(newPreferences) !== JSON.stringify(preferences)) {
      setCurrentPreferences(newPreferences);
    }
  }, [preferences]);

  // Make the system back press toggle the go back handler
  useEffect(() => {
    const backAction = () => {
      handleGoBack();
      return true; // Prevent the event from bubbling up and being handled by the default handler
    };

    BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, [currentPreferences]); // Add your state dependencies here

  if (!isOnline) return <UserOffline />;
  if (!db || !user || !preferences) {
    navigation.replace('Login Screen');
    return null;
  }

  return (
    <View style={{flex: 1, backgroundColor: '#FFFF99'}}>
      <MainHeader headerText="Preferences" onGoBack={handleGoBack} />
      <ScrollView
        style={styles.scrollView}
        onScrollBeginDrag={Keyboard.dismiss}
        keyboardShouldPersistTaps="handled">
        <View style={[styles.container, styles.horizontalContainer]}>
          <Text style={styles.label}>First Day of Week</Text>
          <View style={styles.itemContainer}>
            <CustomSwitch
              offText="Sun"
              onText="Mon"
              value={currentPreferences.first_day_of_week === 'Monday'}
              onValueChange={handleFirstDayOfWeekToggle}
            />
          </View>
        </View>
        <View style={[styles.container, styles.verticalContainer]}>
          <Text style={styles.label}>Unit Colors</Text>
          <View style={styles.itemContainer}>
            <PreferencesList
              id="units_to_colors"
              initialContents={[
                {
                  key: 'yellow',
                  label: 'Yellow',
                  value: currentPreferences.units_to_colors.yellow.toString(),
                },
                {
                  key: 'orange',
                  label: 'Orange',
                  value: currentPreferences.units_to_colors.orange.toString(),
                },
              ]}
              onButtonPress={(key, label, value) => {
                setSliderHeading(label);
                setSliderStep(1);
                setSliderMaxValue(15);
                setSliderValue(value);
                setSliderVisible(true);
                setSliderList('units_to_colors');
                setSliderKey(key);
              }}
            />
          </View>
        </View>
        <View style={[styles.container, styles.verticalContainer]}>
          <Text style={styles.label}>Point Conversion</Text>
          <View style={styles.itemContainer}>
            <PreferencesList
              id="units_to_points" // Another unique identifier
              initialContents={Object.values(CONST.UNITS.KEYS).map(
                (key, index) => ({
                  key: key,
                  label: Object.values(CONST.UNITS.NAMES)[index],
                  value: currentPreferences.units_to_points[key]!.toString(), // Non-null assertion
                }),
              )}
              onButtonPress={(key, label, value) => {
                setSliderHeading(label);
                setSliderStep(0.1);
                setSliderMaxValue(3);
                setSliderValue(value);
                setSliderVisible(true);
                setSliderList('units_to_points');
                setSliderKey(key);
              }}
            />
          </View>
        </View>
      </ScrollView>
      <NumericSlider
        visible={sliderVisible}
        transparent={true}
        value={sliderValue}
        heading={sliderHeading}
        step={sliderStep}
        maxValue={sliderMaxValue}
        onRequestClose={() => {
          setSliderVisible(false);
          setSliderValue(0);
          setSliderHeading('');
        }}
        onSave={newValue => {
          if (sliderList == 'units_to_colors') {
            updateUnitsToColors(sliderKey, newValue);
          } else if (sliderList == 'units_to_points') {
            updateUnitsToPoints(sliderKey, newValue);
          }
          setSliderVisible(false);
        }}
      />
      <View style={styles.savePreferencesButtonContainer}>
        <BasicButton
          text="Save Preferences"
          buttonStyle={styles.savePreferencesButton}
          textStyle={styles.savePreferencesButtonText}
          onPress={handleSavePreferences}
        />
      </View>
      <YesNoPopup
        visible={showLeaveConfirmation}
        transparent={true}
        onRequestClose={() => setShowLeaveConfirmation(false)}
        message="You have unsaved changes. Are you sure you want to go back?"
        onYes={() => {
          setShowLeaveConfirmation(false);
          navigation.goBack();
        }}
      />
    </View>
  );
};

export default PreferencesScreen;

const styles = StyleSheet.create({
  scrollView: {
    width: '100%',
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: '#FFFF99',
  },
  container: {
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000',
    margin: 2,
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalContainer: {
    flexDirection: 'column',
  },
  label: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    borderRadius: 5,
    padding: 5,
    margin: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  preferencesListContainer: {
    flexDirection: 'column',
    width: '100%',
  },
  preferencesListRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  preferencesListLabel: {
    fontSize: 16,
    color: 'black',
    fontWeight: '400',
    marginLeft: 5,
  },
  preferencesListNumericContainer: {
    height: 35,
    width: 60,
    borderRadius: 5,
    margin: 8,
    color: 'black',
  },
  preferencesListButton: {
    height: 40,
    width: 60,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#FFFF99',
    justifyContent: 'center',
  },
  preferencesListText: {
    fontSize: 16,
    color: 'black',
    fontWeight: '500',
    textAlign: 'center',
  },
  savePreferencesButtonContainer: {
    width: '100%',
    height: 70,
    flexShrink: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#FFFF99',
    marginBottom: 5,
    padding: 5,
  },
  savePreferencesButton: {
    width: '50%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fcf50f',
    // backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 8,
  },
  savePreferencesButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
