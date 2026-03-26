// import { auth } from "./FirebaseProvider";
// import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// //get ID token and send to backend
// export const signInWithGoogle = async () => {
//   const provider = new GoogleAuthProvider();
//   const result = await signInWithPopup(auth, provider);
//   const idToken = await result.user.getIdToken(); //issued by firebase
//   return { user: result.user, idToken };
// };

import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    // expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    responseType: "code", 
    scopes: ["openid", "profile", "email"], 
    // androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    // useProxy: true,
    // iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  return { request, response, promptAsync };
}
