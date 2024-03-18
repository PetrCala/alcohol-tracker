// import getOperatingSystem from '@libs/getOperatingSystem';
import CONST from '@src/CONST';
import {multiBold} from './bold';
import type FontFamilyStyles from './types';

// In windows and ubuntu, we need some extra system fonts for emojis to work properly
// otherwise few of them will appear as black and white
const fontFamily: FontFamilyStyles = {
  SYSTEM: 'System',
  // MONOSPACE: 'ExpensifyMono-Regular, Segoe UI Emoji, Noto Color Emoji',
  // MONOSPACE_ITALIC: 'ExpensifyMono-Regular, Segoe UI Emoji, Noto Color Emoji',
  // MONOSPACE_BOLD: 'ExpensifyMono-Bold, Segoe UI Emoji, Noto Color Emoji',
  // MONOSPACE_BOLD_ITALIC: 'ExpensifyMono-Bold, Segoe UI Emoji, Noto Color Emoji',
};

// if (getOperatingSystem() === CONST.OS.WINDOWS) {
//   Object.keys(fontFamily).forEach(key => {
//     fontFamily[key as keyof FontFamilyStyles] = fontFamily[
//       key as keyof FontFamilyStyles
//     ].replace('Segoe UI Emoji', 'Noto Color Emoji');
//   });
// }

export default fontFamily;
