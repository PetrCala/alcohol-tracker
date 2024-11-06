import {useRoute} from '@react-navigation/native';
import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ScrollView as RNScrollView,
  Alert,
  BackHandler,
  Keyboard,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {useUserConnection} from '@context/global/UserConnectionContext';
import {useFirebase} from '@context/global/FirebaseContext';
import UserOffline from '@components/UserOfflineModal';
import {savePreferencesData} from '@database/preferences';
import {getDefaultPreferences} from '@database/users';
import type {Preferences} from '@src/types/onyx';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
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
import MenuItem from '@components/MenuItem';
import IconAsset from '@src/types/utils/IconAsset';
import useActiveCentralPaneRoute from '@hooks/useActiveCentralPaneRoute';
import useSingleExecution from '@hooks/useSingleExecution';
import MenuItemGroup from '@components/MenuItemGroup';
import Section from '@components/Section';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';

type PreferencesListProps = {
  id: string;
  initialContents: Array<{key: string; label: string; value: string}>;
  onButtonPress: (key: string, label: string, value: number) => void;
};

const PreferencesList: React.FC<PreferencesListProps> = ({
  id,
  initialContents,
  onButtonPress,
}) => {
  return (
    <View style={localStyles.preferencesListContainer}>
      {initialContents.map((item, index) => {
        const itemValue = parseFloat(item.value);

        return (
          <View key={index} style={localStyles.preferencesListRowContainer}>
            <Text style={localStyles.preferencesListLabel}>{item.label}</Text>
            {/* <View style={localStyles.preferencesListUseContainer}>
            </View> */}
            <View style={localStyles.preferencesListNumericContainer}>
              <TouchableOpacity
                accessibilityRole="button"
                style={localStyles.preferencesListButton}
                onPress={() => onButtonPress(item.key, item.label, itemValue)}>
                <Text style={localStyles.preferencesListText}>{itemValue}</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
};

type MenuData = {
  translationKey: TranslationPaths;
  icon: IconAsset;
  routeName?: Route;
  action?: () => void;
  link?: string | (() => Promise<string>);
  iconStyles?: StyleProp<ViewStyle>;
  fallbackIcon?: IconAsset;
  shouldStackHorizontally?: boolean;
  title?: string;
  shouldShowRightIcon?: boolean;
  iconRight?: IconAsset;
};

type Menu = {
  sectionStyle: StyleProp<ViewStyle>;
  sectionTranslationKey: TranslationPaths;
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

  /**
   * Retuns JSX.Element with menu items
   * @param menuItemsData list with menu items data
   * @returns the menu items for passed data
   */
  // const getMenuItemsSection = useCallback((menuItemsData): Menu => {
  //   return (
  //     <Section title={translate('preferencesScreen.generalSection')}>
  //       <MenuItemWithTopDescription
  //         key={`${'hello'}_${'wolrd'}`}
  //         shouldShowRightIcon
  //         title={'hello'}
  //         description={'hello'}
  //         wrapperStyle={styles.sectionMenuItemTopDescription}
  //         onPress={() => {}}
  //         // // eslint-disable-next-line react/no-array-index-key
  //         // key={`${detail.title}_${index}`}
  //         // shouldShowRightIcon
  //         // title={detail.title}
  //         // description={detail.description}
  //         // wrapperStyle={styles.sectionMenuItemTopDescription}
  //         // onPress={() => Navigation.navigate(detail.pageRoute)}
  //         // // brickRoadIndicator={detail.brickRoadIndicator}
  //       />
  //     </Section>
  //   );
  // }, []);

  const {saveScrollOffset, getScrollOffset} = useContext(ScrollOffsetContext);
  const route = useRoute();
  const scrollViewRef = useRef<RNScrollView>(null);

  const onScroll = useCallback<NonNullable<ScrollViewProps['onScroll']>>(
    e => {
      // If the layout measurement is 0, it means the flashlist is not displayed but the onScroll may be triggered with offset value 0.
      // We should ignore this case.
      if (e.nativeEvent.layoutMeasurement.height === 0) {
        return;
      }
      saveScrollOffset(route, e.nativeEvent.contentOffset.y);
    },
    [route, saveScrollOffset],
  );

  useLayoutEffect(() => {
    const scrollOffset = getScrollOffset(route);
    if (!scrollOffset || !scrollViewRef.current) {
      return;
    }
    scrollViewRef.current.scrollTo({y: scrollOffset, animated: false});
  }, [getScrollOffset, route]);

  useMemo(() => {
    if (!preferences) {
      return;
    }
    const newPreferences = {
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
      <ScrollView
        ref={scrollViewRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.w100]}>
        {/* <MenuItemGroup>{getMenuItemsSection()}</MenuItemGroup> */}
      </ScrollView>
      <View style={styles.bottomTabBarContainer}>
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

const localStyles = StyleSheet.create({
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
    width: 'auto',
    maxWidth: '75%',
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
});

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
