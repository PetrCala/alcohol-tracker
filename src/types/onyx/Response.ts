import type {OnyxUpdate} from 'react-native-onyx';

/** A model for an API response payload data */
type Data = {
  /** Name of the API request PHP command */
  phpCommandName: string;

  /** Authentication write commands */
  authWriteCommands: string[];
};

/** A model for an API response */
type Response = {
  /** Unique identifier of the previous update */
  previousUpdateID?: number | string;

  /** Unique identifier for the last update */
  lastUpdateID?: number | string;

  /** A JSON code associated with the response */
  jsonCode?: number | string;

  /** Onyx data that should be handled with the response */
  onyxData?: OnyxUpdate[];

  /** Unique identifier of the request */
  requestID?: string;

  /** Whether or not the response should pause the onyx queue */
  shouldPauseQueue?: boolean;

  /** Response authentication token */
  authToken?: string;

  /** An encrypted response authentication token */
  encryptedAuthToken?: string;

  /** A response message */
  message?: string;

  /** A response title */
  title?: string;

  /** Data sent in the response */
  data?: Data;

  /** Type of an API response */
  type?: string;

  /** A short lived authentication token */
  shortLivedAuthToken?: string;

  /** An authentication string */
  auth?: string;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  /** A response shared secret */
  shared_secret?: string;
};

export default Response;
