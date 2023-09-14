import { get, ref } from "firebase/database";

export async function readDataOnce(db: any, refString: string) {
    const userRef = ref(db, refString);
    try {
      const snapshot = await get(userRef); // One-off fetch
      if(snapshot.exists()) {
        return snapshot.val(); // Return user data
      }
      return null;
    } catch (error:any){
      throw new Error("Failed to retrieve user data:" + error.message);
    }
  }