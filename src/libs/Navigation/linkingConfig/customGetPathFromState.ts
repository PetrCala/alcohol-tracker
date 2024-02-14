import {getPathFromState} from '@react-navigation/native';

const customGetPathFromState: typeof getPathFromState = (state, options) => {
  // If necessary, define a custom getPathFromState function here.
  return getPathFromState(state, options);
};

export default customGetPathFromState;
