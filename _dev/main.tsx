// Run the script using ts-node _dev/database/migration.tsx (install globally through npm install -g ts-node)

import admin from '../src/database/admin';
import migrate_020_030 from './database/migration-scripts/0.2.0-0.3.0/migrateMain';

// const adminDb = admin.database();

const testUserId = "dmXj9O2SqWWHPRtqtKGGdaUzGFt2";

async function main() {
    try {
      console.log("Migrating the database...")
      migrate_020_030('dev');
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    process.exit(0);
  };
};

main();

