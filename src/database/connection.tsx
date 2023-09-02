import { off, onDisconnect, onValue, push, ref, serverTimestamp, set } from "firebase/database";

/** Create and handle a listener that will monitor the user connection status.
 * 
 * The listener monitors the hook value, adds the connected device to
 * a list of connections in the database, and upon disconnect removes this
 * connection from the list and updates the last seen online value in the database.
 * 
 * @param db Database object
 * @param userId User id
 * @param setIsOnline A hook to update the user connection status
 */
export function handleUserConnection(
    db: any,
    userId: string,
    setIsOnline: (status: boolean) => void,
  ): () => void {
    let connectedRef = ref(db, '.info/connected');
    let userConnectionRef = ref(db, `users/${userId}/connections`);
    let lastOnlineRef = ref(db, `users/${userId}/last_online`);
  
    let con: any = null; // Initialize a variable to store the new connection reference

    const listener = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        setIsOnline(true);
  
        con = push(userConnectionRef); // Create a new connection entry
        set(con, true); // Set the value of the new entry to true
  
        onDisconnect(con).remove(); // Remove the new entry when the user disconnects
        onDisconnect(lastOnlineRef).set(serverTimestamp());
      } else {
        setIsOnline(false);
      }
    });
  
    return () => off(connectedRef, "value", listener);
};