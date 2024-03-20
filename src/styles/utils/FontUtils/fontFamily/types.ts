import type {TextStyle} from 'react-native';

type FontFamilyKeys = 'SYSTEM';
// | 'MONOSPACE'
// | 'MONOSPACE_ITALIC'
// | 'MONOSPACE_BOLD'
// | 'MONOSPACE_BOLD_ITALIC';

type FontFamilyStyles = Record<
  FontFamilyKeys,
  NonNullable<TextStyle['fontFamily']>
>;

export default FontFamilyStyles;
