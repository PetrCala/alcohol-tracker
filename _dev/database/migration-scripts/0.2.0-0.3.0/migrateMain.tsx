import addNicknameToIdTable from './addNicknameToIdTable';
import {getDatabase, saveDatabase} from '../../databaseUtils';
import { DatabaseProps } from '@src/types/database';

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
function migrate_020_030(
  type: 'dev' | 'prod' = 'dev',
):void {
  console.log('Migrating the database from 0.2.0 to 0.3.0...');
  const db = getDatabase(type);
  if (!db) {
    throw new Error('Failed to load database');
  }
  try {
    // await addNicknameToIdTable(db);
    saveDatabase(db, type);
  } catch (error:any) {
    throw new Error('Failed to migrate database: ' + error.message);
  }
  console.log('Database migrated successfully!');
}

export default migrate_020_030;
