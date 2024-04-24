import {Image} from 'expo-image';
// import {Image} from 'react-native';
import React from 'react';
import {StyleSheet, type ImageSourcePropType} from 'react-native';
import type ImageSVGProps from './types';

import * as KirokuIcons from '@components/Icon/KirokuIcons';

function ImageSVG({
  src,
  width = '100%',
  height = '100%',
  fill,
  contentFit = 'cover',
  style,
}: ImageSVGProps) {
  const tintColorProp = fill ? {tintColor: fill} : {};

  return (
    <></>
    // <Image
    //   // contentFit={contentFit}
    //   // source={src as ImageSourcePropType}
    //   // source={KirokuIcons.ArrowRight}
    //   // source={
    //   style={styles.image}
    //   source="https://picsum.photos/seed/696/3000/2000"
    //   placeholder={blurhash}
    //   contentFit="cover"
    //   transition={1000}
    //   // style={[{width, height}, style]}
    //   // eslint-disable-next-line react/jsx-props-no-spreading
    //   // {...tintColorProp}
    // />
  );
}
ImageSVG.displayName = 'ImageSVG';
export default ImageSVG;
