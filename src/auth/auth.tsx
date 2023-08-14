import { useEffect } from "react";
import { 
    getAuth,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged
} from "firebase/auth";
import { pushNewUserInfo } from "../database/users";


/** Create a new user in the database
 * 
 * @param auth 
 * @param email 
 * @param password 
 * @returns 
 */
export async function signUpUserWithEmailAndPassword(
    auth:any, 
    email:string, 
    password: string,
    ) {
    try{
        // const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        // return userCredential.user;
        await createUserWithEmailAndPassword(auth, email, password)
    } catch (error:any) {
        throw new Error("User creation failed: " + error.message);
    };
};

export async function signInUserWithEmailAndPassword(
    auth:any, 
    email:string, 
    password: string,
) {
    try{
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        return userCredential.user;
    } catch (error:any) {
        throw new Error("User login failed: " + error.message);
    };
}
