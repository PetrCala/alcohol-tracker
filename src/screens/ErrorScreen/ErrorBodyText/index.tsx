import React from 'react';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';

function ErrorBodyText() {
  const {translate} = useLocalize();

  return (
    <Text>
      {`${translate('genericErrorScreen.body.helpTextMobile')}`}
      {/* TODO enable this after a web page has been implemented */}
      {/* <TextLink href={CONST.NEW_EXPENSIFY_URL} style={[styles.link]}>
        {translate('genericErrorScreen.body.helpTextWeb')}
      </TextLink> */}
    </Text>
  );
}

ErrorBodyText.displayName = 'ErrorBodyText';

export default ErrorBodyText;
