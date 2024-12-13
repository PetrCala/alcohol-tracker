/** Represents the structure of a web view request object. */
type WebViewRequest = {
  /** The URL of the request. */
  url: string; // Required

  /** The title of the request, if available. */
  title?: string;

  /** Indicates whether the web view is currently loading. */
  loading?: boolean;

  /** The target frame for the request. */
  target?: string;

  /** Indicates if the web view can navigate back. */
  canGoBack?: boolean;

  /** Indicates if the web view can navigate forward. */
  canGoForward?: boolean;

  /** A unique identifier for the lock associated with the request. */
  lockIdentifier?: number;

  /** The main document URL of the request (iOS only). */
  mainDocumentURL?: string; // iOS only

  /** The type of navigation for the request (iOS only). */
  navigationType?: string; // iOS only

  /** Indicates whether the request is for the top frame (iOS only). */
  isTopFrame?: boolean; // iOS only

  /** Indicates if the request has a target frame (iOS only). */
  hasTargetFrame?: boolean; // iOS only
};

export type {WebViewRequest};
