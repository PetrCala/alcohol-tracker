// Perhaps this file should be named index.ts, but that causes a name clash error with other such files (*/__mocks__/index.ts)
export default function useResponsiveLayout() {
  return {
    shouldUseNarrowLayout: false,
    isSmallScreenWidth: false,
    isInNarrowPaneModal: false,
    isExtraSmallScreenHeight: false,
    isExtraSmallScreenWidth: false,
    isMediumScreenWidth: false,
    onboardingIsMediumOrLargerScreenWidth: true,
    isLargeScreenWidth: true,
    isSmallScreen: false,
  };
}
