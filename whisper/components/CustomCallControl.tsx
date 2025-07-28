import {
  CallControlProps,
  useCall,
  HangUpCallButton,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  ToggleCameraFaceButton,
  ReactionsButton,
  StreamReactionType,
} from "@stream-io/video-react-native-sdk";
import React from "react";
import { View, StyleSheet, Button } from "react-native";
import Colors from "../constants/Colors";

export const reactions: StreamReactionType[] = [
  {
    type: "reaction",
    emoji_code: ":smile:",
    custom: {},
    icon: "😊",
  },
  {
    type: "raised-hand",
    emoji_code: ":raise-hand:",
    custom: {},
    icon: "✋",
  },
  {
    type: "reaction",
    emoji_code: ":fireworks:",
    custom: {},
    icon: "🎉",
  },
  {
    type: "reaction",
    emoji_code: ":like:",
    custom: {},
    icon: "😍",
  },
];

// Custom View for the call controls and reactions
const CustomCallControls = (props: CallControlProps) => {
  const call = useCall();

  const onLike = () => {
    const reaction = {
      type: "reaction",
      emoji_code: ":like:",
      custom: {},
      icon: "😍",
    };
    call?.sendReaction(reaction);
  };

  return (
    <View style={styles.customCallControlsContainer}>
      <ToggleAudioPublishingButton
        onPressHandler={() => call?.microphone.toggle()}
      />
      <ToggleVideoPublishingButton
        onPressHandler={() => call?.camera.toggle()}
      />
      <ToggleCameraFaceButton onPressHandler={() => call?.camera.flip()} />
      <HangUpCallButton onHangupCallHandler={props.onHangupCallHandler} />
      <ReactionsButton supportedReactions={reactions} />
      {/* <Button onPress={onLike} title="Like!" color={Colors.secondary} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  customCallControlsContainer: {
    position: "absolute",
    top: 10,
    gap: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#1d4fe62c",
    borderRadius: 50,
    borderColor: Colors.primary,
    borderWidth: 1,
    zIndex: 5,
    flexDirection: "row",
    marginHorizontal: 50,
  },
});

export default CustomCallControls;
