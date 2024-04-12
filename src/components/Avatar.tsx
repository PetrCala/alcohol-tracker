import React, {useEffect, useState} from 'react';
import type {ImageStyle, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {AvatarSource} from '@libs/UserUtils';
import type {AvatarSizeName} from '@styles/utils';
import CONST from '@src/CONST';
import type {AvatarType} from '@src/types/onyx/OnyxCommon';
import Icon from './Icon';
import * as KirokuImages from './Icon/KirokuImages';
import Image from './Image';

type AvatarProps = {
  /** Source for the avatar. Can be a URL or an icon. */
  source?: AvatarSource;

  /** Extra styles to pass to Image */
  imageStyles?: StyleProp<ViewStyle & ImageStyle>;

  /** Additional styles to pass to Icon */
  iconAdditionalStyles?: StyleProp<ViewStyle>;

  /** Extra styles to pass to View wrapper */
  containerStyles?: StyleProp<ViewStyle>;

  /** Set the size of Avatar */
  size?: AvatarSizeName;

  /**
   * The fill color for the icon. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue'
   */
  fill?: string;

  /** A fallback avatar icon to display when there is an error on loading avatar from remote URL.
   */
  fallbackIcon?: AvatarSource;

  /** Used to locate fallback icon in end-to-end tests. */
  fallbackIconTestID?: string;

  /** Denotes the avatar type */
  type?: AvatarType;

  /** Owner of the avatar. If user, displayName.  */
  name?: string;
};

function Avatar({
  source,
  imageStyles,
  iconAdditionalStyles,
  containerStyles,
  size = CONST.AVATAR_SIZE.DEFAULT,
  fill,
  fallbackIcon = KirokuImages.UserIcon,
  fallbackIconTestID = '',
  type = CONST.ICON_TYPE_AVATAR,
  name = '',
}: AvatarProps) {
  const theme = useTheme();
  const styles = useThemeStyles();
  const StyleUtils = useStyleUtils();
  const [imageError, setImageError] = useState(false);

  useNetwork({onReconnect: () => setImageError(false)});

  useEffect(() => {
    setImageError(false);
  }, [source]);

  const iconSize = StyleUtils.getAvatarSize(size);

  const imageStyle: StyleProp<ImageStyle> = [
    StyleUtils.getAvatarStyle(size),
    imageStyles,
    styles.noBorderRadius,
  ];
  const iconStyle = imageStyles
    ? [StyleUtils.getAvatarStyle(size), styles.bgTransparent, imageStyles]
    : undefined;

  // We pass the color styles down to the SVG for the fallback avatar.
  const useFallBackAvatar =
    imageError || source === KirokuImages.UserIcon || !source;
  const fallbackAvatar = fallbackIcon || KirokuImages.UserIcon;
  const fallbackAvatarTestID = fallbackIconTestID || 'SvgFallbackAvatar Icon';
  const avatarSource = useFallBackAvatar ? fallbackAvatar : source;

  let iconColors;
  if (useFallBackAvatar) {
    iconColors = StyleUtils.getBackgroundColorAndFill(theme.border, theme.icon);
  } else {
    iconColors = null;
  }

  return (
    <View style={[containerStyles, styles.pointerEventsNone]}>
      {typeof avatarSource === 'string' ? (
        <View
          style={[
            iconStyle,
            StyleUtils.getAvatarBorderStyle(size, type),
            iconAdditionalStyles,
          ]}>
          <Image
            source={{uri: avatarSource}}
            style={imageStyle}
            onError={() => setImageError(true)}
          />
        </View>
      ) : (
        <View style={iconStyle}>
          <Icon
            testID={fallbackAvatarTestID}
            src={avatarSource}
            height={iconSize}
            width={iconSize}
            fill={
              imageError
                ? iconColors?.fill ?? theme.offline
                : iconColors?.fill ?? fill
            }
            additionalStyles={[
              StyleUtils.getAvatarBorderStyle(size, type),
              iconColors,
              iconAdditionalStyles,
            ]}
          />
        </View>
      )}
    </View>
  );
}

Avatar.displayName = 'Avatar';

export default Avatar;
export {type AvatarProps};
