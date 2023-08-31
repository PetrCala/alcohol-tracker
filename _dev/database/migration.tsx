// Run the script using ts-node _dev/database/migration.tsx

import adminDb from "./adminDatabase";


// db.ref('feedback').once('value', (snapshot:any) => {

//     const feedback = snapshot.val();
//     console.log(feedback);
// });

// Updates to the database

// type UnitTypesProps = {
//     beer: number
//     cocktail: number
//     other: number
//     strong_shot: number
//     weak_shot: number
//     wine: number
//   };

// type DrinkingSessionData = {
//     end_time: number;
//     last_unit_added_time: number;
//     session_id: string;
//     start_time: number;
//     units: UnitTypesProps;
//   };


// db.ref('user_drinking_sessions').once('value', (snapshot:any) => {
//   const users = snapshot.val();

//   for (let userId in users) {
//     const sessions = users[userId];
//     for (let sessionId in sessions) {
//       let session = sessions[sessionId];

//       // Transform the session data
//       let newUnits = {
//         beer: 0,
//         cocktail: 0,
//         other: session.units,
//         strong_shot: 0,
//         weak_shot: 0,
//         wine: 0
//     }
//       let newSession = {
//         session_id: session.session_id,
//         start_time: session.timestamp,
//         end_time: session.timestamp + 1, // Adjust based on your logic
//         last_unit_added_time: session.timestamp, // Adjust based on your logic
//         units: newUnits
//         };
//       db.ref(`user_drinking_sessions/${userId}/${sessionId}`).set(newSession);
//     }
//   }
// });