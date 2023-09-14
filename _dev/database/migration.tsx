// Run the script using ts-node _dev/database/migration.tsx

import adminDb from "./adminDatabase";


// adminDb.ref('feedback').once('value', (snapshot:any) => {

    // const feedback = snapshot.val();
    // console.log(feedback);
// };

export type DrinkingSessionData = {
    [session_id: string]: {
      start_time: number;
      end_time: number;
      units: UnitsObject;
      blackout?: boolean;
      note?: string;
      ongoing?: boolean | null;
    };
  };

export const UnitTypesKeys = [
    'beer', 
    'cocktail', 
    'other', 
    'strong_shot',
    'weak_shot',
    'wine'
  ] as const;  // Infer a readonly tuple
  
  export type UnitTypesProps = Partial<Record<typeof UnitTypesKeys[number], number>>;

/** Type for drinking session data when stored as an array */
export type DrinkingSessionArrayItem = Omit<DrinkingSessionData[string], 'session_id'>;

export type UnitsObject = {
  [timestamp: number]: UnitTypesProps;
};


// adminDb.ref('user_drinking_sessions').once('value', (snapshot:any) => {
//     const users = snapshot.val();

//     for (let userId in users) {
//         const sessions = users[userId];
//         for (let sessionId in sessions) {
//             let session = sessions[sessionId];
//             let startTime:number = session.start_time;
//             let totalUnits:number = 0;
//             for (const key of UnitTypesKeys) {
//               if (session.units[key] !== undefined) {
//                 totalUnits += session.units[key]!;
//               }
//             }
//             let newUnits:UnitsObject = {
//                 [startTime]: {
//                     other: totalUnits,
//                 }
//             };
//             // Transform the session data
//             let newSession: DrinkingSessionArrayItem = {
//                 start_time: session.start_time,
//                 end_time: session.start_time + 10000,
//                 units: newUnits,
//             };
//             adminDb.ref(`user_drinking_sessions/${userId}/${sessionId}`).set(newSession);
//         };
//     };
// });