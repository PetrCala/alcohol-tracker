import React, {ReactNode, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import {StyleSheet} from 'react-native';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import MenuItem from '@components/MenuItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import useSingleExecution from '@hooks/useSingleExecution';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import useActiveCentralPaneRoute from '@hooks/useActiveCentralPaneRoute';
import Switch from './Switch';
import {DrinkingSessionId} from '@src/types/onyx';

type MenuData = {
  translationKey: TranslationPaths;
  routeName?: Route;
  brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
  interactive?: boolean;
  action?: () => void;
  link?: string | (() => Promise<string>);
  shouldStackHorizontally?: boolean;
  title?: string;
  description?: string;
  shouldShowRightComponent?: boolean;
  shouldShowRightIcon?: boolean;
  rightComponent?: ReactNode;
};

type SessionSliderProps = {
  sessionId: DrinkingSessionId;
  isBlackout: boolean;
  onBlackoutChange: (value: boolean) => void;
  note: string;
  dateString: string;
  shouldAllowDateChange?: boolean;
};

const SessionDetailsSlider: React.FC<SessionSliderProps> = ({
  sessionId,
  isBlackout,
  onBlackoutChange,
  note,
  dateString,
  shouldAllowDateChange,
}) => {
  const {translate} = useLocalize();
  const {isExecuting, singleExecution} = useSingleExecution();
  const waitForNavigate = useWaitForNavigation();
  const popoverAnchor = useRef(null);
  const activeCentralPaneRoute = useActiveCentralPaneRoute();
  const styles = useThemeStyles();

  const blackoutSwitch: ReactNode = (
    <Switch
      accessibilityLabel={translate('liveSessionScreen.blackoutSwitchLabel')}
      isOn={isBlackout}
      onToggle={value => onBlackoutChange(value)}
    />
  );

  const sliderData: MenuData[] = [
    {
      translationKey: 'liveSessionScreen.blackout',
      shouldShowRightComponent: true,
      rightComponent: blackoutSwitch,
      interactive: false,
    },
    {
      translationKey: 'liveSessionScreen.note',
      description: note,
      shouldShowRightIcon: true,
      routeName:
        ROUTES.DRINKING_SESSION_SESSION_NOTE_SCREEN.getRoute(sessionId),
    },
  ];

  if (shouldAllowDateChange) {
    sliderData.push({
      translationKey: 'common.date',
      shouldShowRightIcon: true,
      description: dateString,
      routeName:
        ROUTES.DRINKING_SESSION_SESSION_DATE_SCREEN.getRoute(sessionId),
    });
  }

  return (
    <View style={localStyles.container}>
      <View style={[localStyles.tab, styles.borderColorTheme]}>
        <Text style={localStyles.tabText}>Session details</Text>
      </View>
      <View style={localStyles.sessionDetailsContainer}>
        {sliderData.map(item => {
          const keyTitle = item.translationKey
            ? translate(item.translationKey)
            : item.title;

          return (
            <MenuItem
              key={keyTitle}
              wrapperStyle={styles.sectionMenuItem}
              title={keyTitle}
              description={item.description}
              disabled={isExecuting}
              onPress={singleExecution(() => {
                if (item.action) {
                  item.action();
                } else {
                  waitForNavigate(() => {
                    Navigation.navigate(item.routeName);
                  })();
                }
              })}
              interactive={item.interactive}
              brickRoadIndicator={item.brickRoadIndicator}
              shouldStackHorizontally={item.shouldStackHorizontally}
              shouldShowRightIcon={item.shouldShowRightIcon}
              ref={popoverAnchor}
              hoverAndPressStyle={styles.hoveredComponentBG}
              shouldBlockSelection={!!item.link}
              focused={
                !!activeCentralPaneRoute &&
                !!item.routeName &&
                !!(
                  activeCentralPaneRoute.name
                    .toLowerCase()
                    .replaceAll('_', '') ===
                  item.routeName.toLowerCase().replaceAll('/', '')
                )
              }
              isPaneMenu
              shouldShowRightComponent={item.shouldShowRightComponent}
              rightComponent={item.rightComponent}
            />
          );
        })}
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    marginLeft: 8,
    marginRight: 8,
  },
  tab: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderTopWidth: 1,
  },
  tabText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: 'black',
  },
  tabArrow: {
    width: 25,
    height: 25,
    marginRight: 3,
  },
  tabArrowExpanded: {
    transform: [{rotate: '180deg'}],
  },
  tabArrowDefault: {},
  sessionDetailsContainer: {
    width: '100%',
  },
  tileContainerBase: {
    padding: 10,
    borderColor: 'gray',
    borderBottomWidth: 0,
    borderRadius: 5,
    marginLeft: 12,
    marginRight: 12,
  },
  tileContainerHorizontal: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  tileContainerVertical: {
    flexDirection: 'column',
    alignContent: 'flex-start',
  },
  tileHeading: {
    fontSize: 14,
    fontWeight: '500',
    color: 'black',
  },
  noteWindowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    backgroundColor: 'white',
    marginTop: 5,
  },
  noteTextInput: {
    width: '100%',
    height: 100,
    flexGrow: 1,
    flexShrink: 1,
    textAlignVertical: 'top',
    padding: 10,
    paddingTop: 10,
    borderRadius: 5,
    color: 'black',
  },
});

export default SessionDetailsSlider;
