<div align="center">
    <a href="https://petrcala.github.io/Kiroku/assets/html/qr-link.html">
        <img src="https://raw.githubusercontent.com/PetrCala/Kiroku/petr/assets/images/app-logo.png" 
        width="64" height="64" alt="Kiroku Icon" style="border-radius: 15%!important;">
    </a>
    <h1>
        <a href="https://petrcala.github.io/Kiroku/assets/html/qr-link.html">
            Kiroku - Alcohol Tracker
        </a>
    </h1>
</div>

### Download the app

- You can either [**download the app here**][qr link] or scan the QR code below:

<div align="center">
    <img src="https://petrcala.github.io/Kiroku/assets/images/kiroku-qr-code-with-logo.png" width="128" height="128" alt="image">
</div>

#### Table of Contents

- [For developers](#for-developers)

## For developers

- This section is intended for developers only and will later be moved into the Jekyll documentation.

### On the platform choice

- We highly recommend you use Mac for working on this project. Given its compatibility with both Android and iOS, it is an ideal platform for developing a unified and efficient working environment. Fastlane, Bun, and other tools are readily available for Mac, allowing you to ease up your workflow significantly.
- If you can not, or do not want to develop on MacOS, you may need to substitute Bun with other package managers, such as `npm`, and some features of the application may be unavailable to you.

### Setting up the local environment

- We use [Bun](https://bun.sh) for package managing. This experimental approach should come at the added benefit of allowing you to spend less time worrying about packages, and more time coding. Install Bun using

  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

- Most of the local environment setup right after cloning the repository can be handled with the following commands.

  ```bash
  bundle update
  bun i
  bun -g i firebase-tools
  cd ios
  pod install
  ```

### Updating the application version

- In the future, the application versioning will be rewritten into a github action. As of now, you can update the version (local, and for all platforms) using

  ```bash
  bun run bump:<SEMVER_LEVEL>
  ```

  where `<SEMVER_LEVEL>` can be one of the following:

  - **BUILD**: Increments the build version.
  - **PATCH**: Increments the patch version, where only small changes are introduced.
  - **MINOR**: Increments the minor version, where no API breakiing changes are introduced.
  - **MAJOR**: Increments the major version, where major, API breaking changes are introduced.

- The command creates a new commit in the current branch with the updated version. You can then push to origin these changes as you see fit.
- The command should always be ran **on the staging branch** and from the project root. No version updates should happen on the master branch, nor in smaller branches. This should help keep one source of truth. When merging to the staging branch, never accept changes from the incoming branch.
- We use semantic versioning.

### Building for Android

- Create a `local.properties` file in the `android` folder and put the following inside:

  ```bash
  sdk.dir = /Users/USERNAME/Library/Android/sdk
  ```

  where you replace `USERNAME` with your username. On windows, adjust the path to point to your Android SDK folder.

- Make sure to add this path to the `ANDROID_HOME` by running

  ```bash
  export ANDROID_HOME = /Users/USERNAME/Library/Android/sdk
  ```

  If this variable is not set, you might be running into the **Error: Command failed with EN0ENT** bug upon trying to connect to an emulator.

- Build the `.APK` file using `bun run build:android` (calls `fastlane android build`). To bundle the build for Google Play release, run `fastlane android beta`.

- Running `bun run build:android` may fail with insufficient permissions to open the _gradlew_ file. In that case, run

  ```bash
  chmod +x ./android/gradlew
  ```

  to make the file readable.

### Formatting

- For typescript and javascript files, we use `Prettier`
- For bash scripts, we use `shell-format`

### Managing ruby versions

- We officially use Ruby version 2.6.10. To read about ruby version configuration see [this link](https://rbenv.org/man/rbenv.1).

### Working with Firebase

- Firebase CLI is necessary for any Firebase tests/emulators to run correctly. In order to set up your local environment, run these commands first

  ```
  bun -g i firebase
  firebase login
  firebase init
  ```

### Writing Firebase rules

#### Overview

- When setting the Firebase rules, here are a several useful behavior patterns to keep in mind:

  - `.read` and `.write` rules cascade in the following way:
    1. Rules get evaluated based on the node depth until the operation ultimately fails/succeeds.
    2. Allowing an operation in a higher node means that similar operations ran on any lower node will succeed.
    3. Targetting a lower node may lead to an allow as long as the final node's rule succeeds. This is despite any rules failing in higher nodes.
    4. If the node into which is written does not have any write/read rules, the rules of higher order nodes will take effect instead, based on the rules described above.
  - To demonstrate the two above-principles, consider this example:

    ```
    "higher_node": {
        ".write": true,
        "lower_node": {
            ".write: false"
        }
    }
    ```

    - Writing to the higher node: **succeeds**
    - Writing to the lower node: **succeeds**
    - **Explanation**: Attempting to write to the lower node will succeed, as a higher node is setting the `write` rule to `true`. The lower node`s rule is considered, but the higher order rule's allow operation takes precedence. Next, writing to the higher node will succeed too, regardless of the rules in the lower node (these are not considered).

  - Next, take a look at this example:

    ```
    "higher_node": {
        ".write": false,
        "lower_node": {
            ".write: true"
        }
    }
    ```

    - Writing to the higher node: **fails**
    - Writing to the lower node: **succeeds**
    - **Explanation**: When targetting the higher node, the write deny rule means the operation will fail. The rule in the lower node is not taken into consideration (regardless of the outcome). When writing to the lower node, the operation will succeed, as despite the higher node denial, it holds that denial in higher nodes

  - Under this setup, the database will allow writes into the lower order node even though you are explicitly trying to forbid it by setting the rules to `false` there. To forbid writes into the lower order node, make sure to address the higher order rules first.

- When dealing with `.validate`, the behavior is a little different. The **validation rules apply only to the node for which they are written**. In other words, they do not cascade. If you, for example, want all members of a node to be either null, or a certain string, you must set this value for all nodes for which this should be relevant. Simply setting this to a higher order node will not suffice.

#### Strategy

- For read/write, define restrictive rules at higher nodes, and allow broader access at concrete nodes. For example:

  ```
  "users": {
      "$uid": {
          ".write": "auth != null && $uid ==== auth.uid",
          "friend_requests": {
              "$friend_request_id": {
                  ".write": "auth != null"
              }
          }
      }
  }
  ```

  - This will allow only the user to write to their data, except for the `friend_requests` node, in which other user will be able to write data too.
  - Note that the write rules from the `$uid` node also cascade to the `friend_requests` node, protecting the latter from other users making direct modifications to it as a whole. Consequently, the only allowed write operations on this structure for other users will be to append/delete data to the `friend_requests` node.
  - If a user deletes the last of the data in that node, Firebase will automatically delete it. Thus, this operation will be recognized as a Firebase deletion, and will not fall under the defined rules. Vice versa, create it if it is the first record in that node. There is no need to write to the node reference itself.

- For a more fine-grained managemene of the type of data that can be written into a node, use `.validate`. In the previous example:

  ```
  "users": {
      "$uid": {
          ".write": "auth != null && $uid ==== auth.uid",
          "friend_requests": {
              "$friend_request_id": {
                  ".validate": "(($uid === auth.uid && newData.val() === 'sent') || ($request_id === auth.uid && newData.val() === 'received') || newData.val() === null) && $uid != $request_id",
                  ".write": "auth != null"
              }
          }
      }
  }
  ```

  - This new rule ensures that the user can either add a `sent` request to their own node, add `received` request to other user's node, or delete a request. They also can not send a friend request to themselves.
  - The new, more granular logic, allows us to specify the type of data that is being written into the database.

- It might seem tricky to figure out whether to write a rule into `.validate` or `.read`/`.write`. As a rule of thumb, if the rule targets **who** is requesting the operation, `.read`/`.write` might be suitable. If specifying the type of data is what you are after, `.validate` should do the trick. More than anything, however, keep the cascading nature of each of these rule types in mind, and use it to your advantage to avoid redundancy, while keeping the rules clear and intuitive.

### Migrating the database

The database migration process is handled in a rather manual fashion. As of now, the procedure is as follows:

1. Make sure your `_dev` folder contains the folder `migrations`. This folder should in turn contain folders `input` and `output`.
2. Inside the `input` folder, place the database you want to migrate (do not rename it from the Firebase import).
3. Call the relevant migration script (located inside the `_dev/database/migration-scripts` folder) from the `_dev/main.tsx` file. You can run this file using either **bun**, or **ts-node**.
4. The output will be located in the `_dev/migrations/output` folder. From there, you can update the relevant database.

### Database maintenance

You can schedule database maintenance directly from the command line using `bun run maintenance:schedule`, provided you have the corresponding admin SDK. After the maintenance is over, you will have to cancel it through running `bun run maintenance:cancel`. For more detail, see the following sections.

#### Scheduling maintenance

1. In `.env`, set the environment of the database you want to schedule the maintenance for.
2. Place the admin SDK file of this database into the project root, and make sure the admin SDK paths in the `.env` file are configured correctly to point to this file.
3. From the project root, run

   ```bash
   bun run maintenance:schedule
   ```

   From there, follow the on-screen instructions.

#### Cancelling maintenance

1. Follow steps 1-2 from the previous section.
2. From the project root, run

   ```bash
   bun run maintenance:cancel
   ```

   and follow the on-screen instructions.

#### Understanding the maintenance mechanism

- Scheduling a maintenance will update the `config/maintenance` node of the database. Namely, the `maintenance_mode` will be set to `true`, while the start and end time will be set to your desired values. As long as the `maintenance_mode` flag is on, all users will be shown a maintenance screen upon opening the application.
- There is no in-built check to make sure the maintenance time is over. As such, the start/end times are purely of informational character. This is to allow the developers more flexibility. Consequently, after the actual maintenance is over and the app is ready to be made available to users, simply cancel the maintenance using the instructions in the [Cancelling maintenance](#cancelling-maintenance) section. This will set the `maintenance_mode` to false, allowing application access to users.

[qr link]: https://petrcala.github.io/Kiroku/assets/html/qr-link.html
