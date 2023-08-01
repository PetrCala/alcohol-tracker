import { get, ref, onValue, off } from "firebase/database";

/** Read data once using get()
 * 
 * Provide the database object and a user ID and 
 * return all data of that user. Uses get to avoid
 * continuous listening and performance overload.
 * 
 * Use:
 * const [userData, setUserData] = useState<UserData | null>(null);

 * useEffect(() => {
 *   const fetchUserData = async () => {
 *     const data = await readUserDataOnce(db, userId);
 *     setUserData(data);
 *   };

 *   fetchUserData();
 * }, [db, userId]);
 * */
export async function readUserDataOnce(db: any, userId: string) {
  const userRef = ref(db, `users/${userId}`);
  const snapshot = await get(userRef); // One-off fetch
  if(snapshot.exists()) {
    return snapshot.val(); // Return user data
  }
  return null;
}

/** Main listener for user data changes.
 * 
 * @param db The database object
 * @param userId User ID
 * @param onDataChange A function for data cahnge
 * @returns 
 */
export function listenForDataChanges(
  db: any,
  userId: string,
  onDataChange: (data: any) => void
) {
  const userRef = ref(db, `users/${userId}`);
  const listener = onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    onDataChange(data);
  });

  return () => off(userRef, "value", listener);
}