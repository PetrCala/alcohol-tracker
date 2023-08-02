import { readUserDataOnce, listenForDrinkingSessionChanges } from "../database";
import { get, ref, query, equalTo } from "firebase/database";

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const data = await getDrinkingSessions(db, userId);
  //       setDrinkingSessions(data);
  //     } catch (error) {
  //       console.error('Error fetching drinking sessions:', error);
  //     }
  //   };

  //   fetchData();
  // }, [db, userId]);



  async function getDrinkingSessions(db: any, userId: string){
    try{
      const dbRef = ref(db, `user_drinking_sessions/${userId}`)
      const snapshot = await get(dbRef);
      if (!snapshot.exists()){
        console.log('No sesions found...');
        return [];
      }
      const sessionIds = snapshot.val();
      const drinkingSessions = [];
      for (let sessionId in sessionIds){
        let sessionRef = ref(db, `drinking_sessions/${sessionId}`);
        const sessionSnapshot = await get(sessionRef);
        // Handle missing session
        const sessionDetails = sessionSnapshot.val();
        drinkingSessions.push(sessionDetails);
      }
      return drinkingSessions;
    } catch (error) {
      console.error('Error fetching drinking sessions:', error);
      return [];
    }
  };
