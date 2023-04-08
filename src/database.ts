import { ref, onValue, off } from "firebase/database";
import { Database } from "firebase/database";

export function readDataOnce(db: Database, userId: string) {
  const userRef = ref(db, `users/${userId}`);
  onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    console.log(data);
  }, {
    onlyOnce: true
  });
}

export function listenForDataChanges(
  db: Database,
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