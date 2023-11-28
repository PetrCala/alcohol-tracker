import { initializeApp } from "firebase/app";
import { Database, getDatabase } from "firebase/database";

import { fetchNicknameByUID } from "../../../src/database/baseFunctions";
import { TEST_UID, TEST_NICKNAME } from "../../utils/testsStatic";


describe("fetchNicknameByUID", () => {
  // let db:Database;

  // beforeAll(() => {
  //   const app = initializeApp(firebaseConfig);
  //   db = getDatabase(app);
  // });

  // it("should fetch the correct nickname for a given UID", async () => {
  //   const nickname = await fetchNicknameByUID(db, TEST_UID);
  //   expect(nickname).toBe(TEST_NICKNAME);
  // });

  // it("should return null for a non-existent UID", async () => {
  //   const nickname = await fetchNicknameByUID(db, "nonExistentUID");
  //   expect(nickname).toBeNull();
  // });
});
