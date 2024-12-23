// import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
// import {Alert, BackHandler, View} from 'react-native';
// import {useUserConnection} from '@context/global/UserConnectionContext';
// import {useFirebase} from '@context/global/FirebaseContext';
// import UserOffline from '@components/UserOfflineModal';
// import {savePreferencesData} from '@database/preferences';
// import {getDefaultPreferences} from '@userActions/User';
// import type {Preferences} from '@src/types/onyx';
// import {useDatabaseData} from '@context/global/DatabaseDataContext';
// import type {StackScreenProps} from '@react-navigation/stack';
// import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
// import type SCREENS from '@src/SCREENS';
// import Navigation from '@libs/Navigation/Navigation';
// import ROUTES from '@src/ROUTES';
// import type {TranslationPaths} from '@src/languages/types';
// import type {Route} from '@src/ROUTES';
// import {isEqual} from 'lodash';
// import ScreenWrapper from '@components/ScreenWrapper';
// import HeaderWithBackButton from '@components/HeaderWithBackButton';
// import useLocalize from '@hooks/useLocalize';
// import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
// import ConfirmModal from '@components/ConfirmModal';
// import Button from '@components/Button';
// import useThemeStyles from '@hooks/useThemeStyles';
// import useWaitForNavigation from '@hooks/useWaitForNavigation';
// import useSingleExecution from '@hooks/useSingleExecution';
// import ScrollView from '@components/ScrollView';
// import MenuItemGroup from '@components/MenuItemGroup';
// import Section from '@components/Section';
// import MenuItem from '@components/MenuItem';
// import type {NumericSliderProps} from '@components/Popups/NumericSlider';
// import NumericSlider from '@components/Popups/NumericSlider';
// import CONST from '@src/CONST';

// type PreferencesSliderConfig = NumericSliderProps & {
//   list: string;
//   key: string;
// };

function DrinksToUnitsScreen() {}

// const initialPreferences = useRef(preferences);
// const [saving, setSaving] = useState<boolean>(false);
// // Deconstruct the preferences
// const defaultPreferences = getDefaultPreferences();
// const [currentPreferences, setCurrentPreferences] = useState<Preferences>(
//   preferences ?? defaultPreferences,
// );
// const havePreferencesChanged = useCallback(() => {
//   return !isEqual(initialPreferences.current, currentPreferences);
// }, [currentPreferences]);

// const handleGoBack = useCallback(() => {
//   if (havePreferencesChanged()) {
//     setShowLeaveConfirmation(true); // Unsaved changes
//   } else {
//     Navigation.goBack();
//   }
// }, [havePreferencesChanged]);

// const handleSavePreferences = () => {
//   (async () => {
//     if (!user) {
//       return;
//     }
//     try {
//       setSaving(true);
//       await savePreferencesData(db, user.uid, currentPreferences);
//       Navigation.navigate(ROUTES.SETTINGS);
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : '';
//       Alert.alert(translate('preferencesScreen.error.save'), errorMessage);
//     } finally {
//       setSaving(false);
//     }
//   })();
// };

// const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);

// /** A helper function to generate the preference set buttons */
// const setPreferencesButton = useCallback(
//   (
//     key: string,
//     label: string,
//     value: number,
//     sliderListKey: string,
//     sliderMinValue: number,
//     sliderMaxValue: number,
//   ) => {
//     return (
//       <Button
//         text={value.toString()}
//         style={styles.settingValueButton}
//         onPress={() =>
//           setSliderConfig(prev => ({
//             ...prev,
//             visible: true,
//             heading: label,
//             step: sliderMinValue,
//             value,
//             maxValue: sliderMaxValue,
//             list: sliderListKey,
//             key,
//           }))
//         }
//       />
//     );
//   },
//   [styles.settingValueButton],
// );

// const [sliderConfig, setSliderConfig] = useState<PreferencesSliderConfig>({
//   visible: false,
//   heading: '',
//   step: 1,
//   value: 0,
//   maxValue: 5,
//   onRequestClose: () => {},
//   onSave: () => {},
//   list: '',
//   key: '',
// });

// const havePreferencesChanged = useCallback(() => {
//   return !isEqual(initialPreferences.current, currentPreferences);
// }, [currentPreferences]);

// const drinksToUnitsMenuItems = useMemo(
//   () => getMenuItemsSection(drinksToColorsItemsData),
//   [drinksToColorsItemsData, getMenuItemsSection],
// );

// const drinksToColorsItemsData: Menu = useMemo(() => {
//   const drinksHelperData = [
//     {
//       title: translate('drinks.smallBeer'),
//       key: CONST.DRINKS.KEYS.SMALL_BEER,
//       currentValue: currentPreferences.drinks_to_units.small_beer,
//     },
//     {
//       title: translate('drinks.beer'),
//       key: CONST.DRINKS.KEYS.BEER,
//       currentValue: currentPreferences.drinks_to_units.beer,
//     },
//     {
//       title: translate('drinks.wine'),
//       key: CONST.DRINKS.KEYS.WINE,
//       currentValue: currentPreferences.drinks_to_units.wine,
//     },
//     {
//       title: translate('drinks.weakShot'),
//       key: CONST.DRINKS.KEYS.WEAK_SHOT,
//       currentValue: currentPreferences.drinks_to_units.weak_shot,
//     },
//     {
//       title: translate('drinks.strongShot'),
//       key: CONST.DRINKS.KEYS.STRONG_SHOT,
//       currentValue: currentPreferences.drinks_to_units.strong_shot,
//     },
//     {
//       title: translate('drinks.cocktail'),
//       key: CONST.DRINKS.KEYS.COCKTAIL,
//       currentValue: currentPreferences.drinks_to_units.cocktail,
//     },
//     {
//       title: translate('drinks.other'),
//       key: CONST.DRINKS.KEYS.OTHER,
//       currentValue: currentPreferences.drinks_to_units.other,
//     },
//   ];

//   return {
//     sectionTranslationKey: 'preferencesScreen.drinksToUnitsSection.title',
//     subtitle: translate('preferencesScreen.drinksToUnitsSection.description'),
//     items: drinksHelperData.map(item => ({
//       title: item.title,
//       disabled: true,
//       rightComponent: setPreferencesButton(
//         item.key,
//         item.title,
//         item.currentValue,
//         'drinks_to_units',
//         0.1, // Min value
//         3, // Max value
//       ),
//     })),
//   };
// }, [currentPreferences, setPreferencesButton, translate]);

// // const updateDrinksToUnits = (DrinkKey: typeof DrinkTypesKeys[number], value: number) => {
// const updateDrinksToUnits = (DrinkKey: string, value: number) => {
//   setCurrentPreferences(prev => ({
//     ...prev,
//     drinks_to_units: {
//       ...prev.drinks_to_units,
//       [DrinkKey]: value,
//     },
//   }));
// };

// if (saving) {
//   return (
//     <FullScreenLoadingIndicator
//       loadingText={translate('preferencesScreen.saving')}
//     />
//   );
// }

// <ConfirmModal
//   isVisible={showLeaveConfirmation}
//   title={translate('common.areYouSure')}
//   prompt={translate('preferencesScreen.unsavedChanges')}
//   onConfirm={() => {
//     setSliderConfig(prev => ({...prev, visible: false}));
//     setShowLeaveConfirmation(false);
//     Navigation.goBack();
//   }}
//   onCancel={() => setShowLeaveConfirmation(false)}
// />

// <View style={[styles.bottomTabBarContainer, styles.p5]}>
//   <Button
//     large
//     success
//     text={translate('preferencesScreen.save')}
//     onPress={handleSavePreferences}
//     style={styles.bottomTabButton}
//   />
// </View>

export default DrinksToUnitsScreen;
