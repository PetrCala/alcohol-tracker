// Sourced from FloatingActionButtonAndPopover.tsx - see that file for more functionality
import {useIsFocused} from '@react-navigation/native';
import type {ImageContentFit} from 'expo-image';
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
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
// import FloatingActionButton from '@components/FloatingActionButton';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';
import Text from '@components/Text';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import getIconForAction from '@libs/getIconForSession';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {DrinkingSessionType} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import getIconForSession from '@libs/getIconForSession';
import Log from '@libs/common/Log';

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
const getSessionTypeTitle = (
  sessionType: DrinkingSessionType,
): TranslationPaths => {
  switch (sessionType) {
    case CONST.SESSION_TYPES.LIVE:
      return 'drinkingSession.type.live';
    case CONST.SESSION_TYPES.EDIT:
      return 'drinkingSession.type.edit';
    default:
      return '' as TranslationPaths;
  }
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
  const theme = useTheme();
  const {translate} = useLocalize();
  const [isLoading = false] = useOnyx(ONYXKEYS.IS_LOADING_APP);
  const [startSession] = useOnyx(ONYXKEYS.START_SESSION_GLOBAL_CREATE);

  //KIROKU
  // const ongoingSessionId = useOnyx(ONYXKEYS.ONGOING_SESSION_ID)

  const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  const {windowHeight} = useWindowDimensions();
  const {shouldUseNarrowLayout} = useResponsiveLayout();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);
  const {isOffline} = useNetwork();

  const {environment} = useEnvironment();

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

  const sessionTypeTitle = useMemo(() => {
    const titleKey = getSessionTypeTitle(
      startSession?.sessionType ?? ('' as DrinkingSessionType),
    );
    return titleKey ? translate(titleKey) : '';
  }, [startSession?.sessionType, translate]);

  const selectOption = useCallback(
    (onSelected: () => void, shouldRestrictAction?: boolean) => {
      if (shouldRestrictAction) {
        Log.warn("This is a restricted action. You can't do this.");
        // Navigation.navigate(
        //   ROUTES.RESTRICTED_ACTION.getRoute(someSessionId),
        // );
        return;
      }
      onSelected();
    },
    [], // someSessionId
  );

  const navigateToSessionType = useCallback(() => {
    // const sessionID = DSUtils.generateSessionID();

    switch (startSession?.sessionType) {
      case CONST.SESSION_TYPES.LIVE:
        selectOption(
          () => {}, // Start a live session
          // {}
          // IOU.startMoneyRequest(
          //   CONST.IOU.TYPE.SUBMIT,
          //   sessionTypeReportID,
          //   undefined,
          //   true,
          // ),
        );
        return;
      case CONST.SESSION_TYPES.EDIT:
        selectOption(
          () => {}, // Edit a session
        );
        return;
      default:
    }
  }, [startSession?.sessionType, selectOption]);

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

  const sessionTypeMenuItems = useMemo(() => {
    // Define common properties in baseSessionType
    const baseSessionType = {
      label: translate('startSession.header'),
      isLabelHoverable: false,
      numberOfLinesDescription: 1,
      tooltipAnchorAlignment: {
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
      },
      tooltipShiftHorizontal: styles.popoverMenuItem.paddingHorizontal,
      tooltipShiftVertical: styles.popoverMenuItem.paddingVertical / 2,
      renderTooltipContent: renderSessionTypeTooltip,
      tooltipWrapperStyle: styles.sessionTypeTooltipWrapper,
    };

    if (startSession?.sessionType) {
      return [
        {
          ...baseSessionType,
          icon: getIconForSession(startSession.sessionType),
          text: sessionTypeTitle,
          description: 'A custom description', // TODO add a description here
          onSelected: () => navigateToSessionType(),
          shouldRenderTooltip: startSession.isFirstSession,
        },
      ];
    }
    // Possibly render other menu items here

    return [];
  }, [
    translate,
    styles.popoverMenuItem.paddingHorizontal,
    styles.popoverMenuItem.paddingVertical,
    styles.sessionTypeTooltipWrapper,
    renderSessionTypeTooltip,
    startSession?.sessionType,
    sessionTypeTitle,
    navigateToSessionType,
    selectOption,
  ]);

  return (
    <View style={styles.flexGrow1}>
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
      {/* TODO */}
      {/* <FloatingActionButton
                accessibilityLabel={translate('sidebarScreen.fabNewChatExplained')}
                role={CONST.ROLE.BUTTON}
                isActive={isCreateMenuActive}
                ref={fabRef}
                onPress={toggleCreateMenu}
            /> */}
    </View>
  );
}

StartSessionButtonAndPopover.displayName = 'StartSessionButtonAndPopover';

export default forwardRef(StartSessionButtonAndPopover);
