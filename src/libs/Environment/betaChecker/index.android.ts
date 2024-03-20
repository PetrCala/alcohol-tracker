import type IsBetaBuild from './types';

/**
 * Check the GitHub releases to see if the current build is a beta build or production build
 */
function isBetaBuild(): IsBetaBuild {
  return new Promise(resolve => {
    true;
  });
}

export default {
  isBetaBuild,
};
