import { getDatabase } from "../database/databaseUtils";

const db = getDatabase('dev');
console.log(db);