import React, {useContext, useEffect, useRef, useState} from 'react';
import {
    Alert,
  Animated,
  BackHandler,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MenuIcon from '../components/Buttons/MenuIcon';
import { PreferencesScreenProps } from '../types/screens';
import { getAuth } from 'firebase/auth';
import { useUserConnection } from '../context/UserConnectionContext';
import DatabaseContext from '../context/DatabaseContext';
import UserOffline from '../components/UserOffline';
import BasicButton from '../components/Buttons/BasicButton';
import { PreferencesData, UnitTypesProps, UnitsToColorsData } from '../types/database';
import { savePreferencesData } from '../database/preferences';
import YesNoPopup from '../components/Popups/YesNoPopup';
import CustomSwitch from '../components/CustomSwitch';


const PreferencesItem: React.FC<{ item: any }> = ({ item }) => (
  <View style={[
    styles.container,
    item.type === 'row' ? styles.horizontalContainer : styles.verticalContainer 
  ]}>
    <Text style={styles.label}>{item.label}</Text>
    <View style={styles.itemContainer}>
      {item.contents}
    </View>
  </View>
);


const PreferencesScreen = ({ route, navigation }: PreferencesScreenProps) => {
    if (!route || ! navigation) return null; // Should never be null
    const { userData, preferences } = route.params;
    const auth = getAuth();
    const user = auth.currentUser;
    const db = useContext(DatabaseContext);
    const { isOnline } = useUserConnection();
    const initialPreferences = useRef(preferences);
    const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
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

    const handleSavePreferences = async () => {
        try {
            await savePreferencesData(db, user.uid, currentPreferences);
            navigation.navigate("Main Menu Screen", {
              userData: userData,
              preferences: currentPreferences
            });
        } catch (error:any) {
            Alert.alert('Preferences saving failed', error.message);
        };
    };

    const handleFirstDayOfWeekToggle = (value: boolean) => {
      let newValue = value ? "Monday" : "Sunday";
      setCurrentPreferences(prev => ({ ...prev, first_day_of_week: newValue }));
    };

    const settingsData = [
        {
        label: 'First Day of Week',
        type: 'row',
        contents: <CustomSwitch
          offText = 'Sun'
          onText = 'Mon'
          value={currentPreferences.first_day_of_week === "Monday"}
          onValueChange={handleFirstDayOfWeekToggle}
        />
        },
        {
        label: 'Unit Colors',
        type: 'column',
        contents: <View><Text>Hello</Text></View>
        },
        {
        label: 'Point Conversion',
        type: 'column',
        contents: <View><Text>Hello</Text></View>
        },
        // Add more settings items as needed
    ];

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
        <ScrollView style={styles.scrollView}>
            {settingsData.map((item, index) => (
            <PreferencesItem key={index} item={item} />
            ))}
        </ScrollView>
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
  savePreferencesButtonContainer: {
    width: '100%',
    height: '10%',
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
    height: '90%',
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