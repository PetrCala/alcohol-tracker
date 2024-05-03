import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {
  OpenPublicProfilePageParams,
  UpdateAutomaticTimezoneParams,
  UpdateDateOfBirthParams,
  UpdateDisplayNameParams,
  UpdateHomeAddressParams,
  UpdateLegalNameParams,
  UpdatePronounsParams,
  UpdateSelectedTimezoneParams,
  UpdateUserAvatarParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
// import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as UserUtils from '@libs/UserUtils';
import type {Country} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {DateOfBirthForm} from '@src/types/form';
import type {
  PersonalDetails,
  PersonalDetailsList,
  UserID,
} from '@src/types/onyx';
import type {SelectedTimezone, Timezone} from '@src/types/onyx/PersonalDetails';
import * as Session from './Session';

let currentUserEmail = '';
let currentUserID = '';
Onyx.connect({
  key: ONYXKEYS.SESSION,
  callback: val => {
    currentUserEmail = val?.email ?? '';
    currentUserID = val?.userID ?? '';
  },
});

let allPersonalDetails: OnyxEntry<PersonalDetailsList> = null;
Onyx.connect({
  key: ONYXKEYS.PERSONAL_DETAILS_LIST,
  callback: val => (allPersonalDetails = val),
});

function updatePronouns(pronouns: string) {
  if (!currentUserID) {
    return;
  }

  const parameters: UpdatePronounsParams = {pronouns};

  API.write(WRITE_COMMANDS.UPDATE_PRONOUNS, parameters, {
    optimisticData: [
      {
        onyxMethod: Onyx.METHOD.MERGE,
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        value: {
          [currentUserID]: {
            pronouns,
          },
        },
      },
    ],
  });
}

function updateDisplayName(firstName: string, lastName: string) {
  if (!currentUserID) {
    return;
  }

  const parameters: UpdateDisplayNameParams = {firstName, lastName};

  API.write(WRITE_COMMANDS.UPDATE_DISPLAY_NAME, parameters, {
    optimisticData: [
      {
        onyxMethod: Onyx.METHOD.MERGE,
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        value: {
          [currentUserID]: {
            firstName,
            lastName,
            displayName: PersonalDetailsUtils.createDisplayName(
              currentUserEmail ?? '',
              {
                firstName,
                lastName,
              },
            ),
          },
        },
      },
    ],
  });
}

function updateLegalName(legalFirstName: string, legalLastName: string) {
  const parameters: UpdateLegalNameParams = {legalFirstName, legalLastName};

  API.write(WRITE_COMMANDS.UPDATE_LEGAL_NAME, parameters, {
    optimisticData: [
      {
        onyxMethod: Onyx.METHOD.MERGE,
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
        value: {
          legalFirstName,
          legalLastName,
        },
      },
    ],
  });

  Navigation.goBack();
}

/**
 * @param dob - date of birth
 */
function updateDateOfBirth({dob}: DateOfBirthForm) {
  const parameters: UpdateDateOfBirthParams = {dob};

  API.write(WRITE_COMMANDS.UPDATE_DATE_OF_BIRTH, parameters, {
    optimisticData: [
      {
        onyxMethod: Onyx.METHOD.MERGE,
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
        value: {
          dob,
        },
      },
    ],
  });

  Navigation.goBack();
}

function updateAddress(
  street: string,
  street2: string,
  city: string,
  state: string,
  zip: string,
  country: Country | '',
) {
  const parameters: UpdateHomeAddressParams = {
    homeAddressStreet: street,
    addressStreet2: street2,
    homeAddressCity: city,
    addressState: state,
    addressZipCode: zip,
    addressCountry: country,
  };

  // State names for the United States are in the form of two-letter ISO codes
  // State names for other countries except US have full names, so we provide two different params to be handled by server
  if (country !== CONST.COUNTRY.US) {
    parameters.addressStateLong = state;
  }

  API.write(WRITE_COMMANDS.UPDATE_HOME_ADDRESS, parameters, {
    optimisticData: [
      {
        onyxMethod: Onyx.METHOD.MERGE,
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
        value: {
          address: {
            street: PersonalDetailsUtils.getFormattedStreet(street, street2),
            city,
            state,
            zip,
            country,
          },
        },
      },
    ],
  });

  Navigation.goBack();
}

/**
 * Updates timezone's 'automatic' setting, and updates
 * selected timezone if set to automatically update.
 */
function updateAutomaticTimezone(timezone: Timezone) {
  // TODO enable this
  // if (Session.isAnonymousUser()) {
  //   return;
  // }

  if (!currentUserID) {
    return;
  }

  const formatedTimezone = DateUtils.formatToSupportedTimezone(timezone);
  const parameters: UpdateAutomaticTimezoneParams = {
    timezone: JSON.stringify(formatedTimezone),
  };

  API.write(WRITE_COMMANDS.UPDATE_AUTOMATIC_TIMEZONE, parameters, {
    optimisticData: [
      {
        onyxMethod: Onyx.METHOD.MERGE,
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        value: {
          [currentUserID]: {
            timezone: formatedTimezone,
          },
        },
      },
    ],
  });
}

/**
 * Updates user's 'selected' timezone, then navigates to the
 * initial Timezone page.
 */
function updateSelectedTimezone(selectedTimezone: SelectedTimezone) {
  const timezone: Timezone = {
    selected: selectedTimezone,
  };

  const parameters: UpdateSelectedTimezoneParams = {
    timezone: JSON.stringify(timezone),
  };

  if (currentUserID) {
    API.write(WRITE_COMMANDS.UPDATE_SELECTED_TIMEZONE, parameters, {
      optimisticData: [
        {
          onyxMethod: Onyx.METHOD.MERGE,
          key: ONYXKEYS.PERSONAL_DETAILS_LIST,
          value: {
            [currentUserID]: {
              timezone,
            },
          },
        },
      ],
    });
  }

  //   Navigation.goBack(ROUTES.SETTINGS_TIMEZONE); // TODO uncomment this
  Navigation.goBack(ROUTES.HOME);
}

/**
 * Fetches public profile info about a given user.
 * The API will only return the userID, displayName, and avatar for the user
 * but the profile page will use other info (e.g. contact methods and pronouns) if they are already available in Onyx
 */
function openPublicProfilePage(userID: UserID) {
  const optimisticData: OnyxUpdate[] = [
    {
      onyxMethod: Onyx.METHOD.MERGE,
      key: ONYXKEYS.PERSONAL_DETAILS_METADATA,
      value: {
        [userID]: {
          isLoading: true,
        },
      },
    },
  ];

  const successData: OnyxUpdate[] = [
    {
      onyxMethod: Onyx.METHOD.MERGE,
      key: ONYXKEYS.PERSONAL_DETAILS_METADATA,
      value: {
        [userID]: {
          isLoading: false,
        },
      },
    },
  ];

  const failureData: OnyxUpdate[] = [
    {
      onyxMethod: Onyx.METHOD.MERGE,
      key: ONYXKEYS.PERSONAL_DETAILS_METADATA,
      value: {
        [userID]: {
          isLoading: false,
        },
      },
    },
  ];

  const parameters: OpenPublicProfilePageParams = {userID};

  API.read(READ_COMMANDS.OPEN_PUBLIC_PROFILE_PAGE, parameters, {
    optimisticData,
    successData,
    failureData,
  });
}

/**
 * Updates the user's avatar image
 */
// function updateAvatar(file: File | CustomRNImageManipulatorResult) { // TODO uncomment this
function updateAvatar(file: File | any) {
  if (!currentUserID) {
    return;
  }

  const optimisticData: OnyxUpdate[] = [
    {
      onyxMethod: Onyx.METHOD.MERGE,
      key: ONYXKEYS.PERSONAL_DETAILS_LIST,
      value: {
        [currentUserID]: {
          avatar: file.uri,
          avatarThumbnail: file.uri,
          originalFileName: file.name,
          errorFields: {
            avatar: null,
          },
          pendingFields: {
            avatar: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            originalFileName: null,
          },
          fallbackIcon: file.uri,
        },
      },
    },
  ];
  const successData: OnyxUpdate[] = [
    {
      onyxMethod: Onyx.METHOD.MERGE,
      key: ONYXKEYS.PERSONAL_DETAILS_LIST,
      value: {
        [currentUserID]: {
          pendingFields: {
            avatar: null,
          },
        },
      },
    },
  ];
  const failureData: OnyxUpdate[] = [
    {
      onyxMethod: Onyx.METHOD.MERGE,
      key: ONYXKEYS.PERSONAL_DETAILS_LIST,
      value: {
        [currentUserID]: {
          avatar: allPersonalDetails?.[currentUserID]?.avatar,
          avatarThumbnail:
            allPersonalDetails?.[currentUserID]?.avatarThumbnail ??
            allPersonalDetails?.[currentUserID]?.avatar,
          pendingFields: {
            avatar: null,
          },
        } as OnyxEntry<Partial<PersonalDetails>>,
      },
    },
  ];

  const parameters: UpdateUserAvatarParams = {file};

  API.write(WRITE_COMMANDS.UPDATE_USER_AVATAR, parameters, {
    optimisticData,
    successData,
    failureData,
  });
}

/**
 * Replaces the user's avatar image with a default avatar
 */
function deleteAvatar() {
  if (!currentUserID) {
    return;
  }

  // We want to use the old dot avatar here as this affects both platforms.
  const defaultAvatar = UserUtils.getDefaultAvatarURL(currentUserID);

  const optimisticData: OnyxUpdate[] = [
    {
      onyxMethod: Onyx.METHOD.MERGE,
      key: ONYXKEYS.PERSONAL_DETAILS_LIST,
      value: {
        [currentUserID]: {
          avatar: defaultAvatar,
          fallbackIcon: null,
        },
      },
    },
  ];
  const failureData: OnyxUpdate[] = [
    {
      onyxMethod: Onyx.METHOD.MERGE,
      key: ONYXKEYS.PERSONAL_DETAILS_LIST,
      value: {
        [currentUserID]: {
          avatar: allPersonalDetails?.[currentUserID]?.avatar,
          fallbackIcon: allPersonalDetails?.[currentUserID]?.fallbackIcon,
        },
      },
    },
  ];

  API.write(
    WRITE_COMMANDS.DELETE_USER_AVATAR,
    {},
    {optimisticData, failureData},
  );
}

/**
 * Clear error and pending fields for the current user's avatar
 */
function clearAvatarErrors() {
  if (!currentUserID) {
    return;
  }

  Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
    [currentUserID]: {
      errorFields: {
        avatar: null,
      },
      pendingFields: {
        avatar: null,
      },
    },
  });
}

export {
  clearAvatarErrors,
  deleteAvatar,
  openPublicProfilePage,
  updateAddress,
  updateAutomaticTimezone,
  updateAvatar,
  updateDateOfBirth,
  updateDisplayName,
  updateLegalName,
  updatePronouns,
  updateSelectedTimezone,
};
