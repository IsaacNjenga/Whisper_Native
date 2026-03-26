import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { useEffect, useRef } from "react";

WebBrowser.maybeCompleteAuthSession();

function getGoogleClientId(...values) {
  return values.find(
    (value) =>
      typeof value === "string" &&
      value.endsWith(".apps.googleusercontent.com"),
  );
}

export function useGoogleAuth() {
  const authScheme = Array.isArray(Constants.expoConfig?.scheme)
    ? Constants.expoConfig.scheme[0]
    : Constants.expoConfig?.scheme || "front";

  const fallbackClientId = getGoogleClientId(
    process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
  );

  const [request, response, rawPromptAsync] = Google.useIdTokenAuthRequest({
    clientId: fallbackClientId,
    androidClientId: getGoogleClientId(
      process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
      fallbackClientId,
    ),
    selectAccount: true,
    scopes: ["openid", "profile", "email"],
  }, {
    scheme: authScheme,
    path: "oauthredirect",
  });

  const pendingResultRef = useRef(null);

  useEffect(() => {
    if (!pendingResultRef.current || !response) {
      return;
    }

    const idToken =
      response.params?.id_token || response.authentication?.idToken;
    const { resolve, timeoutId } = pendingResultRef.current;

    if (response.type === "success" && idToken) {
      clearTimeout(timeoutId);
      pendingResultRef.current = null;
      resolve(response);
      return;
    }

    if (response.type !== "success") {
      clearTimeout(timeoutId);
      pendingResultRef.current = null;
      resolve(response);
    }
  }, [response]);

  useEffect(() => {
    return () => {
      if (!pendingResultRef.current) {
        return;
      }

      clearTimeout(pendingResultRef.current.timeoutId);
      pendingResultRef.current.reject(
        new Error("Google sign-in was interrupted before it finished."),
      );
      pendingResultRef.current = null;
    };
  }, []);

  async function promptAsync(options) {
    const result = await rawPromptAsync(options);
    const idToken = result?.params?.id_token || result?.authentication?.idToken;

    if (result?.type !== "success" || idToken) {
      return result;
    }

    return await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        pendingResultRef.current = null;
        reject(
          new Error("Google sign-in timed out while waiting for the ID token."),
        );
      }, 15000);

      pendingResultRef.current = {
        resolve,
        reject,
        timeoutId,
      };
    });
  }

  return { request, response, promptAsync };
}
