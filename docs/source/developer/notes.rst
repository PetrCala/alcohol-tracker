==================================================
Devloper documentation
==================================================


This is the main documentation for running the project.

Prerequisites
================================

#. Install `node.js <https://nodejs.org/>`_.
#. Install the `Java SE Development Kit (JDK)  <https://www.oracle.com/java/technologies/downloads/#java17>`_. We recommend you use the long-term-supported version 17. After the installation, open the *Edit environment variables for your account* window from the Windows control pannel, and ADD a new variable named *JAVA_HOME*. Set its value to the installed folder of the JDK (most likely :code:`C:\\ProgramFiles\\Java\\jdk-{version-name}\\`)
#. Install React Native by running :code:`npx react native`


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

Running the application on an android device
================================

#. Connect your Android device to your computer using a USB cable.
#. Enable USB debugging on your device by going to `Settings \> Developer options \> USB debugging`.
#. In your project directory, run the command :code:`npm run android`. This will start the Metro bundler and build your app.
#. When the build is complete, your app will be installed and launched on your connected device automatically.
    * Note that you'll need to have the Android development environment set up on your computer, including the Android SDK and the Android platform tools, in order to use this command. You can follow the React Native documentation for instructions on setting up your development environment for Android.