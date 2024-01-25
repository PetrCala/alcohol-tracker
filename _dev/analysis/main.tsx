import {DatabaseProps} from '../../src/types/database';
import {getDatabase} from '../database/databaseUtils';
import {generateReport} from './report/generateReport';
import {writeMarkdownToFile} from './report/markdown';
import { getUserOverallConsumption } from './source/consumption';

function getReport(db: DatabaseProps) {
  const reportName = 'kiroku-report';
  const report = generateReport(db);
  writeMarkdownToFile(report, reportName);
}

function getConsumption(db: DatabaseProps) {
  getUserOverallConsumption(db);
}

(async () => {
  await main();
})();

async function main() {
  try {
    const db = getDatabase('production');
    if (!db) throw new Error('Could not get database');

    // Perhaps parametrize this during the main.tsx call
    // getReport(db);
    getConsumption(db);
  } finally {
    process.exit(0);
  }
}
