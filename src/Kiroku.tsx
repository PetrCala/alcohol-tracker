import NavigationRoot from '@libs/Navigation/NavigationRoot';
import PropTypes from 'prop-types';
import {useEffect, useState} from 'react';
import {Linking} from 'react-native';

// Could register logger here

const propTypes = {
  /** Whether a new update is available and ready to install. */
  updateAvailable: PropTypes.bool,

  /** True when the user must update to the latest minimum version of the app */
  updateRequired: PropTypes.bool,

  /** Last visited path in the app */
  lastVisitedPath: PropTypes.string,
};

const defaultProps = {
  updateAvailable: false,
  updateRequired: false,
  lastVisitedPath: undefined,
};

// function Kiroku(props) {
function Kiroku(): any {
  const [initialUrl, setInitialUrl] = useState<string | null>(null);

  //   useLayoutEffect(() => {
  //     // Initialize this client as being an active client
  //     ActiveClientManager.init();

  //     // Used for the offline indicator appearing when someone is offline
  //     NetworkConnection.subscribeToNetInfo();
  //   }, []);

  useEffect(() => {
    // If the app is opened from a deep link, set the initial URL to the deep link URL
    Linking.getInitialURL().then(url => {
      setInitialUrl(url);
    });
  }, []);

  // if (props.updateRequired) {
  //   throw new Error(CONST.ERROR.UPDATE_REQUIRED);
  // }

  // {/* {props.updateAvailable && !props.updateRequired ? (
  //   <UpdateAppModal />
  // ) : null} */}

  // onReady={setNavigationReady}
  // authenticated={isAuthenticated}
  // lastVisitedPath={props.lastVisitedPath}
  return (
    <NavigationRoot />
    // initialUrl={initialUrl}
    // />
  );
}

Kiroku.propTypes = propTypes;
Kiroku.displayName = 'Kiroku';

export default Kiroku;
