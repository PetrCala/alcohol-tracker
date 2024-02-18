// Taken and modified form the Expensify GitHub
// Source: https://github.com/Expensify/App/blob/main/src/CONST.ts

// import Config from 'react-native-config';

// Creating a default array and object this way because objects ({}) and arrays ([]) are not stable types.
// Freezing the array ensures that it cannot be unintentionally modified.
const EMPTY_ARRAY = Object.freeze([]);
const EMPTY_OBJECT = Object.freeze({});

const CONST = {
  APP_IN_BETA: true,
  AVAILABLE_PLATFORMS: ['ios', 'android'],
  AVATAR_SIZE: {
    XLARGE: 'xlarge',
    LARGE: 'large',
    MEDIUM: 'medium',
    DEFAULT: 'default',
    SMALL: 'small',
    SMALLER: 'smaller',
    SUBSCRIPT: 'subscript',
    SMALL_SUBSCRIPT: 'small-subscript',
    MID_SUBSCRIPT: 'mid-subscript',
    LARGE_BORDERED: 'large-bordered',
    HEADER: 'header',
    MENTION_ICON: 'mention-icon',
    SMALL_NORMAL: 'small-normal',
  },
  BROWSER: {
    CHROME: 'chrome',
    FIREFOX: 'firefox',
    IE: 'ie',
    EDGE: 'edge',
    Opera: 'opera',
    SAFARI: 'safari',
    OTHER: 'other',
  },
  CACHE: {
    PROFILE_PICTURE_KEY: 'profilePicture',
  },
  COLOR_SCHEME: {
    LIGHT: 'light',
    DARK: 'dark',
  },
  DROPDOWN_BUTTON_SIZE: {
    LARGE: 'large',
    MEDIUM: 'medium',
  },
  ENVIRONMENT: {
    DEV: 'development',
    STAGING: 'staging',
    PROD: 'production',
    TEST: 'test',
  },
  EMPTY_ARRAY,
  EMPTY_OBJECT,
  FIREBASE_STORAGE_URL: 'https://firebasestorage.googleapis.com',
  FRIEND_REQUEST_STATUS: {
    SELF: 'self',
    SENT: 'sent',
    RECEIVED: 'received',
    FRIEND: 'friend',
    UNDEFINED: 'undefined',
  },
  ICONS: {
    ACHIEVEMENTS: require('@assets/icons/achievements.png'),
    ADD_IMAGE: require('@assets/icons/add-image.png'), //
    ADD_USER: require('@assets/icons/add-user.png'),
    ALCOHOL_ASSORTMENT: require('@assets/icons/alcohol-assortment.png'),
    ARROW_BACK: require('@assets/icons/arrow-back.png'),
    ARROW_DOWN: require('@assets/icons/arrow-down.png'),
    BAR_MENU: require('@assets/icons/bar-menu.png'),
    BEER: require('@assets/icons/beer.png'),
    BOOK: require('@assets/icons/book.png'),
    BUG: require('@assets/icons/bug.png'),
    CAMERA: require('@assets/icons/camera.png'),
    CLOSE: require('@assets/icons/close.png'),
    CHECK: require('@assets/icons/check.png'),
    COCKTAIL: require('@assets/icons/cocktail.png'),
    DELETE_SESSION: require('@assets/icons/delete-session.png'),
    DELETE: require('@assets/icons/delete.png'),
    EDIT: require('@assets/icons/edit.png'),
    EXIT: require('@assets/icons/exit.png'),
    FRIEND_LIST: require('@assets/icons/friend-list.png'),
    IDEA: require('@assets/icons/idea.png'),
    MENU: require('@assets/icons/menu.png'),
    MINUS: require('@assets/icons/minus.png'),
    PLUS: require('@assets/icons/plus.png'),
    REMOVE_USER: require('@assets/icons/remove-user.png'),
    REMOVE: require('@assets/icons/remove.png'),
    SEARCH: require('@assets/icons/search.png'),
    SETTINGS: require('@assets/icons/settings.png'),
    SOCIAL: require('@assets/icons/social.png'),
    STATISTICS: require('@assets/icons/statistics.png'),
    STRONG_SHOT: require('@assets/icons/strong-shot.png'),
    THIN_X: require('@assets/icons/thin-x.png'),
    WEAK_SHOT: require('@assets/icons/weak-shot.png'),
    WINE: require('@assets/icons/wine.png'),
  },
  IMAGES: {
    LOGO: require('@assets/logo/alcohol-tracker-source-icon.png'),
    UNDER_MAINTENANCE: require('@assets/images/under-maintenance.jpg'),
    USER: require('@assets/temp/user.png'),
  },
  INVALID_CHARS: ['.', '#', '$', '[', ']'],
  LOCAL_IMAGE_PREFIX: 'file://',
  MAX_ALLOWED_UNITS: 99,
  MONTHS: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  MONTHS_ABBREVIATED: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  NAVIGATION: {
    TYPE: {
      FORCED_UP: 'FORCED_UP',
      UP: 'UP',
    },
    ACTION_TYPE: {
      REPLACE: 'REPLACE',
      PUSH: 'PUSH',
      NAVIGATE: 'NAVIGATE',
    },
  },
  NO_IMAGE: 'NO_IMAGE', // Used for the profile avatar when there is no image
  REGEX: {
    ROUTES: {
      REDUNDANT_SLASHES: /(\/{2,})|(\/$)/g,
    },
    // DATE_TIME_FORMAT: /^\d{2}-\d{2} \d{2}:\d{2} [AP]M$/,
  },
  SOCIALS: {
    TWITTER: '',
    INSTAGRAM: '',
    FACEBOOK: '',
    LINKEDIN: '',
  },
  STATUS_BAR_STYLE: {
    LIGHT_CONTENT: 'light-content',
    DARK_CONTENT: 'dark-content',
  },
  STORE_LINKS: {
    ANDROID:
      'https://play.google.com/store/apps/details?id=com.alcohol_tracker',
    IOS: 'https://testflight.apple.com/join/DgY9IieL',
  },
  THEME: {
    DEFAULT: 'system',
    FALLBACK: 'dark',
    DARK: 'dark',
    LIGHT: 'light',
    SYSTEM: 'system',
  },
  TIME_PERIOD: {
    AM: 'AM',
    PM: 'PM',
  },
  UNITS: {
    // Perhaps move to types?
    KEYS: {
      SMALL_BEER: 'small_beer',
      BEER: 'beer',
      COCKTAIL: 'cocktail',
      OTHER: 'other',
      STRONG_SHOT: 'strong_shot',
      WEAK_SHOT: 'weak_shot',
      WINE: 'wine',
    },
    NAMES: {
      SMALL_BEER: 'Small Beer',
      BEER: 'Beer',
      COCKTAIL: 'Cocktail',
      OTHER: 'Other',
      STRONG_SHOT: 'Strong Shot',
      WEAK_SHOT: 'Weak Shot',
      WINE: 'Wine',
    },
  },
} as const;

export default CONST;
