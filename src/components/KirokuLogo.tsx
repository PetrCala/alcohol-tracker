import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
// import AdHocLogo from '@assets/images/expensify-logo--adhoc.svg';
// import DevLogo from '@assets/images/expensify-logo--dev.svg';
// import StagingLogo from '@assets/images/expensify-logo--staging.svg';
// import ProductionLogo from '@assets/images/expensify-wordmark.svg';
import useEnvironment from '@hooks/useEnvironment';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import * as KirokuIcons from './Icon/KirokuIcons';
import ImageSVG from './ImageSVG';

type KirokuLogoProps = {
  /** Additional styles to add to the component */
  style?: StyleProp<ViewStyle>;
};

const logoComponents = {
  // TODO enable these logos
  // [CONST.ENVIRONMENT.DEV]: DevLogo,
  // [CONST.ENVIRONMENT.STAGING]: StagingLogo,
  // [CONST.ENVIRONMENT.PRODUCTION]: ProductionLogo,
  // [CONST.ENVIRONMENT.ADHOC]: AdHocLogo,
  [CONST.ENVIRONMENT.TEST]: KirokuIcons.Logo,
  [CONST.ENVIRONMENT.DEV]: KirokuIcons.Logo,
  [CONST.ENVIRONMENT.STAGING]: KirokuIcons.Logo,
  [CONST.ENVIRONMENT.PROD]: KirokuIcons.Logo,
  [CONST.ENVIRONMENT.ADHOC]: KirokuIcons.Logo,
};

function KirokuLogo({style}: KirokuLogoProps) {
  const styles = useThemeStyles();
  const StyleUtils = useStyleUtils();
  const {environment} = useEnvironment();
  // PascalCase is required for React components, so capitalize the const here
  const LogoComponent = logoComponents[environment];

  const {shouldUseNarrowLayout} = useResponsiveLayout();

  return (
    <View
      style={[
        StyleUtils.getSignUpLogoWidthStyle(shouldUseNarrowLayout, environment),
        StyleUtils.getHeight(
          shouldUseNarrowLayout
            ? variables.signInLogoHeightSmallScreen
            : variables.signInLogoSize,
        ),
        shouldUseNarrowLayout &&
          // Possible offset for staging/dev environments
          // (environment === CONST.ENVIRONMENT.DEV ||
          //   environment === CONST.ENVIRONMENT.STAGING)
          //   ? styles.ml3
          //   : {},
          style,
      ]}>
      <ImageSVG contentFit="contain" src={LogoComponent} />
    </View>
  );
}

KirokuLogo.displayName = 'KirokuLogo';

export default KirokuLogo;
