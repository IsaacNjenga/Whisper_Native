import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const isWeb = Platform.OS === "web";

export const storage = {
  async getItem(key) {
    if (isWeb) {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },

  async setItem(key, value) {
    // SecureStore only accepts strings — guard against null/undefined
    const stringValue =
      value === null || value === undefined
        ? ""
        : typeof value === "string"
          ? value
          : String(value);

    if (isWeb) {
      localStorage.setItem(key, stringValue);
      return;
    }
    await SecureStore.setItemAsync(key, stringValue);
  },

  async deleteItem(key) {
    if (isWeb) {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },

  async clear(...keys) {
    for (const key of keys) {
      await this.deleteItem(key);
    }
  },
};
