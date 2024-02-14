/* eslint-disable @typescript-eslint/naming-convention */
import {LinkingOptions, getStateFromPath} from '@react-navigation/native';
import type {RootStackParamList} from '@navigation/types';
import config from './config';
import customGetPathFromState from './customGetPathFromState';

const linkingConfig: LinkingOptions<RootStackParamList> = {
  getStateFromPath: (...args) => getStateFromPath(...args), // can use getAdaptedStateFromPath if necessary for custom implementation (advanced)
  getPathFromState: customGetPathFromState,
  prefixes: ['app://-/'],
  config,
};

export default linkingConfig;
