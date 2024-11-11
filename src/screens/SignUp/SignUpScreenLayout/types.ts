import type React from 'react';

type SignUpScreenLayoutProps = {
  /** The children to show inside the layout */
  children?: React.ReactNode;

  /** Welcome text to show in the header of the form, changes depending
   * on a form type (for example, sign in) */
  welcomeText?: string;

  /** Welcome header to show in the header of the form, changes depending
   * on a form type (for example, sign in) and small vs large screens */
  welcomeHeader?: string;

  navigateFocus?: () => void;
};

type SignUpScreenLayoutRef = {
  scrollPageToTop: (animated?: boolean) => void;
};

export type {SignUpScreenLayoutRef, SignUpScreenLayoutProps};
