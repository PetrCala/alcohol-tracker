// Run the script using ts-node _dev/database/migration.tsx (install globally through npm install -g ts-node)

require('dotenv').config(); // for the process.env variables to read the .env file
import admin from '../src/database/admin';
import migrate_020_030 from './database/migration-scripts/0.2.0-0.3.0/migrateMain';
import CONST from '../src/CONST';
import { confirmExecution } from '../src/utils/utils';

// const adminDb = admin.database();

const testUserId = "dmXj9O2SqWWHPRtqtKGGdaUzGFt2";

const environment = process.env.APP_ENVIRONMENT
if (!environment) {
  throw new Error('APP_ENVIRONMENT not set in .env file');
}

(async () => {
  if (environment === CONST.ENVIRONMENT.PROD) {
    const isConfirmed = await confirmExecution('Are you sure you want to run this in the production environment? (y/n) ');
    if (isConfirmed) {
      await main();
    } else {
      console.log('Migration cancelled.');
      process.exit(0);
    }
  } else {
    await main();
  }
})();

async function main() {
    try {
      console.log("Migrating the database...")
      // await migrate_020_030('dev');
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    process.exit(0);
  };
};