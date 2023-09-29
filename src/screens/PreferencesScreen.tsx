import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Alert,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import MenuIcon from '../components/Buttons/MenuIcon';
import { PreferencesScreenProps } from '../types/screens';
import { getAuth } from 'firebase/auth';
import { useUserConnection } from '../context/UserConnectionContext';
import DatabaseContext from '../context/DatabaseContext';
import UserOffline from '../components/UserOffline';
import BasicButton from '../components/Buttons/BasicButton';
import { PreferencesData, UnitTypesKeys, UnitTypesNames, UnitTypesProps, UnitsToColorsData } from '../types/database';
import { savePreferencesData } from '../database/preferences';
import YesNoPopup from '../components/Popups/YesNoPopup';
import CustomSwitch from '../components/CustomSwitch';
import NumericSlider from '../components/Popups/NumericSlider';


interface PreferencesListProps {
  id: string;
  initialContents: { label: string, value: string }[];
  onButtonPress: () => void;
}

const PreferencesList: React.FC<PreferencesListProps> = ({ id, initialContents, onButtonPress}) => {
  const [localPreferences, setLocalPreferences] = useState(initialContents);

  return (
    <View style={styles.preferencesListContainer}>
      {localPreferences.map((item, index) => {
        const [itemValue, setItemValue] = useState<number>(parseFloat(item.value));

        return (
        <View key={index} style={styles.preferencesListRowContainer}>
          <Text style={styles.preferencesListLabel}>{item.label}</Text>
          <View style={styles.preferencesListNumericContainer}>
            <TouchableOpacity 
              style={styles.preferencesListButton}
              onPress={onButtonPress}
            >
              <Text style={styles.preferencesListText}>
                {itemValue}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        );
      }
      )}
    </View>
  );
};


const PreferencesScreen = ({ route, navigation }: PreferencesScreenProps) => {
    if (!route || ! navigation) return null; // Should never be null
    const { userData, preferences } = route.params;
    const auth = getAuth();
    const user = auth.currentUser;
    const db = useContext(DatabaseContext);
    const { isOnline } = useUserConnection();
    const initialPreferences = useRef(preferences);
    const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
    const [localListsPreferences, setLocalListsPreferences] = useState<Record<string, { label: string, value: string }[]>>({});
    const [sliderVisible, setSliderVisible] = useState<boolean>(false);
    const [sliderValue, setSliderValue] = useState<number>(0);
    const [sliderHeading, setSliderHeading] = useState<string>("");
    // Deconstruct the preferences
    const [currentPreferences, setCurrentPreferences] = useState<PreferencesData>({
        first_day_of_week: preferences.first_day_of_week,
        units_to_colors: preferences.units_to_colors,
        units_to_points: preferences.units_to_points
    });

    // Automatically navigate to login screen if login expires or db is not provided
    if (!db || !user){
        navigation.replace("Login Screen");
        return null;
    }

    const havePreferencesChanged = () => {
        return JSON.stringify(initialPreferences.current) !== JSON.stringify(currentPreferences);
    };

    const handleGoBack = () => {
        if (havePreferencesChanged()) {
        setShowLeaveConfirmation(true); // Unsaved changes
        } else {
          navigation.goBack();
        }
    };

    const handleListPreferencesChange = (id: string, preferences: { label: string, value: string }[]) => {
      setLocalListsPreferences(prev => ({ ...prev, [id]: preferences }));
    };

    const handleSavePreferences = async () => {
      try {
        console.log('saving preferences...')
        navigation.goBack();
          // Somehow get the values and save them, after transforming to numeric
          // await savePreferencesData(db, user.uid, mergedPreferences);
          // navigation.navigate("Main Menu Screen", {
          //     userData: userData,
          //     preferences: mergedPreferences
          // });
      } catch (error:any) {
          Alert.alert('Preferences saving failed', error.message);
      };
    };

    const handleFirstDayOfWeekToggle = (value: boolean) => {
      let newValue = value ? "Monday" : "Sunday";
      setCurrentPreferences(prev => ({ ...prev, first_day_of_week: newValue }));
    };

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

    if (!isOnline) return (<UserOffline/>);

    return (
        <View style={{flex:1, backgroundColor: '#FFFF99'}}>
          <View style={styles.mainHeader}>
              <MenuIcon
              iconId='escape-preferences-screen'
              iconSource={require('../assets/icons/arrow_back.png')}
              containerStyle={styles.backArrowContainer}
              iconStyle={styles.backArrow}
              onPress={handleGoBack}
              />
          </View>
          <ScrollView 
            style={styles.scrollView}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[ styles.container, styles.horizontalContainer]}>
              <Text style={styles.label}>First Day of Week</Text>
              <View style={styles.itemContainer}>
                <CustomSwitch
                  offText = 'Sun'
                  onText = 'Mon'
                  value={currentPreferences.first_day_of_week === "Monday"}
                  onValueChange={handleFirstDayOfWeekToggle}
                />
              </View>
            </View>
            <View style={[ styles.container, styles.verticalContainer]}>
              <Text style={styles.label}>Unit Colors</Text>
              <View style={styles.itemContainer}>
                <PreferencesList
                  id="units_to_colors"
                  initialContents={[
                    {label: 'Yellow', value: currentPreferences.units_to_colors.yellow.toString()},
                    {label: 'Orange', value: currentPreferences.units_to_colors.orange.toString()}
                  ]}
                  onButtonPress={() => setSliderVisible(true)}
                />
              </View>
            </View>
            <View style={[ styles.container, styles.verticalContainer]}>
              <Text style={styles.label}>Point Conversion</Text>
              <View style={styles.itemContainer}>
                <PreferencesList
                  id="units_to_points" // Another unique identifier
                  initialContents={UnitTypesKeys.map((key, index) => ({
                    key: key,
                    label: UnitTypesNames[index],
                    value: currentPreferences.units_to_points[key]!.toString()  // Non-null assertion
                  }))}
                  onButtonPress={() => setSliderVisible(true)}
                />
              </View>
            </View>
          </ScrollView>
          <NumericSlider
            visible={sliderVisible}
            transparent={true}
            value={sliderValue}
            heading={sliderHeading}
            setValue={(number) => console.log(number)}
            onRequestClose={() => setSliderVisible(false)}
            onSave={() => setSliderVisible(false)}
          />
          <View style={styles.savePreferencesButtonContainer}>
            <BasicButton 
                text='Save Preferences'
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
  mainHeader: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'white',
  },
  backArrowContainer: {
    justifyContent: 'center',
    marginTop: 10,
    marginLeft: 10,
    padding: 10,
    position: 'absolute',
  },
  backArrow: {
    width: 25,
    height: 25,
  },
  scrollView: {
      width: '100%',
      flexGrow:1, 
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
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    color: 'black'
  },
  preferencesListButton: {
  },
  preferencesListText: {
    height: 40,
    width: 60,
    fontSize: 16,
    color: 'black',
    fontWeight: '500',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#FFFF99',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  savePreferencesButtonContainer: {
    width: '100%',
    height: 70,
    flexShrink: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: '#FFFF99',
    marginBottom: 5,
    padding: 5,
  },
  savePreferencesButton: {
    width: '50%',
    height: 50,
    alignItems: "center",
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fcf50f',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
  },
  savePreferencesButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
});