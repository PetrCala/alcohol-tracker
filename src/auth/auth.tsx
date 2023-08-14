import { useEffect } from "react";
import { 
    getAuth,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged
} from "firebase/auth";


export async function signUpUserWithEmailAndPassword(
    auth:any, 
    email:string, 
    password: string,
    ) {
    try{
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        return userCredential.user;
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
        throw new Error("User creation failed: " + error.message);
    };
}
