<div align="center">
    <!-- <a href="https://link-here"> -->
        <img src="https://raw.githubusercontent.com/PetrCala/Kiroku/master/assets/logo/alcohol-tracker-source-icon.png
" width="64" height="64" alt="Kiroku Icon">
    <!-- </a> -->
    <h1>
        <!-- <a href="https://link-here"> -->
            Kiroku - Alcohol Tracker
        <!-- </a> -->
    </h1>
</div>

#### Table of Contents
* [How to run](#how-to-run)
* [For developers](#for-developers)

### How to run

- The application is currently available in closed beta both on the App Store and the Play Store. To access the beta version, [send us an email](mailto:kiroku.alcohol.tracker@gmail.com?subject=Beta%20Add%20Request), and we will add you into the team of internal testers.


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
    bun run bump-<SEMVER_LEVEL>
    ```

    where `<SEMVER_LEVEL>` can be one of the following:
    - **BUILD**: Increments the build version.
    - **PATCH**: Increments the patch version, where only small changes are introduced.
    - **MINOR**: Increments the minor version, where no API breakiing changes are introduced.
    - **MAJOR**: Increments the major version, where major, API breaking changes are introduced.

- The command creates a new commit in the current branch with the updated version. You can then push to origin these changes as you see fit.
- The command should always be ran **on the staging branch** and from the project root. No version updates should happen on the master branch, nor in smaller branches. This should help keep one source of truth. When merging to the staging branch, never accept changes from the incoming branch.
- We use semantic versioning.

## Building for Android

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

- Running `bun run build:android` may fail with insufficient permissions to open the *gradlew* file. In that case, run

    ```bash
    chmod +x ./android/gradlew
    ```

    to make the file readable.

## Formatting

- For typescript and javascript files, we use `Prettier`
- For bash scripts, we use `shell-format`

## Working with Firebase

- Firebase CLI is necessary for any Firebase tests/emulators to run correctly. In order to set up your local environment, run these commands first

    ```
    bun -g i firebase
    firebase login
    firebase init
    ```