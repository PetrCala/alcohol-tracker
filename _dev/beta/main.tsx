import adminDb from "../database/adminDatabase";
import { writeBetaKeysIntoDatabase, getDatabaseBetaKeys } from "./betaDatabase";
import { betaKeysList } from "./beta_keys";

async function runScript() {
    try {
      const data = await getDatabaseBetaKeys(adminDb);
      if (data) {
        console.log("Data retrieved:", data);
      } else {
        console.log("No data available.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      process.exit(0);
    };
};

runScript();



async function test() {
    try {
        // await writeBetaKeysIntoDatabase(adminDb, betaKeysList);
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      process.exit(0);
    };
};

// test();