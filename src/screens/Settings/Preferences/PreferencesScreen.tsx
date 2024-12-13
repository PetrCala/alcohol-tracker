import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Alert, BackHandler, View} from 'react-native';
import {useUserConnection} from '@context/global/UserConnectionContext';
import {useFirebase} from '@context/global/FirebaseContext';
import UserOffline from '@components/UserOfflineModal';
import {savePreferencesData} from '@database/preferences';
import {getDefaultPreferences} from '@userActions/User';
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
import useSingleExecution from '@hooks/useSingleExecution';
import ScrollView from '@components/ScrollView';
import MenuItemGroup from '@components/MenuItemGroup';
import Section from '@components/Section';
import MenuItem from '@components/MenuItem';
import type {NumericSliderProps} from '@components/Popups/NumericSlider';
import NumericSlider from '@components/Popups/NumericSlider';
import CONST from '@src/CONST';

type MenuData = {
  title?: string;
  description?: string;
  pageRoute?: Route;
  disabled?: boolean;
  rightComponent?: React.ReactNode;
};

type Menu = {
  sectionTranslationKey: TranslationPaths;
  subtitle?: string;
  items: MenuData[];
};

type PreferencesSliderConfig = NumericSliderProps & {
  list: string;
  key: string;
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
  const initialPreferences = useRef(preferences);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [saving, setSaving] = useState<boolean>(false);
  // Deconstruct the preferences
  const defaultPreferences = getDefaultPreferences();
  const [currentPreferences, setCurrentPreferences] = useState<Preferences>(
    preferences || defaultPreferences,
  );
  const [sliderConfig, setSliderConfig] = useState<PreferencesSliderConfig>({
    visible: false,
    heading: '',
    step: 1,
    value: 0,
    maxValue: 5,
    onRequestClose: () => {},
    onSave: () => {},
    list: '',
    key: '',
  });

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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      Alert.alert(translate('preferencesScreen.error.save'), errorMessage);
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

  /** A helper function to generate the preference set buttons */
  const setPreferencesButton = (
    key: string,
    label: string,
    value: number,
    sliderListKey: string,
    sliderMinValue: number,
    sliderMaxValue: number,
  ): React.ReactNode => {
    return (
      <Button
        text={value.toString()}
        style={styles.settingValueButton}
        onPress={() =>
          setSliderConfig(prev => ({
            ...prev,
            visible: true,
            heading: label,
            step: sliderMinValue,
            value,
            maxValue: sliderMaxValue,
            list: sliderListKey,
            key,
          }))
        }
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
          pageRoute: ROUTES.SETTINGS_FIRST_DAY_OF_WEEK,
        },
      ],
    };
  }, [currentPreferences]);

  const unitsToColorsMenuItemsData: Menu = useMemo(() => {
    const unitsHelperData = [
      {
        title: 'Yellow',
        key: 'yellow',
        currentValue: currentPreferences.units_to_colors.yellow,
      },
      {
        title: 'Orange',
        key: 'orange',
        currentValue: currentPreferences.units_to_colors.orange,
      },
    ];

    return {
      sectionTranslationKey: 'preferencesScreen.unitColorsSection.title',
      subtitle: translate('preferencesScreen.unitColorsSection.description'),
      items: unitsHelperData.map(item => ({
        title: item.title,
        disabled: true,
        rightComponent: setPreferencesButton(
          item.key,
          item.title,
          item.currentValue,
          'units_to_colors',
          1, // Min value
          15, // Max value
        ),
      })),
    };
  }, [currentPreferences]);

  const drinksToColorsItemsData: Menu = useMemo(() => {
    const drinksHelperData = [
      {
        title: translate('drinks.smallBeer'),
        key: CONST.DRINKS.KEYS.SMALL_BEER,
        currentValue: currentPreferences.drinks_to_units.small_beer,
      },
      {
        title: translate('drinks.beer'),
        key: CONST.DRINKS.KEYS.BEER,
        currentValue: currentPreferences.drinks_to_units.beer,
      },
      {
        title: translate('drinks.wine'),
        key: CONST.DRINKS.KEYS.WINE,
        currentValue: currentPreferences.drinks_to_units.wine,
      },
      {
        title: translate('drinks.weakShot'),
        key: CONST.DRINKS.KEYS.WEAK_SHOT,
        currentValue: currentPreferences.drinks_to_units.weak_shot,
      },
      {
        title: translate('drinks.strongShot'),
        key: CONST.DRINKS.KEYS.STRONG_SHOT,
        currentValue: currentPreferences.drinks_to_units.strong_shot,
      },
      {
        title: translate('drinks.cocktail'),
        key: CONST.DRINKS.KEYS.COCKTAIL,
        currentValue: currentPreferences.drinks_to_units.cocktail,
      },
      {
        title: translate('drinks.other'),
        key: CONST.DRINKS.KEYS.OTHER,
        currentValue: currentPreferences.drinks_to_units.other,
      },
    ];

    return {
      sectionTranslationKey: 'preferencesScreen.drinksToUnitsSection.title',
      subtitle: translate('preferencesScreen.drinksToUnitsSection.description'),
      items: drinksHelperData.map(item => ({
        title: item.title,
        disabled: true,
        rightComponent: setPreferencesButton(
          item.key,
          item.title,
          item.currentValue,
          'drinks_to_units',
          0.1, // Min value
          3, // Max value
        ),
      })),
    };
  }, [currentPreferences]);

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
              onPress={singleExecution(() => {
                waitForNavigate(() => {
                  Navigation.navigate(detail.pageRoute);
                })();
              })}
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
          {/* {generalMenuItems} */}
          {/* Enable this after the general menu items have been implemented */}
          {unitsToColorsMenuItems}
          {drinksToUnitsMenuItems}
        </MenuItemGroup>
        <NumericSlider
          visible={sliderConfig.visible}
          value={sliderConfig.value}
          heading={sliderConfig.heading}
          step={sliderConfig.step}
          maxValue={sliderConfig.maxValue}
          onRequestClose={() => {
            setSliderConfig(prev => ({...prev, visible: false}));
          }}
          onSave={newValue => {
            if (sliderConfig.list === 'units_to_colors') {
              updateUnitsToColors(sliderConfig.key, newValue);
            } else if (sliderConfig.list === 'drinks_to_units') {
              updateDrinksToUnits(sliderConfig.key, newValue);
            }
            setSliderConfig(prev => ({...prev, visible: false}));
          }}
        />
      </ScrollView>
      <View style={[styles.bottomTabBarContainer, styles.noBorder]}>
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
          setSliderConfig(prev => ({...prev, visible: false}));
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
