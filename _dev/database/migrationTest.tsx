import { Database, ref, set, update } from "firebase/database";
import { readDataOnce } from "../../src/database/baseFunctions";

type TransformFunction<T> = (data: T, userId: string) => Promise<T>;

/**
 * Modifies the user data or preferences data based on a transform function, tests the modification, 
 * and reverts the changes back to the original state.
 *
 * @param {Database} db - Database instance to read/write data.
 * @param {string} userId - ID of the user.
 * @param {string} refString - Reference string to locate the data in the database.
 * @param {TransformFunction<T>} transformFunction - Function to transform the original data.
 * 
 * @returns {Promise<boolean | undefined>} - Returns true if data is reverted successfully, false if revert failed, 
 * and undefined if any other operation (like reading or transforming) failed.
 */
export async function modifyAndTestData<T>(
    db: Database, 
    userId: string, 
    refString: string, 
    transformFunction: TransformFunction<T>,
    createNewData: boolean = false,
): Promise<boolean | undefined> {
    // Step 1: Capture the original data for later validation
    const originalData = await readDataOnce(db, refString);
    if (!originalData && !createNewData) { // Do not check if creating the data
        console.error("Data not found.");
        return;
    }

    // Step 2: Modify the data with the new structure
    const userRef = ref(db, refString);
    // Call the transform function here
    const transformedData = await transformFunction(originalData, userId);
    if (!transformedData){
        console.log("Could not transform the data.")
        return;
    }
    await set(userRef, transformedData);

    // Step 3: Test that the user's data has changed as expected
    const updatedData = await readDataOnce(db, refString);
    if ( updatedData ) {
        console.log("Data updated successfully!", updatedData);
    } else {
        console.error("Failed to update the data.", updatedData);
    };

    // Step 4: Revert the changes back to the original data
    await set(userRef, originalData);

    // Step 5: Test that the user's data has been reverted successfully
    const revertedData = await readDataOnce(db, refString);
    if (JSON.stringify(revertedData) === JSON.stringify(originalData)) {
        console.log("Data reverted successfully!");
        return true;
    } else {
        console.error("Failed to revert the data.");
        return false;
    }
};

