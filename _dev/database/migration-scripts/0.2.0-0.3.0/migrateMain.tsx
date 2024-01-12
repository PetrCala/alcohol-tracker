// import addNicknameToIdTable from './addNicknameToIdTable';
import {
  getDatabase,
  getMigrationEnvType,
  saveDatabase,
} from '../../databaseUtils';
import {DatabaseProps} from '@src/types/database';
import updateAllNicknameToIdData, {
  addUserNicknameToId,
} from './addNicknameToIdTable';
import CONST from '../../../../src/CONST';
import admin from '../../../admin';

const adminDb = admin.database();

/**
 * Migrate from the 0.2.0 version of the database to database applicable
 * to app versions 0.3.0 and above. Automatically validates that the
 * transformation can be made, and exits if it can not.
 *
 * @description
 *  Major changes:
 *  -   nickname_to_id table added
 *
 * @version 0.2.0-0.3.0
 */
async function migrate_020_030(type: string): Promise<void> {
  let envType: 'production' | 'development';
  try {
    envType = getMigrationEnvType(type);
  } catch (error: any) {
    throw new Error(
      'Failed to get migration environment type: ' + error.message,
    );
  }
  console.log('Migrating the database from 0.2.0 to 0.3.0...');
  let db: DatabaseProps | null = getDatabase(envType);
  if (!db) {
    throw new Error('Failed to load database');
  }
  try {
    await updateAllNicknameToIdData(adminDb);
    saveDatabase(db, envType);
  } catch (error: any) {
    throw new Error('Failed to migrate database: ' + error.message);
  }
  console.log('Database migrated successfully!');
}

export default migrate_020_030;
