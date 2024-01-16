import {scheduleMaintenance, cancelMaintenance} from './maintenance';

(async () => {
  await main(); // The maintenance functions ask for production confirmation themselves
})();

/** Schedule maintenance by updating the maintenance configuration in the
 * database. Connect through an admin SDK to the database flavor that is
 * defined in the .env file under the APP_ENVIRONMENT property.
 *
 * Determine the maintenance start/end date dynamically by asking the user.
 * Accept one of two flags: 'schedule', and 'cancel'.
 */
async function main() {
  const flags = process.argv.slice(2);
  if (flags.length === 1) {
    const flag = flags[0];
    if (flag === 'schedule') {
      await scheduleMaintenance();
    } else if (flag === 'cancel') {
      await cancelMaintenance();
    } else {
      console.error(
        'Incorrect flag. Please provide one of the following: schedule, cancel.',
      );
      process.exit(1);
    }
  } else {
    console.error('Please provide only one flag.');
    process.exit(1);
  }
}
