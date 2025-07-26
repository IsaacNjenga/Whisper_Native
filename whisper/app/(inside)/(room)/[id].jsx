import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import {
  CallContent,
  StreamCall,
  useStreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import Spinner from "react-native-loading-spinner-overlay";
import { useLocalSearchParams } from "expo-router";

const Page = () => {
  const client = useStreamVideoClient();
  const [call, setCall] = useState(null);
  const { id } = useLocalSearchParams();

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

  // if (!client || !id) return <Spinner visible textContent="Initializing..." />;
  // if (!call) return <Spinner visible textContent="Joining call..." />;

  if (!call) return null;

  return (
    <>
      <View style={{ flex: 1 }}>
        <Spinner visible={!call} />
        <StreamCall call={call}>
          <CallContent />
        </StreamCall>
      </View>
    </>
  );
};

export default Page;
