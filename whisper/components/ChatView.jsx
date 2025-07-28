import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useAuth } from "@/context/AuthContext";
import { Channel, Chat, MessageInput, MessageList } from "stream-chat-expo";

const STREAM_KEY = process.env.EXPO_PUBLIC_STREAM_ACCESS_KEY;

const ChatView = ({ channelId }) => {
  const chatClient = StreamChat.getInstance(STREAM_KEY);
  const { authState } = useAuth();

  const [channel, setChannel] = useState(null);

  useEffect(() => {
    const connectToChannel = async () => {
      const user = { id: authState?.user_id };

      await chatClient.connectUser(user, authState?.token);
      const channel = chatClient.channel("messaging", channelId);

      setChannel(channel);
      await channel.watch();
    };
    connectToChannel();

    return () => {
      channel?.stopWatching();
      chatClient.disconnectUser();
    };
  }, []);

  return (
    <View>
      {chatClient && channel ? (
        <Chat client={chatClient}>
          <Channel channel={channel}>
            <MessageList />
            <MessageInput />
          </Channel>
        </Chat>
      ) : (
        <View>
          <Text>Loading chat...</Text>
        </View>
      )}
    </View>
  );
};

export default ChatView;
