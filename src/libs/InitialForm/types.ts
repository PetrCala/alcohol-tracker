type InitialFormProps = {
  /** Function used to scroll to the top of the page */
  scrollPageToTop?: () => void;
};

type InputHandle = {
  isInputFocused: () => boolean;
  clearDataAndFocus: (clearLogin?: boolean) => void;
};

export type {InputHandle};

export default InitialFormProps;
