import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Alert, BackHandler, StyleSheet, View} from 'react-native';
import {useUserConnection} from '@context/global/UserConnectionContext';
import {useFirebase} from '@context/global/FirebaseContext';
import UserOffline from '@components/UserOfflineModal';
import {savePreferencesData} from '@database/preferences';
import {getDefaultPreferences} from '@database/users';
import type {Preferences} from '@src/types/onyx';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import type {StackScreenProps} from '@react-navigation/stack';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {TranslationPaths} from '@src/languages/types';
import type {Route} from '@src/ROUTES';
import {isEqual} from 'lodash';
import ScreenWrapper from '@components/ScreenWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import useLocalize from '@hooks/useLocalize';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ConfirmModal from '@components/ConfirmModal';
import Button from '@components/Button';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import useActiveCentralPaneRoute from '@hooks/useActiveCentralPaneRoute';
import useSingleExecution from '@hooks/useSingleExecution';
import ScrollView from '@components/ScrollView';
import MenuItemGroup from '@components/MenuItemGroup';
import Section from '@components/Section';
import MenuItem from '@components/MenuItem';
import Icon from '@components/Icon';
import TextInput from '@components/TextInput';
import AmountTextInput from '@components/AmountTextInput';
import FillerView from '@components/FillerView';

type MenuData = {
  title?: string;
  description?: string;
  pageRoute?: Route;
  disabled?: boolean;
  rightComponent?: React.ReactNode;
  // action?: () => void;
  // link?: string | (() => Promise<string>);
  // translationKey: TranslationPaths;
  // icon: IconAsset;
  // routeName?: Route;
  // action?: () => void;
  // link?: string | (() => Promise<string>);
  // iconStyles?: StyleProp<ViewStyle>;
  // shouldStackHorizontally?: boolean;
  // shouldShowRightIcon?: boolean;
  // iconRight?: IconAsset;
};
type Menu = {
  sectionTranslationKey: TranslationPaths;
  subtitle?: string;
  items: MenuData[];
};

type PreferencesScreenProps = StackScreenProps<
  SettingsNavigatorParamList,
  typeof SCREENS.SETTINGS.PREFERENCES.ROOT
>;

function PreferencesScreen({}: PreferencesScreenProps) {
  const {auth, db} = useFirebase();
  const user = auth.currentUser;
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const {isExecuting, singleExecution} = useSingleExecution();
  const {isOnline} = useUserConnection();
  const {preferences} = useDatabaseData();
  const waitForNavigate = useWaitForNavigation();
  const popoverAnchor = useRef(null);
  const activeCentralPaneRoute = useActiveCentralPaneRoute();
  const initialPreferences = useRef(preferences);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [sliderVisible, setSliderVisible] = useState<boolean>(false);
  const [sliderStep, setSliderStep] = useState<number>(1);
  const [sliderMaxValue, setSliderMaxValue] = useState<number>(5);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [sliderHeading, setSliderHeading] = useState<string>('');
  const [sliderList, setSliderList] = useState<string>('');
  const [sliderKey, setSliderKey] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  // Deconstruct the preferences
  const defaultPreferences = getDefaultPreferences();
  const [currentPreferences, setCurrentPreferences] = useState<Preferences>(
    preferences || defaultPreferences,
  );

  const havePreferencesChanged = () => {
    return !isEqual(initialPreferences.current, currentPreferences);
  };

  const handleGoBack = () => {
    if (havePreferencesChanged()) {
      setShowLeaveConfirmation(true); // Unsaved changes
    } else {
      Navigation.goBack();
    }
  };

  const handleSavePreferences = async () => {
    if (!user) {
      return;
    }
    try {
      setSaving(true);
      await savePreferencesData(db, user.uid, currentPreferences);
      Navigation.navigate(ROUTES.SETTINGS);
    } catch (error: any) {
      Alert.alert(translate('preferencesScreen.error.save'), error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFirstDayOfWeekToggle = (value: boolean) => {
    const newValue = value ? 'Monday' : 'Sunday';
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

  // const updateDrinksToUnits = (DrinkKey: typeof DrinkTypesKeys[number], value: number) => {
  const updateDrinksToUnits = (DrinkKey: string, value: number) => {
    setCurrentPreferences(prev => ({
      ...prev,
      drinks_to_units: {
        ...prev.drinks_to_units,
        [DrinkKey]: value,
      },
    }));
  };

  const preferencesTextInput = (
    key: string,
    value: number,
  ): React.ReactNode => {
    return (
      <AmountTextInput
        formattedAmount={value.toString()}
        onChangeAmount={newValue => {
          if (key === 'Yellow' || key === 'Orange') {
            updateUnitsToColors(key, parseFloat(newValue));
          } else {
            updateDrinksToUnits(key, parseFloat(newValue));
          }
        }}
        touchableInputWrapperStyle={{
          backgroundColor: 'white',
          borderRadius: 8,
          width: 40,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 0,
        }}
        style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: 'black',
        }}
        placeholder={value.toString()}
      />
    );
  };

  const generalMenuItemsData: Menu = useMemo(() => {
    return {
      sectionTranslationKey: 'preferencesScreen.generalSection.title',
      items: [
        {
          title: translate('preferencesScreen.generalSection.firstDayOfWeek'),
          description: 'Monday',
          pageRoute: ROUTES.HOME,
        },
      ],
    };
  }, []);

  const unitsToColorsMenuItemsData: Menu = useMemo(() => {
    return {
      sectionTranslationKey: 'preferencesScreen.unitColorsSection.title',
      subtitle: translate('preferencesScreen.unitColorsSection.description'),
      items: [
        {
          title: 'Yellow',
          rightComponent: preferencesTextInput(
            'Yellow',
            currentPreferences.units_to_colors.yellow,
          ),
          disabled: true,
        },
      ],

      //       initialContents={[
      //         {
      //           key: 'yellow',
      //           label: 'Yellow',
      //           value: currentPreferences.units_to_colors.yellow.toString(),
      //         },
      //         {
      //           key: 'orange',
      //           label: 'Orange',
      //           value: currentPreferences.units_to_colors.orange.toString(),
      //         },
      //       ]}
    };
  }, []);

  const drinksToColorsItemsData: Menu = useMemo(() => {
    return {
      sectionTranslationKey: 'preferencesScreen.drinksToUnitsSection.title',
      subtitle: translate('preferencesScreen.drinksToUnitsSection.description'),
      items: [],
    };
  }, []);

  /**
   * Retuns JSX.Element with menu items
   * @param menuItemsData list with menu items data
   * @returns the menu items for passed data
   */
  const getMenuItemsSection = useCallback((menuItemsData: Menu) => {
    return (
      <Section
        title={translate(menuItemsData.sectionTranslationKey)}
        titleStyles={styles.generalSectionTitle}
        subtitle={menuItemsData.subtitle}
        subtitleMuted
        isCentralPane
        childrenStyles={styles.pt3}>
        <>
          {menuItemsData.items.map((detail, index) => (
            <MenuItem
              // eslint-disable-next-line react/no-array-index-key
              key={`${detail.title}_${index}`}
              title={detail.title}
              titleStyle={styles.plainSectionTitle}
              description={detail.description}
              wrapperStyle={styles.sectionMenuItemTopDescription}
              disabled={detail.disabled}
              shouldGreyOutWhenDisabled={false}
              shouldUseRowFlexDirection
              shouldShowRightIcon={!detail.rightComponent}
              shouldShowRightComponent={!!detail.rightComponent}
              rightComponent={detail.rightComponent}
              onPress={() => Navigation.navigate(detail.pageRoute)}
            />
          ))}
        </>
      </Section>
    );
  }, []);

  const generalMenuItems = useMemo(
    () => getMenuItemsSection(generalMenuItemsData),
    [generalMenuItemsData, getMenuItemsSection],
  );
  const unitsToColorsMenuItems = useMemo(
    () => getMenuItemsSection(unitsToColorsMenuItemsData),
    [unitsToColorsMenuItemsData, getMenuItemsSection],
  );
  const drinksToUnitsMenuItems = useMemo(
    () => getMenuItemsSection(drinksToColorsItemsData),
    [drinksToColorsItemsData, getMenuItemsSection],
  );

  useMemo(() => {
    if (!preferences) {
      return;
    }
    const newPreferences: Preferences = {
      first_day_of_week: preferences.first_day_of_week,
      units_to_colors: preferences.units_to_colors,
      drinks_to_units: preferences.drinks_to_units,
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

  if (!isOnline) {
    return <UserOffline />;
  }
  if (!user || !preferences) {
    Navigation.navigate(ROUTES.LOGIN);
    return null;
  }
  if (saving) {
    return (
      <FullScreenLoadingIndicator
        loadingText={translate('preferencesScreen.saving')}
      />
    );
  }

  return (
    <ScreenWrapper testID={PreferencesScreen.displayName}>
      <HeaderWithBackButton
        title={translate('preferencesScreen.title')}
        onBackButtonPress={handleGoBack}
      />
      <ScrollView contentContainerStyle={[styles.w100]}>
        <MenuItemGroup>
          {generalMenuItems}
          {unitsToColorsMenuItems}
          {drinksToUnitsMenuItems}
          <FillerView height={400} />
        </MenuItemGroup>
      </ScrollView>
      <View style={styles.bottomTabBarContainer(true)}>
        <Button
          text={translate('preferencesScreen.save')}
          onPress={handleSavePreferences}
          style={styles.bottomTabButton}
          success
        />
      </View>
      <ConfirmModal
        isVisible={showLeaveConfirmation}
        title={translate('common.areYouSure')}
        prompt={translate('preferencesScreen.unsavedChanges')}
        onConfirm={() => {
          setShowLeaveConfirmation(false);
          Navigation.goBack();
        }}
        onCancel={() => setShowLeaveConfirmation(false)}
      />
    </ScreenWrapper>
  );
}

PreferencesScreen.displayName = 'Preferences Screen';
export default PreferencesScreen;

//  <View style={[localStyles.container, localStyles.horizontalContainer]}>
//   <Text style={localStyles.label}>First Day of Week</Text>
//   <View style={localStyles.itemContainer}>
//     <TextSwitch
//       offText="Sun"
//       onText="Mon"
//       value={currentPreferences.first_day_of_week === 'Monday'}
//       onValueChange={handleFirstDayOfWeekToggle}
//     />
//   </View>
// </View>
// <View style={[localStyles.container, localStyles.verticalContainer]}>
//   <Text style={localStyles.label}>Unit Colors</Text>
//   <View style={localStyles.itemContainer}>
//     <PreferencesList
//       id="units_to_colors"
//       initialContents={[
//         {
//           key: 'yellow',
//           label: 'Yellow',
//           value: currentPreferences.units_to_colors.yellow.toString(),
//         },
//         {
//           key: 'orange',
//           label: 'Orange',
//           value: currentPreferences.units_to_colors.orange.toString(),
//         },
//       ]}
//       onButtonPress={(key, label, value) => {
//         setSliderHeading(label);
//         setSliderStep(1);
//         setSliderMaxValue(15);
//         setSliderValue(value);
//         setSliderVisible(true);
//         setSliderList('units_to_colors');
//         setSliderKey(key);
//       }}
//     />
//   </View>
// </View>
// <View style={[localStyles.container, localStyles.verticalContainer]}>
//   <Text style={localStyles.label}>Drinks to Units Conversion</Text>
//   <View style={localStyles.itemContainer}>
//     <PreferencesList
//       id="drinks_to_units" // Another unique identifier
//       initialContents={Object.values(CONST.DRINKS.KEYS).map(
//         (key, index) => ({
//           key: key,
//           label: Object.values(CONST.DRINKS.NAMES)[index],
//           value: currentPreferences.drinks_to_units[key].toString(), // Non-null assertion
//         }),
//       )}
//       onButtonPress={(key, label, value) => {
//         setSliderHeading(label);
//         setSliderStep(0.1);
//         setSliderMaxValue(3);
//         setSliderValue(value);
//         setSliderVisible(true);
//         setSliderList('drinks_to_units');
//         setSliderKey(key);
//       }}
//     />
//   </View>
// </View>
// {/* <View style={[localStyles.container, localStyles.horizontalContainer]}>
//   <Text style={localStyles.label}>
//     Automatically order drinks in session window
//   </Text>
//   <View style={localStyles.itemContainer}>
//     <Text>hello</Text>
//   </View>
// </View> */}
// <NumericSlider
//   visible={sliderVisible}
//   transparent={true}
//   value={sliderValue}
//   heading={sliderHeading}
//   step={sliderStep}
//   maxValue={sliderMaxValue}
//   onRequestClose={() => {
//     setSliderVisible(false);
//     setSliderValue(0);
//     setSliderHeading('');
//   }}
//   onSave={newValue => {
//     if (sliderList == 'units_to_colors') {
//       updateUnitsToColors(sliderKey, newValue);
//     } else if (sliderList == 'drinks_to_units') {
//       updateDrinksToUnits(sliderKey, newValue);
//     }
//     setSliderVisible(false);
//   }}
// />
