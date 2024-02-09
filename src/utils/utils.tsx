import * as fs from 'fs';
import * as readline from 'readline';

import {DatabaseProps} from '@src/types/database';

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
  } catch (error: any) {
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

/**
 * Finds all values in an object or array that match a given key.
 * @param node - The object or array to search.
 * @param keyToFind - The key to match.
 * @returns An array of values that match the given key.
 */
export function findValuesByKey(node: any, keyToFind: string): any[] {
  let foundValues: any[] = [];

  if (node instanceof Array) {
    node.forEach(element => {
      foundValues = foundValues.concat(findValuesByKey(element, keyToFind));
    });
  } else if (node instanceof Object) {
    Object.keys(node).forEach(key => {
      if (key === keyToFind) {
        foundValues.push(node[key]);
      }
      foundValues = foundValues.concat(findValuesByKey(node[key], keyToFind));
    });
  }

  return foundValues;
}

/**
 * Finds a single value in an object or array by a specified key. Search only at the level of the specified node.
 * @param node - The object or array to search.
 * @param keyToFind - The key to search for.
 * @returns The value associated with the specified key.
 * @throws Error if no value is found for the specified key or if more than one value is found.
 */
export function findSingleValueByKey(node: any, keyToFind: string): any {
  let foundValues: any[] = [];

  const searchNode = (currentNode: any) => {
    if (currentNode instanceof Array) {
      currentNode.forEach(element => searchNode(element));
    } else if (currentNode instanceof Object) {
      Object.keys(currentNode).forEach(key => {
        if (key === keyToFind) {
          foundValues.push(currentNode[key]);
          // if (foundValues.length > 1) {
          //   throw new Error("More than one value found for the specified key.");
          // }
        }
        // searchNode(currentNode[key]);
      });
    }
  };

  searchNode(node);

  if (foundValues.length !== 1) {
    throw new Error('No value found for the specified key.');
  }

  return foundValues[0];
}

/**
 * Asks the user a question and returns a promise that resolves to a boolean value indicating the user's confirmation.
 * @param question - The question to ask the user.
 * @returns A promise that resolves to a boolean value indicating the user's confirmation.
 */
export async function confirmExecution(question: string): Promise<boolean> {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer: string) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

/**
 * Asks the user a question and returns a promise that resolves to the inputted value.
 * @param question - The question to ask the user.
 * @returns A promise that resolves to the inputted value.
 */
export async function askForValue(question: string): Promise<string> {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer: string) => {
      rl.close();
      resolve(answer);
    });
  });
}
/**
 * Validates and parses the input string to a timestamp.
 *
 * @param input - The input string representing a date and time in the format "YYYY-MM-DD HH:MM".
 * @returns The timestamp value of the input string.
 * @throws Error if the input string is not in the correct format or if it represents an invalid date.
 */
export function validateAndParseInputToTimestamp(input: string): number {
  const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
  if (!regex.test(input)) {
    throw new Error(
      'Invalid date format. Please use the format YYYY-MM-DD HH:MM.',
    );
  }

  const date = new Date(input);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date. Please provide a valid date and time.');
  }

  return date.getTime();
}
