/* eslint-disable no-control-regex */
import _ from 'underscore';

const Str = {
  /**
   * A simple GUID generator taken from https://stackoverflow.com/a/32760401/9114791
   *
   * @param {String} [prefix] an optional prefix to put in front of the guid
   * @returns {String}
   */
  guid(prefix = '') {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return `${prefix}${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  },

  /**
   * Modifies the string so the first letter of the string is capitalized
   *
   * @param {String} str The string to modify.
   * @return {String} The recapitalized string.
   */
  UCFirst(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
  },
};

export default Str;
