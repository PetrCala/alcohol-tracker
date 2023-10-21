# Firebase Functions

- Navigate to the functions folder first
    ```
    cd functions
    ```
- From inside the folder, run
    ```
    npm run transpile
    ```

    which will build the functions project in the `functions/lib/` folder.
  
- Next, run
    ```
    npm run babel
    ```

    this will translate the lib files in the `functions/lib/` folder so that the functions there can be exported into the Firebase Functions.

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
