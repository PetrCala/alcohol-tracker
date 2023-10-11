// Run the script using ts-node _dev/database/migration.tsx

import { DatabaseProps, FriendsData, ProfileData, UserData } from "../../src/types/database";

type TransformCallback = (data: any, primaryKey: string, secondaryKey?: string) => any;

/**
 * Iterate and transform data in a specified database path.
 *
 * @param adminDb - The database reference.
 * @param dbPath - The path in the database where the data resides.
 * @param callback - A function to transform the data.
 * 
 * @example iterateAndTransformData(adminDb, 'user_drinking_sessions', (session, userId, sessionId) => {
    // ... [Your Transformation Logic Here] ...
});
 */
export const processPrimaryLevelData = async (
  adminDb: any,
  dbPath: keyof DatabaseProps,
  callback: TransformCallback
) => {
  const snapshot = await adminDb.ref(dbPath).once('value');
  const mainData = snapshot.val();

  for (let primaryKey in mainData) {
      let dataItem = mainData[primaryKey];
      let newData = await callback(dataItem, primaryKey);
      if (newData) {
          await adminDb.ref(`${dbPath}/${primaryKey}`).set(newData);
      }
  }
};

// Processes data that's two levels deep (has secondary keys).
export const processSecondaryLevelData = async (
  adminDb: any,
  dbPath: keyof DatabaseProps,
  callback: TransformCallback
) => {
  const snapshot = await adminDb.ref(dbPath).once('value');
  const mainData = snapshot.val();

  for (let primaryKey in mainData) {
      for (let secondaryKey in mainData[primaryKey]) {
          let dataItem = mainData[primaryKey][secondaryKey];
          let newData = await callback(dataItem, primaryKey, secondaryKey);
          if (newData) {
              await adminDb.ref(`${dbPath}/${primaryKey}/${secondaryKey}`).set(newData);
          }
      }
  }
};

