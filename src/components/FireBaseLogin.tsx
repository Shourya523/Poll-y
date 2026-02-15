
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../utils/firebaseConfig";

export const handleGoogleSignIn = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
        console.log("Signed in with Google!");
    } catch (error) {
        console.error("Error signing in with Google:", error);
    }
};

