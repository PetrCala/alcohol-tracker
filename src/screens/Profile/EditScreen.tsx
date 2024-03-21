import BasicButton from '@components/Buttons/BasicButton';
import MainHeader from '@components/Header/MainHeader';
import LoadingData from '@components/LoadingData';
import ScreenWrapper from '@components/ScreenWrapper';
import ProfileOverview from '@components/Social/ProfileOverview';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import Navigation from '@libs/Navigation/Navigation';
import {ProfileNavigatorParamList} from '@libs/Navigation/types';
import {StackScreenProps} from '@react-navigation/stack';
import SCREENS from '@src/SCREENS';
import {useState} from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type EditItem = {
  title: string;
  value: string;
  setValue: (value: string) => void;
  placeholder: string;
  required: boolean;
  keyboardType: 'default' | 'email-address' | 'numeric';
  // maxLength: number;
  // multiline: boolean;
};

type EditDataArray = Array<EditItem>;

type EditScreenProps = StackScreenProps<
  ProfileNavigatorParamList,
  typeof SCREENS.PROFILE.EDIT
>;

function EditScreen({route}: EditScreenProps) {
  const userId = route.params.userId;
  const {userData, isLoading} = useDatabaseData();
  const profileData = userData?.profile;

  // Hooks
  const [displayName, setDisplayName] = useState(
    profileData?.display_name || '',
  );
  // const [name, setName] = useState(profileData?.name || '');
  const [name, setName] = useState('' || '');

  const editData: EditDataArray = [
    {
      title: 'Display Name',
      value: displayName,
      setValue: setDisplayName,
      placeholder: 'Enter your display name',
      required: true,
      keyboardType: 'default',
    },
    {
      title: 'Name',
      value: '',
      setValue: () => {},
      placeholder: 'Enter your name',
      required: false,
      keyboardType: 'default',
    },
  ];

  const handleSaveChanges = async () => {
    Navigation.goBack();
  };

  if (!profileData) return;

  return (
    <ScreenWrapper testID={EditScreen.displayName}>
      <MainHeader
        headerText="Edit Your Profile"
        onGoBack={() => Navigation.goBack()}
      />
      {isLoading ? (
        <LoadingData />
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
          style={styles.scrollView}>
          <TextInput
            style={styles.feedbackWindowText}
            onChangeText={() => {}}
            placeholder={'Write your feedback here'}
            placeholderTextColor={'#a8a8a8'}
            keyboardType="default"
            maxLength={1000}
            multiline={true}
          />
        </ScrollView>
      )}
      <View style={styles.saveChangesContainer}>
        <BasicButton
          text="Save Changes"
          buttonStyle={styles.saveChangesButton}
          textStyle={styles.saveChangesButtonText}
          onPress={handleSaveChanges}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: '#FFFF99',
  },
  saveChangesContainer: {
    width: '100%',
    height: 70,
    flexShrink: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#FFFF99',
    padding: 5,
    paddingBottom: 10,
  },
  saveChangesButton: {
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
  saveChangesButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  feedbackWindowText: {
    height: '100%',
    width: '100%',
    flexGrow: 1,
    flexShrink: 1,
    textAlignVertical: 'top',
    margin: 12,
    color: 'black',
  },
});

EditScreen.displayName = 'Profile Edit Screen';
export default EditScreen;
