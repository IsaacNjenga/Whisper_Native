import { View, Text, StyleSheet, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import {
  CallContent,
  StreamCall,
  useStreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import Spinner from "react-native-loading-spinner-overlay";
import { useLocalSearchParams, useRouter } from "expo-router";
import ChatView from "@/components/ChatView";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

const Page = () => {
  const client = useStreamVideoClient();
  const [call, setCall] = useState(null);
  const { id } = useLocalSearchParams();
  const router = useRouter();

  console.log(id);

  useEffect(() => {
    if (!client) {
      console.log("Client not ready yet");
      return;
    }
    if (call) return;
    const joinCall = async () => {
      try {
        console.log("Joining call...", id);
        const call = client.call("default", id);
        await call.join({ create: true });
        console.log("Joined call!");
        setCall(call);
      } catch (error) {
        console.error("Failed to join call:", error);
      }
    };

    joinCall();
  }, [client, id]);

  const goToHomeScreen = async () => {
    router.back();
  };

  // if (!client || !id) return <Spinner visible textContent="Initializing..." />;
  // if (!call) return <Spinner visible textContent="Joining call..." />;

  if (!call) return null;

  return (
    <>
      <View style={{ flex: 1 }}>
        <Spinner visible={!call} />
        <StreamCall call={call}>
          <View style={styles.container}>
            <CallContent onHangupCallHandler={goToHomeScreen} />
            <View style={styles.chatContainer}>
              <ChatView channelId={id} />
            </View>
          </View>
        </StreamCall>
      </View>
    </>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: WIDTH > HEIGHT ? "row" : "column" },
  chatContainer: {
    flex: 1,
    backgroundColor: "#fff",
    textAlign: "center",
    justifyContent: "center",
  },
});
