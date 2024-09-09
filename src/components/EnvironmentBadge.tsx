import React from 'react';
import useEnvironment from '@hooks/useEnvironment';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Environment from '@libs/Environment/Environment';
import CONST from '@src/CONST';
import pkg from '../../package.json';
import Badge from './Badge';

const ENVIRONMENT_SHORT_FORM = {
  [CONST.ENVIRONMENT.DEV]: 'DEV',
  [CONST.ENVIRONMENT.STAGING]: 'STG',
  [CONST.ENVIRONMENT.PROD]: 'PROD',
  [CONST.ENVIRONMENT.ADHOC]: 'ADHOC',
  [CONST.ENVIRONMENT.TEST]: 'TEST',
};

function EnvironmentBadge() {
  const styles = useThemeStyles();
  const {environment, isProduction} = useEnvironment();

  // If we are on production, don't show any badge
  if (isProduction) {
    return null;
  }

  const text = Environment.isInternalTestBuild()
    ? `v${pkg.version}`
    : ENVIRONMENT_SHORT_FORM[environment];

  return (
    <Badge
      success={environment === CONST.ENVIRONMENT.STAGING}
      error={environment !== CONST.ENVIRONMENT.STAGING}
      text={text}
      badgeStyles={[styles.alignSelfStart, styles.headerEnvBadge]}
      textStyles={[styles.headerEnvBadgeText, {fontWeight: '700'}]}
      environment={environment}
      pressable
    />
  );
}

EnvironmentBadge.displayName = 'EnvironmentBadge';
export default EnvironmentBadge;
