# Firebase Functions

- From inside the project root, run
    ```
    npm run transpile
    ```

    which will build the functions project.
  
- Navigate to the `functions/` folder and run
    ```
    npm run build
    ```

    this will build the lib files in the `functions/lib/` folder so that the functions there can be exported into the Firebase Functions.

- Run
    ```
    npm run deploy
    ```

    to deploy the functions from the lib file into the firebase functions or
    ```
    npm run serve
    ```
    
    to simply test these.


- To do this from the source folder, run
    ```
    npm run deploy-functions
    ```
