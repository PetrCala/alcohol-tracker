import ScreenWrapper from '@components/ScreenWrapper';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type {StackScreenProps} from '@react-navigation/stack';
import type SCREENS from '@src/SCREENS';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import {Alert, Image, StyleProp, View, ViewStyle} from 'react-native';
import CONST from '@src/CONST';
import {copyToClipboard} from '@libs/StringUtilsKiroku';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import MenuItemList from '@components/MenuItemList';
import {useMemo, useRef, useState} from 'react';
import IconAsset from '@src/types/utils/IconAsset';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import {TranslationPaths} from '@src/languages/types';
import Modal from '@components/Modal';
import Button from '@components/Button';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useStyleUtils from '@hooks/useStyleUtils';

type MenuItem = {
  translationKey: TranslationPaths;
  icon: IconAsset;
  iconRight?: IconAsset;
  action?: () => Promise<void>;
  onPress?: () => void;
  link?: string;
  wrapperStyle?: StyleProp<ViewStyle>;
};

type AppShareScreenProps = StackScreenProps<
  SettingsNavigatorParamList,
  typeof SCREENS.SETTINGS.APP_SHARE
>;

function AppShareScreen({route}: AppShareScreenProps) {
  const styles = useThemeStyles();
  const popoverAnchor = useRef<View | null>(null);
  const {isSmallScreenWidth, windowWidth, windowHeight} = useWindowDimensions();
  const StyleUtils = useStyleUtils();
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);
  const waitForNavigate = useWaitForNavigation();
  const {translate} = useLocalize();

  const onClose = () => setIsQrModalVisible(false);

  const handleCopyLinkPress = () => {
    try {
      copyToClipboard(CONST.APP_DOWNLOAD_LINK, true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      Alert.alert('Error', errorMessage);
    }
  };

  const menuItems = useMemo(() => {
    const baseMenuItems: MenuItem[] = [
      {
        translationKey: 'appShareScreen.link',
        icon: KirokuIcons.Link,
        iconRight: KirokuIcons.Copy,
        onPress: handleCopyLinkPress,
      },
      {
        translationKey: 'appShareScreen.qrCode',
        icon: KirokuIcons.QrCode,
        iconRight: KirokuIcons.Search,
        onPress: () => setIsQrModalVisible(true),
      },
    ];

    return baseMenuItems.map(
      ({translationKey, icon, iconRight, onPress}: MenuItem) => ({
        translationKey,
        title: translate(translationKey),
        icon,
        iconRight: iconRight,
        onPress: onPress,
        shouldShowRightIcon: true,
        ref: popoverAnchor,
        wrapperStyle: [styles.sectionMenuItemTopDescription],
      }),
    );
  }, [styles, translate, waitForNavigate]);

  return (
    <ScreenWrapper testID={AppShareScreen.displayName}>
      <HeaderWithBackButton
        title={translate('appShareScreen.title')}
        onBackButtonPress={Navigation.goBack}
      />
      <ScrollView
        scrollEventThrottle={16}
        contentContainerStyle={[styles.w100]}>
        <View style={[styles.flex1]}>
          <Section
            title={translate('appShareScreen.sectionTitle')}
            subtitle={translate('appShareScreen.prompt')}
            titleStyles={styles.accountSettingsSectionTitle}
            subtitleMuted>
            <View style={[styles.flex1, styles.mt5]}>
              <MenuItemList menuItems={menuItems} shouldUseSingleExecution />
            </View>
          </Section>
        </View>
        <Modal
          isVisible={isQrModalVisible}
          onClose={onClose}
          type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}>
          <View
            style={[
              styles.alignItemsCenter,
              styles.justifyContentCenter,
              styles.m5,
              styles.mnh60,
            ]}>
            <View style={[styles.flexGrow1, styles.justifyContentCenter]}>
              <Image
                source={KirokuIcons.QrCodeWithLogo}
                style={[
                  StyleUtils.getQrCodeSizeStyle(
                    isSmallScreenWidth,
                    windowWidth,
                    windowHeight,
                  ),
                ]}
              />
            </View>
            <Button
              large
              text={translate('common.close')}
              style={[styles.p2, styles.mnw100]}
              onPress={onClose}
            />
          </View>
        </Modal>
      </ScrollView>
    </ScreenWrapper>
  );
}

AppShareScreen.displayName = 'App Share Screen';
export default AppShareScreen;
