// Sourced from FloatingActionButtonAndPopover.tsx - see that file for more functionality
import {useIsFocused} from '@react-navigation/native';
import type {ForwardedRef} from 'react';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx, {useOnyx} from 'react-native-onyx';
import * as DSUtils from '@libs/DrinkingSessionUtils';
import * as DS from '@userActions/DrinkingSession';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as Utils from '@libs/Utils';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {DrinkingSessionType} from '@src/types/onyx';
import Log from '@libs/common/Log';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import {useFirebase} from '@context/global/FirebaseContext';
import _ from 'lodash';
import Text from './Text';
import PopoverMenu from './PopoverMenu';
import type {PopoverMenuItem} from './PopoverMenu';
import FloatingActionButton from './FloatingActionButton';
import ConfirmModal from './ConfirmModal';

// Utils

// To navigate with a delay
// setTimeout(() => {
//   Navigation.navigate(ROUTES.TRACK_TRAINING_MODAL);
// }, CONST.ANIMATED_TRANSITION);

type StartSessionButtonAndPopoverProps = {
  /* Callback function when the menu is shown */
  onShowCreateMenu?: () => void;

  /* Callback function before the menu is hidden */
  onHideCreateMenu?: () => void;
};

type StartSessionButtonAndPopoverRef = {
  hideCreateMenu: () => void;
};
/**
 * Responsible for rendering the {@link PopoverMenu}, and the accompanying
 * FAB that can open or close the menu.
 */
function StartSessionButtonAndPopover(
  {onHideCreateMenu, onShowCreateMenu}: StartSessionButtonAndPopoverProps,
  ref: ForwardedRef<StartSessionButtonAndPopoverRef>,
) {
  const styles = useThemeStyles();
  const {auth, db} = useFirebase();
  const {translate} = useLocalize();
  const user = auth.currentUser;
  const [isVisible, setIsVisible] = useState(false);
  const {userData, userStatusData} = useDatabaseData();
  const [ongoingSessionData] = useOnyx(ONYXKEYS.ONGOING_SESSION_DATA);
  const [startSession] = useOnyx(ONYXKEYS.START_SESSION_GLOBAL_CREATE);
  const [loadingText] = useOnyx(ONYXKEYS.APP_LOADING_TEXT);
  const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  const {windowHeight} = useWindowDimensions();
  const {shouldUseNarrowLayout} = useResponsiveLayout();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const {environment} = useEnvironment();

  const startLiveDrinkingSession = async (): Promise<void> => {
    try {
      await Utils.setLoadingText(translate('liveSessionScreen.loading'));
      // TODO start only if user is not already in a session - otherwise use ongoing session data to navigate
      await DS.startLiveDrinkingSession(db, user, userData?.timezone?.selected);
      DS.navigateToOngoingSessionScreen();
    } catch (error: unknown) {
      ErrorUtils.raiseAlert(error, translate('homeScreen.error.title'));
    }
  };

  const renderSessionTypeTooltip = useCallback(
    () => (
      <Text>
        {/* TODO */}
        {/* <Text style={styles.sessionTypeTooltipTitle}>{translate('sessionType.tooltip.title')}</Text>
            <Text style={styles.sessionTypeTooltipSubtitle}>{translate('sessionType.tooltip.subtitle')}</Text> */}
        <Text style={styles.sessionTypeTooltipTitle}>A tooltip!</Text>
        <Text style={styles.sessionTypeTooltipSubtitle}>
          A tooltip subtitle
        </Text>
      </Text>
    ),
    [
      styles.sessionTypeTooltipTitle,
      styles.sessionTypeTooltipSubtitle,
      translate,
    ],
  );

  const selectOption = async (
    onSelected: () => Promise<void>,
    shouldRestrictAction?: boolean,
  ): Promise<void> => {
    if (shouldRestrictAction) {
      Log.warn("This is a restricted action. You can't do this.");
      // Navigation.navigate(
      //   ROUTES.RESTRICTED_ACTION.getRoute(someSessionId),
      // );
      return;
    }
    await onSelected();
  };

  const navigateToSessionType = useCallback(
    async (sessionType: DrinkingSessionType) => {
      // const sessionID = DSUtils.generateSessionID();

      switch (sessionType) {
        case CONST.SESSION_TYPES.LIVE:
          await selectOption(() => startLiveDrinkingSession());
          break;
        case CONST.SESSION_TYPES.EDIT:
          await selectOption(
            async () => {}, // Edit a session
          );
          break;
        default:
          Log.warn(`Unsupported session type: ${startSession?.sessionType}`);
      }
    },
    [startSession?.sessionType, selectOption],
  );

  /**
   * Check if LHN status changed from active to inactive.
   * Used to close already opened FAB menu when open any other pages (i.e. Press Command + K on web).
   */
  const didScreenBecomeInactive = useCallback(
    (): boolean =>
      // When any other page is opened over LHN
      !isFocused && prevIsFocused,
    [isFocused, prevIsFocused],
  );

  /**
   * Method called when we click the floating action button
   */
  const showCreateMenu = useCallback(
    () => {
      if (!isFocused && shouldUseNarrowLayout) {
        return;
      }
      setIsCreateMenuActive(true);
      onShowCreateMenu?.();
    },
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    [isFocused, shouldUseNarrowLayout],
  );

  /**
   * Method called either when:
   * - Pressing the floating action button to open the CreateMenu modal
   * - Selecting an item on CreateMenu or closing it by clicking outside of the modal component
   */
  const hideCreateMenu = useCallback(
    () => {
      if (!isCreateMenuActive) {
        return;
      }
      setIsCreateMenuActive(false);
      onHideCreateMenu?.();
    },
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    [isCreateMenuActive],
  );

  useEffect(() => {
    if (!didScreenBecomeInactive()) {
      return;
    }

    // Hide menu manually when other pages are opened using shortcut key
    hideCreateMenu();
  }, [didScreenBecomeInactive, hideCreateMenu]);

  useImperativeHandle(ref, () => ({
    hideCreateMenu() {
      hideCreateMenu();
    },
  }));

  const toggleCreateMenu = () => {
    if (isCreateMenuActive) {
      hideCreateMenu();
    } else {
      showCreateMenu();
    }
  };

  const sessionTypeMenuItems: PopoverMenuItem[] = useMemo(() => {
    // Define common properties in baseSessionType
    const baseSessionType = {
      label: translate('startSession.header'),
      isLabelHoverable: false,
      numberOfLinesDescription: 2,
      tooltipAnchorAlignment: {
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
      },
      tooltipShiftHorizontal: styles.popoverMenuItem.paddingHorizontal,
      tooltipShiftVertical: styles.popoverMenuItem.paddingVertical / 2,
      renderTooltipContent: renderSessionTypeTooltip,
      tooltipWrapperStyle: styles.sessionTypeTooltipWrapper,
    };

    const sessionTypes: DrinkingSessionType[] = Object.values(
      CONST.SESSION_TYPES,
    );

    return _.map(sessionTypes, (sessionType, index) => {
      return {
        ...baseSessionType,
        label: index === 0 ? translate('startSession.header') : undefined,
        icon: DSUtils.getIconForSession(sessionType),
        text: translate(DSUtils.getSessionTypeTitle(sessionType)),
        description: translate(DSUtils.getSessionTypeDescription(sessionType)),
        onSelected: async () => {
          await navigateToSessionType(sessionType);
          hideCreateMenu();
        },
        shouldRenderTooltip: false, // TODO
        // shouldRenderTooltip: startSession.isFirstSession,
      };
    });
  }, [
    translate,
    styles.popoverMenuItem.paddingHorizontal,
    styles.popoverMenuItem.paddingVertical,
    styles.sessionTypeTooltipWrapper,
    DSUtils.getSessionTypeTitle,
    DSUtils.getSessionTypeDescription,
    DSUtils.getIconForSession,
    renderSessionTypeTooltip,
    startSession?.sessionType,
    navigateToSessionType,
    selectOption,
  ]);

  useEffect(() => {
    if (userStatusData) {
      Onyx.set(
        ONYXKEYS.ONGOING_SESSION_DATA,
        userStatusData?.latest_session?.ongoing
          ? userStatusData?.latest_session
          : null,
      );
    }
  }, [userStatusData]);

  useEffect(() => {
    setIsVisible(!loadingText && !ongoingSessionData?.ongoing);
  }, [ongoingSessionData?.ongoing, loadingText]);

  return (
    <View style={[styles.flexShrink1, styles.ph2]}>
      <PopoverMenu
        onClose={hideCreateMenu}
        isVisible={isCreateMenuActive && (!shouldUseNarrowLayout || isFocused)}
        anchorPosition={styles.createMenuPositionSidebar(windowHeight)}
        onItemSelected={hideCreateMenu}
        fromSidebarMediumScreen={!shouldUseNarrowLayout}
        menuItems={[
          // icon, text, onSelected
          // ...(condition ? [{icon: ..., ...}] : []) // to add items conditionally
          ...sessionTypeMenuItems,
        ]}
        withoutOverlay
        anchorRef={fabRef}
      />
      <FloatingActionButton
        accessibilityLabel={translate('startSession.newSessionExplained')}
        role={CONST.ROLE.BUTTON}
        isActive={isCreateMenuActive}
        ref={fabRef}
        onPress={toggleCreateMenu}
      />
    </View>
  );
}

StartSessionButtonAndPopover.displayName = 'StartSessionButtonAndPopover';

export default forwardRef(StartSessionButtonAndPopover);
