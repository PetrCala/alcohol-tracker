import { Database, ref, set, update } from "firebase/database";
import { readDataOnce } from "../../src/database/baseFunctions";
import admin from "./admin";
import { transformUserData } from "./migrateUsers";

const adminDb = admin.database();

export const modifyAndTestUser = async (db: Database, userId: string) => {
    const userRefString = `users/${userId}`;
    
    // Step 1: Capture the original user data for later validation
    const originalUserData = await readDataOnce(db, userRefString);
    if (!originalUserData) {
        console.error("User does not exist.");
        return;
    }

    // Step 2: Modify the user data with the new structure
    const userRef = ref(db, userRefString);
    const transformedData = await transformUserData(originalUserData, userId);
    if (!transformedData){
        console.log("Could not transform the data.")
        return;
    }
    await set(userRef, transformedData);

    // Step 3: Test that the user's data has changed as expected
    const updatedUserData = await readDataOnce(db, userRefString);
    if (
        updatedUserData && 
        'profile' in updatedUserData && 
        'friends' in updatedUserData
    ) {
        console.log("User data updated successfully!", updatedUserData);
    } else {
        console.error("Failed to update user data.", updatedUserData);
    };
    console.log(updatedUserData.profile.display_name);

    // Step 4: Revert the changes back to the original data
    await set(userRef, originalUserData);

    // Step 5: Test that the user's data has been reverted successfully
    const revertedUserData = await readDataOnce(db, userRefString);
    if (JSON.stringify(revertedUserData) === JSON.stringify(originalUserData)) {
        console.log("User data reverted successfully!");
    } else {
        console.error("Failed to revert user data.");
    }
};

