fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## Android

### android build

```sh
[bundle exec] fastlane android build
```

Generate a new local APK

### android beta

```sh
[bundle exec] fastlane android beta
```

Build and upload app to Google Play

### android production

```sh
[bundle exec] fastlane android production
```

Deploy app to Google Play open beta

----


## iOS

### ios build

```sh
[bundle exec] fastlane ios build
```

Generate a local iOS production build

### ios beta

```sh
[bundle exec] fastlane ios beta
```

Build and upload app to TestFlight

### ios production

```sh
[bundle exec] fastlane ios production
```

Move app to App Store Review

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
