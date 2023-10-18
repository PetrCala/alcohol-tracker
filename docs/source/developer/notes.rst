==================================================
Devloper documentation
==================================================


This is the main documentation for running the project.


Prerequisites
================================

#. Install `node.js <https://nodejs.org/>`_.
#. Install the `Java SE Development Kit (JDK)  <https://www.oracle.com/java/technologies/downloads/#java17>`_. We recommend you use the long-term-supported version 17. After the installation, open the *Edit environment variables for your account* window from the Windows control pannel, and ADD a new variable named *JAVA_HOME*. Set its value to the installed folder of the JDK (most likely :code:`C:\\ProgramFiles\\Java\\jdk-{version-name}\\`)
#. Install React Native by running :code:`npx react native`


Setting up the project after cloning the repository
================================
#. Install all dependencies using :code:`npm i`.
#. If you wish to update all packages to the latest version (not recommended), run the following commands:
:code:`npm i -g npm-check-updates`
:code:`ncu -u`
:code:`npm install`
#. In the project root folder, create a file :code:`.env`, and inside, put the custom settings to the database you want to connect to. As a template, the file should look like this:
:code:`API_KEY=YOUR_API_KEY`
:code:`AUTH_DOMAIN=YOUR_AUTH_DOMAIN`
:code:`DATABASE_URL=YOUR_DATABASE_URL`
:code:`PROJECT_ID=YOUR_PROJECT_ID`
:code:`STORAGE_BUCKET=YOUR_STORAGE_BUCKET`
:code:`MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID`
:code:`APP_ID=YOUR_APP_ID`


Setting up the project from scratch
================================

#. If you need to set up the project from scratch (not clone it from the GitHub repository), we recommend you follow the `official documentation <https://reactnative.dev/docs/environment-setup>`_.
    * Initialize the project using :code:`npx react-native init alcohol_tracker --template react-native-template-typescript --npm`
    * It is good to keep the best practice when it comes to folder organization. Please keep in line with the GitHub folder structuring when recreating the project from scratch.


Running the application using an emulator
================================

#. To start the bundler, go inside the project directory, and run :code:`npm start`.
#. Install an emulator in your machine:
    * Android: We recommend you use `Android Studio <https://developer.android.com/studio>`_. Set up the android studio using the `official React Native documentation <https://reactnative.dev/docs/environment-setup>`_, and create an emulator device.
#. Start up the emulator device.
#. You can run the application in the Android environent by using :code:`npm run android` from the project root directory.
#. If all went right, you should see the application open in the emulator device.


Running the application on an Android device
================================

#. You can follow the official documentation for setting up the Android environment `here <https://reactnative.dev/docs/running-on-device>`_.
#. Make sure the Android Debug Bridge is traceable by your computer. This means putting the :code:`Android\\sdk\\platform_tools\\` folder into your system PATH.
#. Connect your Android device to your computer using a USB cable.
#. Enable USB debugging on your device by going to :code:`Settings\\Developer options\\USB debugging`.
#. Check that your computer is able to detect the device by running :code:`adb devices`. If it is not, try checking `here <https://stackoverflow.com/questions/21170392/my-android-device-does-not-appear-in-the-list-of-adb-devices>`_.
#. In your project directory, run the command :code:`npm run android`. This will start the Metro bundler and build your app.
#. To reduce building time in a development environment, you can append the flag :code:`--active-arch-only`, which will build the application for the current Application Binary Interface (ABI) only, improving the native build time by a ~75% factor. Example: :code:`npm run android --active-arch-only` or :code:`npx react-native run-android --active-arch-only`
#. When the build is complete, your app will be installed and launched on your connected device automatically.
    * Note that you'll need to have the Android development environment set up on your computer, including the Android SDK and the Android platform tools, in order to use this command. You can follow the React Native documentation for instructions on setting up your development environment for Android.

Building the application for an Android device
================================

#. You can build the *.apk* version of the application by running :code:`npx react-native run-android`. In that case, the output will be stored in the :code:`android\\app\\build\\outputs\\apk\\` folder.
#. If you append the flag :code:`--mode=debug`, the file will be stored in the *apk* folder, while with the flag :code:`--mode=release`, it will be stored in the *release* folder.
#. To build the application for the App Store Console (*.aab*), run the command :code:`npx react-native build-android` with the respective flags. The output will be stored in the :code:`android\\app\\build\\outputs\\bundle\\` folder.
#. The *.apk* files can be instaled by double tapping, while the *.aab* file is meant for distribution through the App Store Console.
#. As when with running the device only, you may append the flag :code:`--active-arch-only` to drastically improve the build time.

Running the application on an iOS device
================================

#. You can follow the `official documentation <https://reactnative.dev/docs/running-on-device>`_ for setting up the iOS environment.

Building the application for an iOS device
================================

#. Open your React Native project in Xcode.
#. Select the project in the Project navigator, and then select your app's target.
#. Under the *General* tab, change the *Bundle Identifier* to something unique (e.g., :code:`com.yourcompany.yourapp`).
#. Under the *Signing & Capabilities* tab, select a development team and make sure a valid provisioning profile is selected.
#. Select *Product* from the menu bar, and then select *Archive*.
#. Once the build is complete, select *Distribute App* and then select *Ad Hoc*.
#. Follow the prompts to export the :code:`IPA file`, which you can then transfer to your friend's iOS device using a file-sharing service like Dropbox or Google Drive.
#. You may need to enable the new architecture on iOS. See `this library<https://github.com/react-native-image-picker/react-native-image-picker>`_ as an example of a module that employs the new architecture.

Updating the app version
================================
* Modify the version in the :code:`package.json` file by incrementing the version numbers as necessary.
* Navigate to the project root folder and run :code:`npm install` to update the dependencies in your project.

Building the documentation
================================
* Build the documentation using a command :code:`make html`. If the *make* is not recognized, call the *make.bat* file directly using :code:`docs\make.bat html`.