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

function UnitsToColorsScreen() {}

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

// const unitsToColorsMenuItems = useMemo(
//   () => getMenuItemsSection(unitsToColorsMenuItemsData),
//   [unitsToColorsMenuItemsData, getMenuItemsSection],
// );

// const unitsToColorsMenuItemsData: Menu = useMemo(() => {
//   const unitsHelperData = [
//     {
//       title: 'Yellow',
//       key: 'yellow',
//       currentValue: currentPreferences.units_to_colors.yellow,
//     },
//     {
//       title: 'Orange',
//       key: 'orange',
//       currentValue: currentPreferences.units_to_colors.orange,
//     },
//   ];

//   return {
//     sectionTranslationKey: 'preferencesScreen.unitColorsSection.title',
//     subtitle: translate('preferencesScreen.unitColorsSection.description'),
//     items: unitsHelperData.map(item => ({
//       title: item.title,
//       disabled: true,
//       rightComponent: setPreferencesButton(
//         item.key,
//         item.title,
//         item.currentValue,
//         'units_to_colors',
//         1, // Min value
//         15, // Max value
//       ),
//     })),
//   };
// }, [currentPreferences, setPreferencesButton, translate]);

// const updateUnitsToColors = (colorKey: string, value: number) => {
//   // const updateUnitsToColors = (colorKey: keyof UnitsToColorsData, value: number) => {
//   setCurrentPreferences(prev => ({
//     ...prev,
//     units_to_colors: {
//       ...prev.units_to_colors,
//       [colorKey]: value,
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

// <NumericSlider
//   visible={sliderConfig.visible}
//   value={sliderConfig.value}
//   heading={sliderConfig.heading}
//   step={sliderConfig.step}
//   maxValue={sliderConfig.maxValue}
//   onRequestClose={() => {
//     setSliderConfig(prev => ({...prev, visible: false}));
//   }}
//   onSave={newValue => {
//     if (sliderConfig.list === 'units_to_colors') {
//       updateUnitsToColors(sliderConfig.key, newValue);
//     } else if (sliderConfig.list === 'drinks_to_units') {
//       updateDrinksToUnits(sliderConfig.key, newValue);
//     }
//     setSliderConfig(prev => ({...prev, visible: false}));
//   }}
// />

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

export default UnitsToColorsScreen;
