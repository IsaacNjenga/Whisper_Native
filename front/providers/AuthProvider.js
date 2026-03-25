import { auth } from "./FirebaseProvider";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

//get ID token and send to backend
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken(); //issued by firebase
  return { user: result.user, idToken };
};
