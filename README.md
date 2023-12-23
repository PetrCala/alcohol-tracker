## Kiroku - alcohol tracker

Track your everyday alcohol adventures using a natively ran application.

### How to run

#### Obtaining the application file directly

The application is obtainable per request from the developers in the form of an `.apk` file for Android devices, or an `IPA` file for iOS. Using this file, you can easily install the application by double tapping said file on your device. Make sure to enable installation from external sources on request.

#### Downloading the application file from Play Store or iOS Store

Once the application will reach version 1.0.0 (i.e. it will became fully functional), we intend to place it on both of the popular markets, where it will be easily accessible.


## For developers

### Accessing the documentation

1. Install `Sphinx` on your machine.
1. Navigate to the `docs` folder.
1. Run the command `make html`. This will create the documentation in the folder `build`.
1. Access the documentation by opening any of the created *.html* files.

### How to build/run

All the necessary steps are outlined in the developer documentation

### Updating the application version

- In the future, the application versioning will be rewritten into a github action. As of now, you can update the version (local, and for all platforms) using
    ```bash
    npm run bump-<SEMVER_LEVEL>
    ```

    where `<SEMVER_LEVEL>` can be one of the following:
    - **BUILD**: Increments the build version.
    - **PATCH**: Increments the patch version, where only small changes are introduced.
    - **MINOR**: Increments the minor version, where no API breakiing changes are introduced.
    - **MAJOR**: Increments the major version, where major, API breaking changes are introduced.

- The command creates a new commit in the current branch with the updated version. You can then push to origin these changes as you see fit.
- The command should always be ran **on the staging branch** and from the project root. No version updates should happen on the master branch, nor in smaller branches. This should help keep one source of truth. When merging to the staging branch, never accept changes from the incoming branch.
- We use semantic versioning.

### Local environment installation

```bash
bundle update
npm i
cd ios
pod install
```