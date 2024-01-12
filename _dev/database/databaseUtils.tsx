import path from 'path';
require('dotenv').config(); // for the process.env variables to read the .env file

import {DatabaseProps} from '../../src/types/database';
import { loadJsonData, saveJsonData } from '../../src/utils/utils';
import CONST from '../../src/CONST';

const devDbName = `${process.env.DEV_PROJECT_ID}-default-rtdb-export`;
const prodDbName = `${process.env.PROD_PROJECT_ID}-default-rtdb-export`;

const migrationsFolder = path.resolve(__dirname, '../migrations');

/**
 * Returns the path of the database file based on the stream type and database type.
 * @param streamType The type of stream ('input' or 'output'). Default is 'input'.
 * @param dbType - The type of the database ('development' or 'production'). Defaults to 'development'.
 * @returns The path of the database file.
 */
export function getDbPath(
  streamType: 'input' | 'output' = 'input',
  dbType: 'development' | 'production' = 'development',
): string {
  const dbName = dbType === 'development' ? devDbName : prodDbName;
  const streamFolder = path.resolve(migrationsFolder, streamType);
  return path.resolve(streamFolder, dbName) + '.json';
}

/**
 * Retrieves the database based on the specified type.
 * @param dbType - The type of the database ('development' or 'production'). Defaults to 'development'.
 * @returns The database object if it exists, otherwise an empty object.
 * @example
 * const db: DatabaseProps = getDatabase('development');
 * console.log(db);
 */
export const getDatabase = (
  dbType: 'development' | 'production' = 'development',
): DatabaseProps | null => {
  const path = getDbPath('input', dbType); // Input database
  let data: DatabaseProps | null = null;
  try {
    data = loadJsonData(path) ?? null;
  } catch (error: any) {
    console.error('Failed to load database data', error.message);
  }
  return data;
};
/**
 * Saves the database to a file.
 * @param db The database to be saved.
 * @param dbType The type of the database ('develoment' or 'production'). Default is 'development'.
 */
export const saveDatabase = (
  db: DatabaseProps,
  dbType: 'development' | 'production' = 'development',
): void => {
  console.log('Saving the database...')
  const outputPath = getDbPath('output', dbType);
  saveJsonData(outputPath, db);
  console.log(`Database saved successfully under path ${outputPath}!`)
};


/**
 * Returns the environment type based on the input type.
 * @param type - The input type.
 * @returns The environment type, which can be either 'production' or 'development'.
 * @throws Error if the input type is invalid.
 */
export const getMigrationEnvType = (type: string): 'production' | 'development' => {
  let envType: 'production' | 'development';
  if (type === CONST.ENVIRONMENT.PROD) {
    envType = 'production';
  } else if (type === CONST.ENVIRONMENT.DEV) { 
    envType = 'development';
  } else {
    throw new Error('Invalid environment');
  }
  return envType;
};