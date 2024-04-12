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

  /**
   * Extracts the domain name from the given email address
   * (e.g. "domain.com" for "joe@domain.com").
   *
   * @param {String} email The email address.
   *
   * @returns {String} The domain name in the email address.
   */
  extractEmailDomain(email) {
    return this.cutBefore(email, '@');
  },

  /**
   * Returns the proper phrase depending on the count that is passed.
   * Example:
   * console.log(Str.pluralize('puppy', 'puppies', 1)); // puppy
   * console.log(Str.pluralize('puppy', 'puppies', 3)); // puppies
   *
   * @param {String} singular form of the phrase
   * @param {String} plural form of the phrase
   * @param {Number} n the count which determines the plurality
   *
   * @return {String}
   */
  pluralize(singular, plural, n) {
    if (!n || n > 1) {
      return plural;
    }
    return singular;
  },
};

export default Str;
