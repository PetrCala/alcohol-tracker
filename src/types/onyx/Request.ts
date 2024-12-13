import type {OnyxUpdate} from 'react-native-onyx';
import type Response from './Response';

/** A model representing Onyx data */
type OnyxData = {
  /** Onyx data to set upon a successful request */
  successData?: OnyxUpdate[];

  /** Onyx data to set upon a failed request */
  failureData?: OnyxUpdate[];

  /** Onyx data to set upon a finished request */
  finallyData?: OnyxUpdate[];

  /** Onyx data to set optimistically */
  optimisticData?: OnyxUpdate[];
};

/** A type of an API request */
type RequestType = 'get' | 'post';

/** API request payload data */
type RequestData = {
  /** An API command */
  command: string;

  /** An API command name */
  commandName?: string;

  /** Data to send through an API request */
  data?: Record<string, unknown>;

  /** A type of an API request */
  type?: RequestType;

  /** Whether or not to use a secure request */
  shouldUseSecure?: boolean;

  /** Onyx data to set upon a successful request */
  successData?: OnyxUpdate[];

  /** Onyx data to set upon a failed request */
  failureData?: OnyxUpdate[];

  /** Onyx data to set upon a finished request */
  finallyData?: OnyxUpdate[];

  /** Whether or not to get conflicting requests */
  getConflictingRequests?: (persistedRequests: Request[]) => Request[];

  /** Whether or not to handle conflicting requests */
  handleConflictingRequest?: (persistedRequest: Request) => unknown;

  /** A callback for when the request is resolved */
  resolve?: (value: Response) => void;

  /** A callback for when the request is rejected */
  reject?: (value?: unknown) => void;
};

/** A model for a request conflict resolver */
type RequestConflictResolver = {
  /**
   * A callback that's provided with all the currently serialized functions in the sequential queue.
   * Should return a subset of the requests passed in that conflict with the new request.
   * Any conflicting requests will be cancelled and removed from the queue.
   *
   * @example - In ReconnectApp, you'd only want to have one instance of that command serialized to run on reconnect. The callback for that might look like this:
   * (persistedRequests) => persistedRequests.filter((request) => request.command === 'ReconnectApp')
   * */
  getConflictingRequests?: (persistedRequests: Request[]) => Request[];

  /**
   * Should the requests provided to getConflictingRequests include the new request?
   * This is useful if the new request and an existing request cancel eachother out completely.
   *
   * @example - In DeleteComment, if you're deleting an optimistic comment, you'd want to cancel the optimistic AddComment call AND the DeleteComment call.
   * */
  shouldIncludeCurrentRequest?: boolean;

  /**
   * Callback to handle a single conflicting request.
   * This is useful if you need to clean up some optimistic data for a request that was queued but never sent.
   * In these cases the optimisticData will be applied immediately, but the successData, failureData, and/or finallyData will never be applied unless you do it manually in this callback.
   */
  handleConflictingRequest?: (persistedRequest: Request) => unknown;
};

/** A model for an API request */
type Request = RequestData & OnyxData & RequestConflictResolver;

export default Request;
export type {OnyxData, RequestType, RequestConflictResolver};
