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
  
    const listener = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        setIsOnline(true);
        const con = push(userConnectionRef);
        onDisconnect(con).remove();
        set(con, true);
        onDisconnect(lastOnlineRef).set(serverTimestamp());
      } else {
        setIsOnline(false);
      }
    });
  
    return () => off(connectedRef, "value", listener);
};