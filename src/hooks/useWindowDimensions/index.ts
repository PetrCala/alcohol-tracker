import {useEffect, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Dimensions, useWindowDimensions} from 'react-native';
import variables from '@styles/variables';
import type WindowDimensions from './types';

const initialViewportHeight =
  window.visualViewport?.height ?? window.innerHeight;
const tagNamesOpenKeyboard = ['INPUT', 'TEXTAREA'];

/**
 * A convenience wrapper around React Native's useWindowDimensions hook that also provides booleans for our breakpoints.
 */
export default function (useCachedViewportHeight = false): WindowDimensions {
  const isCachedViewportHeight = false; // Only for browsers
  //   const isCachedViewportHeight =
  //     useCachedViewportHeight && Browser.isMobileSafari();
  const cachedViewportHeightWithKeyboardRef = useRef(initialViewportHeight);
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();

  // When the soft keyboard opens on mWeb, the window height changes. Use static screen height instead to get real screenHeight.
  const screenHeight = Dimensions.get('screen').height;
  const isExtraSmallScreenHeight =
    screenHeight <= variables.extraSmallMobileResponsiveHeightBreakpoint;
  const isSmallScreenWidth =
    windowWidth <= variables.mobileResponsiveWidthBreakpoint;
  const isMediumScreenWidth =
    windowWidth > variables.mobileResponsiveWidthBreakpoint &&
    windowWidth <= variables.tabletResponsiveWidthBreakpoint;
  const isLargeScreenWidth =
    windowWidth > variables.tabletResponsiveWidthBreakpoint;

  const lowerScreenDimmension = Math.min(windowWidth, windowHeight);
  const isSmallScreen =
    lowerScreenDimmension <= variables.mobileResponsiveWidthBreakpoint;

  const [cachedViewportHeight, setCachedViewportHeight] =
    useState(windowHeight);

  const handleFocusIn = useRef((event: FocusEvent) => {
    const targetElement = event.target as HTMLElement;
    if (tagNamesOpenKeyboard.includes(targetElement.tagName)) {
      setCachedViewportHeight(cachedViewportHeightWithKeyboardRef.current);
    }
  });

  useEffect(() => {
    if (!isCachedViewportHeight) {
      return;
    }
    window.addEventListener('focusin', handleFocusIn.current);
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      window.removeEventListener('focusin', handleFocusIn.current);
    };
  }, [isCachedViewportHeight]);

  const handleFocusOut = useRef((event: FocusEvent) => {
    const targetElement = event.target as HTMLElement;
    if (tagNamesOpenKeyboard.includes(targetElement.tagName)) {
      setCachedViewportHeight(initialViewportHeight);
    }
  });

  useEffect(() => {
    if (!isCachedViewportHeight) {
      return;
    }
    window.addEventListener('focusout', handleFocusOut.current);
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      window.removeEventListener('focusout', handleFocusOut.current);
    };
  }, [isCachedViewportHeight]);

  useEffect(() => {
    if (
      !isCachedViewportHeight &&
      windowHeight >= cachedViewportHeightWithKeyboardRef.current
    ) {
      return;
    }
    setCachedViewportHeight(windowHeight);
  }, [windowHeight, isCachedViewportHeight]);

  useEffect(() => {
    if (
      !isCachedViewportHeight ||
      !window.matchMedia('(orientation: portrait)').matches ||
      windowHeight >= initialViewportHeight
    ) {
      return;
    }
    cachedViewportHeightWithKeyboardRef.current = windowHeight;
  }, [isCachedViewportHeight, windowHeight]);

  return {
    windowWidth,
    windowHeight: isCachedViewportHeight ? cachedViewportHeight : windowHeight,
    isExtraSmallScreenHeight,
    isSmallScreenWidth,
    isMediumScreenWidth,
    isLargeScreenWidth,
    isSmallScreen,
  };
}
