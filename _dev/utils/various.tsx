/**
 * Using an admin database, fetch all user IDs in the database.
 * 
 * @param {any} adminDb The admin database.
 * @returns {Promise<string[]>} List of all user IDs.
 */
export async function getAllUserIds(adminDb:any):Promise<string[]> {
    var userIds = [];
    const snapshot = await adminDb.ref('users/').once('value');
    const data = snapshot.val();
    if (data) {
        for (let userId in data) {
            userIds.push(userId);
        };
    }
    return userIds;
};

