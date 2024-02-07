import {ImageSourcePropType} from 'react-native';
import {
  DrinkingSessionArrayItem,
  DrinkingSessionData,
  FeedbackData,
  PreferencesData,
  UnitTypesKeys,
  UnitsObject,
  UserData,
} from './database';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppStackParamList} from './screens';
import {Calendar} from 'react-native-calendars';
import {GeneralAction} from './states';

// FeedbackPopup props

export type FeedbackPopupProps = {
  visible: boolean;
  transparent: boolean;
  message: string;
  onRequestClose: () => void;
  onSubmit: (feedback: string) => void;
};

// YesNo popup props

export type YesNoPopupProps = {
  visible: boolean;
  transparent: boolean;
  message: string;
  onRequestClose: () => void;
  onYes: () => void;
};

// MainMenu popup props

export type MainMenuPopupProps = {
  visible: boolean;
  transparent: boolean;
  onRequestClose: () => void;
  navigation: StackNavigationProp<AppStackParamList, 'Main Screen'>;
  userData: UserData;
};

export type MainMenuButtonData = {
  label: string;
  icon: number;
  action: () => void;
};

export type MainMenuItemProps = {
  heading: string;
  data: MainMenuButtonData[];
  index: number;
};

// AdminFeedbackModal props
export type AdminFeedbackPopupProps = {
  visible: boolean;
  transparent: boolean;
  onRequestClose: () => void;
  feedbackData: FeedbackData;
};

export type DateObject = {
  dateString: string;
  day: number;
  month: number;
  timestamp: number;
  year: number;
};

export type DayMarking = {
  units?: number;
  color?: CalendarColors;
  textColor?: string;
};

export type CalendarColors = 'yellow' | 'red' | 'orange' | 'black' | 'green';

export type DayState = 'selected' | 'disabled' | 'today' | '';

// Various unit window props

export type DrinkDataProps = {
  key: (typeof UnitTypesKeys)[number];
  icon: ImageSourcePropType;
  typeSum: number;
  setTypeSum: React.Dispatch<React.SetStateAction<number>>;
}[];

export type UnitTypesViewProps = {
  drinkData: DrinkDataProps;
  currentUnits: UnitsObject;
  setCurrentUnits: React.Dispatch<React.SetStateAction<UnitsObject>>;
  availableUnits: number;
};

export type DrinkingSessionUnitWindowProps = {
  unitKey: (typeof UnitTypesKeys)[number]; // Non-verbose
  iconSource: ImageSourcePropType;
  currentUnits: UnitsObject;
  setCurrentUnits: React.Dispatch<React.SetStateAction<UnitsObject>>;
  availableUnits: number;
  typeSum: number;
  setTypeSum: React.Dispatch<React.SetStateAction<number>>;
};

export type SessionUnitsInputWindowProps = {
  unitKey: (typeof UnitTypesKeys)[number];
  currentUnits: UnitsObject;
  setCurrentUnits: (newUnits: UnitsObject) => void;
  availableUnits: number;
  typeSum: number;
  setTypeSum: React.Dispatch<React.SetStateAction<number>>;
  styles: {
    unitsInputContainer: {};
    unitsInputButton: {};
    unitsInputText: {};
  };
};

// Upload image

export interface UploadImageState {
  imageSource: string | null;
  uploadModalVisible: boolean;
  uploadOngoing: boolean;
  uploadProgress: string | null;
  warning: string;
  success: string;
}

export type UploadImagePopupProps = {
  imageSource: string;
  visible: boolean;
  transparent: boolean;
  message: string;
  onRequestClose: () => void;
  onSubmit: () => Promise<void>;
  parentState: UploadImageState;
  parentDispatch: React.Dispatch<GeneralAction>;
};
