import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Share,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  CallContent,
  StreamCall,
  useStreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import Spinner from "react-native-loading-spinner-overlay";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import ChatView from "@/components/ChatView";
import CustomBottomSheet from "@/components/CustomBottomSheet";
import CustomTopView from "@/components/CustomTopView";
import CustomCallControls from "@/components/CustomCallControl";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

const Page = () => {
  const client = useStreamVideoClient();
  const [call, setCall] = useState(null);
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={shareMeeting}>
          <Ionicons name="share-outline" size={24} color={"white"} />
        </TouchableOpacity>
      ),
    });
  }, []);

  // const unsubscribe = client.on(
  //   "all",
  //   (e) => {
  //     console.log(("e:", e.type));
  //     if (e.type === "call.reaction.new") {
  //       console.log(`New reaction: ${e.reaction}`);
  //     }
  //     if (e.type === "call.session_participant_joined") {
  //       console.log(`New user joined the call: ${e.participant}`);
  //       const user = e.participant.user.name;
  //       Toast.show({
  //         text1: "User joined",
  //         text2: `Say hello to ${user} 👋`,
  //       });
  //     }

  //     if (e.type === "call.session_participant_left") {
  //       console.log(`Someone left the call: ${e.participant}`);
  //       const user = e.participant.user.name;
  //       Toast.show({
  //         text1: "User left",
  //         text2: `Say goodbye to ${user} 👋`,
  //       });
  //     }
  //   },
  //   []
  // );

  const shareMeeting = async () => {
    Share.share({ message: `Join my meeting at https://meet.stream.io/${id}` });
    //myapp://(inside)/(room)/${id}
  };

  useEffect(() => {
    if (!client || call) {
      console.log("Client not ready yet");
      router.replace("/(inside)");
      return;
    }
    const joinCall = async () => {
      try {
        console.log("Joining call...", id);
        const call = client.call("default", id);
        await call.join({ create: true });
        Toast.show({
          text1: "Call joined",
          text2: `Meeting id: ${id}`,
        });
        console.log("Joined call!");
        setCall(call);
      } catch (error) {
        console.error("Failed to join call:", error);
      }
    };

    joinCall();
  }, [client, id]);

  const goToHomeScreen = async () => {
    router.replace("/(inside)");
  };

  if (!client || !id) return <Spinner visible textContent="Initializing..." />;
  if (!call) return <Spinner visible textContent="Joining call..." />;

  if (!call) return null;

  return (
    <>
      <View style={{ flex: 1 }}>
        <Spinner visible={!call} />
        <StreamCall call={call}>
          <View style={styles.container}>
            <CallContent
              CallTopView={CustomTopView}
              CallControls={CustomCallControls}
              onHangupCallHandler={goToHomeScreen}
            />
            {WIDTH > HEIGHT ? (
              <View style={styles.chatContainer}>
                <ChatView channelId={id} />
              </View>
            ) : (
              <CustomBottomSheet channelId={id} />
            )}
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
