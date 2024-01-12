import * as fs from 'fs';

import { DatabaseProps } from '@src/types/database';

/**
 * Loads JSON data from a file.
 *
 * @param filename - The path to the JSON file.
 * @returns The parsed JSON data as a DatabaseProps object, or null if there was an error.
 *
 * @example
 * const data = loadJsonData('path_to_your_file.json');
 * console.log(data);
 */
export function loadJsonData(filename: string): DatabaseProps | null {
  try {
    // Read the file synchronously (you can also use async methods)
    const rawData = fs.readFileSync(filename, 'utf8');

    // Parse the JSON data
    const jsonData: DatabaseProps = JSON.parse(rawData);

    return jsonData;
  } catch (error:any) {
    throw new Error('Error reading or parsing the JSON file: ' + error.message);
  }
}

/**
 * Saves a JSON object to a file.
 *
 * @param filePath - The absolute path where the JSON file will be saved.
 * @param data - The JSON object to be saved.
 * @returns True if the file was successfully saved, false otherwise.
 *
 * @example
 * const data = { name: 'John', age: 30 };
 * const success = saveJsonData('/path/to/save.json', data);
 * console.log(success); // true
 */
export function saveJsonData(filePath: string, data: any): boolean {
  try {
    // Convert the JSON object to a string
    const jsonData = JSON.stringify(data, null, 2);

    // Save the string as a .json file
    fs.writeFileSync(filePath, jsonData, 'utf8');

    return true;
  } catch (error) {
    console.error('Error saving the JSON file:', error);
    return false;
  }
}