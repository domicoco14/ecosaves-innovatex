import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';

export const GroupChatScreen = ({ route, navigation }) => {
  const groupName = route.params?.groupName || 'Yaba Traders Ajo';
  const user = useAuthStore((state) => state.user);

  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'Bisi Adeyemi',
      text: "Good morning everyone! Just confirming I've sent my contribution for this week.",
      time: '09:15 AM',
      isUser: false,
      isSystem: false,
    },
    {
      id: '2',
      systemText: '✓ Bisi Adeyemi contributed ₦50,000',
      isSystem: true,
    },
    {
      id: '3',
      sender: 'Emeka Okafor',
      text: 'Seen. Mine will drop before 2PM today.',
      time: '09:22 AM',
      isUser: false,
      isSystem: false,
    },
    {
      id: '4',
      sender: `${user?.first_name || 'Dominion'} ${user?.last_name || 'Akinsola'}`,
      text: "Great, thanks everyone. The pool is looking healthy this month. Let's keep the momentum going!",
      time: '09:45 AM',
      isUser: true,
      isSystem: false,
    },
  ]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage = {
      id: String(Date.now()),
      sender: `${user?.first_name || 'Dominion'} ${user?.last_name || 'Akinsola'}`,
      text: messageText.trim(),
      time: 'Just now',
      isUser: true,
      isSystem: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageText('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Custom Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerGroupInfo}>
            <View style={styles.headerAvatar}>
              <Text style={styles.avatarText}>YT</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>{groupName}</Text>
              <Text style={styles.headerSub}>12 Members • 4 Online</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.moreBtn}>
            <Text style={styles.moreText}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Chat Feed */}
        <ScrollView
          contentContainerStyle={styles.chatScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Date Divider */}
          <View style={styles.dateDivider}>
            <Text style={styles.dateText}>Today</Text>
          </View>

          {messages.map((msg) => {
            if (msg.isSystem) {
              return (
                <View key={msg.id} style={styles.systemBanner}>
                  <Text style={styles.systemBannerText}>{msg.systemText}</Text>
                </View>
              );
            }

            return (
              <View
                key={msg.id}
                style={[
                  styles.msgRow,
                  msg.isUser ? styles.msgRowUser : styles.msgRowMember,
                ]}
              >
                {!msg.isUser && (
                  <View style={styles.senderAvatar}>
                    <Text style={styles.senderAvatarText}>
                      {msg.sender.charAt(0)}
                    </Text>
                  </View>
                )}

                <View
                  style={[
                    styles.msgBubble,
                    msg.isUser ? styles.bubbleUser : styles.bubbleMember,
                  ]}
                >
                  {!msg.isUser && (
                    <Text style={styles.senderName}>{msg.sender}</Text>
                  )}
                  <Text
                    style={[
                      styles.msgText,
                      msg.isUser ? styles.msgTextUser : styles.msgTextMember,
                    ]}
                  >
                    {msg.text}
                  </Text>

                  <View style={styles.msgFooter}>
                    <Text
                      style={[
                        styles.msgTime,
                        msg.isUser ? styles.msgTimeUser : styles.msgTimeMember,
                      ]}
                    >
                      {msg.time}
                    </Text>
                    {msg.isUser && <Text style={styles.readCheck}> ✓✓</Text>}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Bottom Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.clipBtn}>
            <Text style={styles.clipIcon}>📎</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#737980"
            value={messageText}
            onChangeText={setMessageText}
          />

          <TouchableOpacity
            style={styles.sendBtn}
            onPress={handleSendMessage}
            activeOpacity={0.8}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F9F9',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  backBtn: {
    paddingRight: 10,
  },
  backArrow: {
    fontSize: 22,
    fontWeight: '700',
    color: '#005B7F',
  },
  headerGroupInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E98591',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#161C20',
  },
  headerSub: {
    fontSize: 11,
    color: '#737980',
    marginTop: 1,
  },
  moreBtn: {
    paddingLeft: 10,
  },
  moreText: {
    fontSize: 22,
    color: '#737980',
  },
  chatScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  dateDivider: {
    alignSelf: 'center',
    backgroundColor: '#EAEFF2',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#737980',
  },
  systemBanner: {
    backgroundColor: '#FEF9E7',
    borderColor: '#F9E79F',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'center',
    marginBottom: 16,
  },
  systemBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B78103',
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 14,
    maxWidth: '82%',
  },
  msgRowMember: {
    alignSelf: 'flex-start',
  },
  msgRowUser: {
    alignSelf: 'flex-end',
  },
  senderAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D0E3EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  senderAvatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#005B7F',
  },
  msgBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMember: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  bubbleUser: {
    backgroundColor: '#005B7F',
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#737980',
    marginBottom: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 19,
  },
  msgTextMember: {
    color: '#161C20',
  },
  msgTextUser: {
    color: '#FFFFFF',
  },
  msgFooter: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginTop: 4,
    alignItems: 'center',
  },
  msgTime: {
    fontSize: 10,
  },
  msgTimeMember: {
    color: '#737980',
  },
  msgTimeUser: {
    color: '#BAE6FD',
  },
  readCheck: {
    color: '#BAE6FD',
    fontSize: 10,
    fontWeight: '800',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  clipBtn: {
    padding: 8,
  },
  clipIcon: {
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F0F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#161C20',
    marginHorizontal: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#005B7F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
