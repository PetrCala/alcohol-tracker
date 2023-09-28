import React, {useContext, useEffect, useRef, useState} from 'react';
import {
    Alert,
  BackHandler,
  ScrollView,
  StyleSheet,
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

const PreferencesItem: React.FC<{ item: any }> = ({ item }) => (
  <View style={styles.settingContainer}>
    <Text style={styles.settingLabel}>{item.label}</Text>
    <View style={styles.buttonsContainer}>
      {item.buttons.map((button:any, index:any) => (
        <TouchableOpacity 
          key={index} 
          style={[styles.button, { backgroundColor: button.color }]}
          onPress={button.action}
        >
          <Text style={styles.buttonText}>{button.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);


const PreferencesScreen = ({ route, navigation }: PreferencesScreenProps) => {
    if (!route || ! navigation) return null; // Should never be null
    const { preferences } = route.params;
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
            navigation.goBack();
        } catch (error:any) {
            Alert.alert('Preferences saving failed', error.message);
        };
    };

    const settingsData = [
        {
        label: 'First Day of Week',
        buttons: [
            { color: 'green', text: '9', action: () => console.log('Green 9 pressed') },
            { color: 'yellow', text: '10', action: () => console.log('Yellow 10 pressed') },
        ],
        },
        {
        label: 'Unit Colors',
        buttons: [
            { color: 'green', text: '9', action: () => console.log('Green 9 pressed') },
            { color: 'yellow', text: '10', action: () => console.log('Yellow 10 pressed') },
        ],
        },
        {
        label: 'Point Conversion',
        buttons: [
            { color: 'blue', text: '5', action: () => console.log('Blue 5 pressed') },
        ],
        },
        // Add more settings items as needed
    ];

    // Updating the preferences
    // setPrefs(prev => ({ ...prev, first_day_of_week: 'Monday' }));

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
  settingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonsContainer: {
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