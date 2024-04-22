import BasicButton from '@components/Buttons/BasicButton';
import MainHeader from '@components/Header/MainHeader';
import LoadingData from '@components/LoadingData';
import ScreenWrapper from '@components/ScreenWrapper';
import ProfileOverview from '@components/Social/ProfileOverview';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {ProfileNavigatorParamList} from '@libs/Navigation/types';
import type {StackScreenProps} from '@react-navigation/stack';
import type SCREENS from '@src/SCREENS';
import {useState} from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const propTypes = {
  /* Onyx Props */
};

type EditScreenProps = StackScreenProps<
  ProfileNavigatorParamList,
  typeof SCREENS.PROFILE.EDIT
>;

function EditScreen({route}: EditScreenProps) {
  const theme = useTheme();
  const styles = useThemeStyles();
  const StyleUtils = useStyleUtils();
  const {translate} = useLocalize();
  const userId = route.params.userId;
  const {userData, isLoading} = useDatabaseData();
  const profileData = userData?.profile;

  // Hooks
  const [displayName, setDisplayName] = useState(
    profileData?.display_name || '',
  );
  // const [name, setName] = useState(profileData?.name || '');
  const [name, setName] = useState('' || '');

  const onSaveChangesPress = async () => {
    Navigation.goBack();
  };

  if (!profileData) {
    return;
  }

  return (
    <ScreenWrapper testID={EditScreen.displayName}>
      <MainHeader
        headerText={translate('profileScreen.editProfile')}
        onGoBack={() => Navigation.goBack()}
      />
      {isLoading ? (
        <LoadingData />
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
          style={localStyles.scrollView}>
          <TextInput
            accessibilityLabel="Text input field"
            style={localStyles.feedbackWindowText}
            onChangeText={() => {}}
            placeholder={'Write your feedback here'}
            placeholderTextColor={'#a8a8a8'}
            keyboardType="default"
            maxLength={1000}
            multiline={true}
          />
        </ScrollView>
      )}
      <View style={localStyles.saveChangesContainer}>
        <BasicButton
          text="Save Changes"
          buttonStyle={localStyles.saveChangesButton}
          textStyle={localStyles.saveChangesButtonText}
          onPress={onSaveChangesPress}
        />
      </View>
    </ScreenWrapper>
  );
}

const localStyles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    flexShrink: 1,
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
