import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// const auth = getAuth();

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