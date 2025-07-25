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

  useEffect(() => {
    if (!client || call) return;
    const joinCall = async () => {
      console.log("Joining call...", id);
      const call = client.call("default", id);
      await call.join({ create: true });
      setCall(call);
    };
    joinCall();
  }, [client]);

  if (!call) return null;

  return (
    <View style={{ flex: 1 }}>
      <Spinner visible={!call} />
      <StreamCall call={call}>
        <CallContent />
      </StreamCall>
    </View>
  );
};

export default Page;
