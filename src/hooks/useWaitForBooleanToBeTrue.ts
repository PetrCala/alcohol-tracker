import React, {useState, useEffect, useRef} from 'react';

// Assuming this function is now part of a component or receives the state variable directly
const useWaitForBooleanToBeTrue = (
  bool: boolean,
  timeout = 30000,
): Promise<boolean> => {
  // Using a ref to store the current value of the boolean
  const boolRef = useRef(bool);
  boolRef.current = bool;

  return React.useMemo(() => {
    if (!boolRef.current) {
      return Promise.resolve(false); // No waiting was needed
    }
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!boolRef.current) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 100); // Check every 100ms

      // Timeout to prevent infinite waiting
      const timeoutId = setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Timeout waiting for a boolean to be true'));
      }, timeout);

      // Optionally clear the timeout if the condition is met before the timeout
      return () => clearTimeout(timeoutId);
    });
  }, [bool]); // Depend on the bool to re-create the promise when it changes
};

// // Usage in a component
// const MyComponent = () => {
//   const [myBool, setMyBool] = useState(false);

//   useEffect(() => {
//     useWaitForBooleanToBeTrue(myBool)
//       .then(() => {
//         console.log('Boolean changed to true');
//       })
//       .catch((error) => {
//         console.error(error.message);
//       });
//   }, [myBool]); // React to changes in myBool

//   // Example trigger
//   const triggerChange = () => setMyBool(true);

//   return (
//     <div>
//       <button onClick={triggerChange}>Change Boolean</button>
//     </div>
//   );
// };
