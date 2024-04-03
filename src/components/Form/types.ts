import type {
  ComponentType,
  FocusEvent,
  Key,
  MutableRefObject,
  ReactNode,
  Ref,
} from 'react';
import type {
  GestureResponderEvent,
  NativeSyntheticEvent,
  StyleProp,
  TextInputFocusEventData,
  TextInputSubmitEditingEventData,
  ViewStyle,
} from 'react-native';
import type {ValueOf} from 'type-fest';
// import type AddressSearch from '@components/AddressSearch';
// import type AmountForm from '@components/AmountForm';
import type AmountTextInput from '@components/AmountTextInput';
// import type CheckboxWithLabel from '@components/CheckboxWithLabel';
// import type CountrySelector from '@components/CountrySelector';
// import type Picker from '@components/Picker';
// import type SingleChoiceQuestion from '@components/SingleChoiceQuestion';
// import type StatePicker from '@components/StatePicker';
import type TextInput from '@components/TextInput';
// import type BusinessTypePicker from '@pages/ReimbursementAccount/BusinessInfo/substeps/TypeBusiness/BusinessTypePicker';
import type {TranslationPaths} from '@src/languages/types';
import type {DatabaseFormKey, DatabaseValues} from '@src/ONYXKEYS';
import type {BaseForm} from '@src/types/form/Form';

/**
 * This type specifies all the inputs that can be used with `InputWrapper` component. Make sure to update it
 * when adding new inputs or removing old ones.
 *
 * TODO: Add remaining inputs here once these components are migrated to Typescript:
 * EmojiPickerButtonDropdown | RoomNameInput | ValuePicker
 */
type ValidInputs = any;
// typeof TextInput
//   | typeof AmountTextInput;
//   | typeof SingleChoiceQuestion
//   | typeof CheckboxWithLabel
//   | typeof Picker
//   | typeof AddressSearch
//   | typeof CountrySelector
//   | typeof AmountForm
//   | typeof BusinessTypePicker
//   | typeof StatePicker;

type ValueTypeKey = 'string' | 'boolean' | 'date';
type ValueTypeMap = {
  string: string;
  boolean: boolean;
  date: Date;
};
type FormValue = ValueOf<ValueTypeMap>;

type InputComponentValueProps<TValue extends ValueTypeKey = ValueTypeKey> = {
  valueType?: TValue;
  value?: ValueTypeMap[TValue];
  defaultValue?: ValueTypeMap[TValue];
  onValueChange?: (value: ValueTypeMap[TValue], key: string) => void;
  shouldSaveDraft?: boolean;
  shouldUseDefaultValue?: boolean;
};

type MeasureLayoutOnSuccessCallback = (
  left: number,
  top: number,
  width: number,
  height: number,
) => void;
type InputComponentBaseProps<TValue extends ValueTypeKey = ValueTypeKey> =
  InputComponentValueProps<TValue> & {
    InputComponent: ComponentType;
    inputID: string;
    errorText?: string;
    shouldSetTouchedOnBlurOnly?: boolean;
    isFocused?: boolean;
    measureLayout?: (
      ref: unknown,
      callback: MeasureLayoutOnSuccessCallback,
    ) => void;
    focus?: () => void;
    onTouched?: (event: GestureResponderEvent) => void;
    onBlur?: (
      event: FocusEvent | NativeSyntheticEvent<TextInputFocusEventData>,
    ) => void;
    onPressOut?: (event: GestureResponderEvent) => void;
    onPress?: (event: GestureResponderEvent) => void;
    onInputChange?: (value: FormValue, key: string) => void;
    onSubmitEditing?: (
      event: NativeSyntheticEvent<TextInputSubmitEditingEventData>,
    ) => void;
    key?: Key;
    ref?: Ref<unknown>;
    multiline?: boolean;
    autoGrowHeight?: boolean;
    blurOnSubmit?: boolean;
    shouldSubmitForm?: boolean;
  };

type FormDatabaseValues<TFormID extends DatabaseFormKey = DatabaseFormKey> =
  Omit<DatabaseValues[TFormID], keyof BaseForm>;
type FormDatabaseKeys<TFormID extends DatabaseFormKey = DatabaseFormKey> =
  keyof FormDatabaseValues<TFormID>;

type FormProps<TFormID extends DatabaseFormKey = DatabaseFormKey> = {
  /** A unique Database key identifying the form */
  formID: TFormID;

  /** Text to be displayed in the submit button */
  submitButtonText: string;

  /** Submit button styles */
  submitButtonStyles?: StyleProp<ViewStyle>;

  /** Controls the submit button's visibility */
  isSubmitButtonVisible?: boolean;

  /** Callback to submit the form */
  onSubmit: (values: FormDatabaseValues<TFormID>) => void;

  /** Should the button be enabled when offline */
  enabledWhenOffline?: boolean;

  /** Whether the form submit action is dangerous */
  isSubmitActionDangerous?: boolean;

  /** Should fix the errors alert be displayed when there is an error in the form */
  shouldHideFixErrorsAlert?: boolean;

  /** Whether ScrollWithContext should be used instead of regular ScrollView. Set to true when there's a nested Picker component in Form. */
  scrollContextEnabled?: boolean;

  /** Container styles */
  style?: StyleProp<ViewStyle>;

  /** Custom content to display in the footer after submit button */
  footerContent?: ReactNode;

  /** Disable press on enter for submit button */
  disablePressOnEnter?: boolean;
};

type InputRefs = Record<string, MutableRefObject<InputComponentBaseProps>>;

type FormInputErrors<TFormID extends DatabaseFormKey = DatabaseFormKey> =
  Partial<Record<FormDatabaseKeys<TFormID>, TranslationPaths>>;

export type {
  FormProps,
  ValidInputs,
  InputComponentValueProps,
  FormValue,
  ValueTypeKey,
  FormDatabaseValues,
  FormDatabaseKeys,
  FormInputErrors,
  InputRefs,
  InputComponentBaseProps,
  ValueTypeMap,
};
