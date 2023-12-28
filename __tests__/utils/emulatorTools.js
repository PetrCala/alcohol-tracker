export async function checkEmulatorStatus() {
    const admin = require('firebase-admin');
    try {
        await admin.app().database().ref('.info/connected').once('value');
        return true;
    } catch (error) {
        return false;
    }
}

console.log("checking emulator status...")
const status = await checkEmulatorStatus()
console.log("Emulator status:", status)