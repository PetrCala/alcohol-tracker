import Str from '@libs/common/str';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
// import {parsePhoneNumber} from './PhoneNumber';

// let countryCodeByIP: number;
// Onyx.connect({
//   key: ONYXKEYS.COUNTRY_CODE,
//   callback: val => (countryCodeByIP = val ?? 1),
// });

// /**
//  * Remove the special chars from the phone number
//  */
// function getPhoneNumberWithoutSpecialChars(phone: string): string {
//   return phone.replace(CONST.REGEX.SPECIAL_CHARS_WITHOUT_NEWLINE, '');
// }

// /**
//  * Append user country code to the phone number
//  */
// function appendCountryCode(phone: string): string {
//   return phone.startsWith('+') ? phone : `+${countryCodeByIP}${phone}`;
// }

// /**
//  * Check if number is valid
//  * @returns a valid phone number formatted
//  */
// function validateNumber(values: string): string {
//   const parsedPhoneNumber = parsePhoneNumber(values);

//   if (parsedPhoneNumber.possible && Str.isValidE164Phone(values.slice(0))) {
//     return `${parsedPhoneNumber.number?.e164}${CONST.SMS.DOMAIN}`;
//   }

//   return '';
// }

// /**
//  * Check number is valid and attach country code
//  * @returns a valid phone number with country code
//  */
// function getPhoneLogin(partnerUserID: string): string {
//   if (partnerUserID.length === 0) {
//     return '';
//   }

//   return appendCountryCode(getPhoneNumberWithoutSpecialChars(partnerUserID));
// }

export //   getPhoneNumberWithoutSpecialChars,
//   appendCountryCode,
//   validateNumber,
//   getPhoneLogin,
 {};
