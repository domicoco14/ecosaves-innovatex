import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';

const formatTime = (value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const GroupChatScreen = ({ route, navigation }) => {
  const circle = route.params?.circle || {};
  const user = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState('');
  const listRef = useRef(null);
  const nearBottomRef = useRef(true);

  const loadMessages = useCallback(async (showLoading = false) => {
    if (!circle.id) {
      setLoadError('Circle information is unavailable. Reopen chat from your circle.');
      setLoading(false);
      return;
    }
    if (showLoading) setLoading(true);
    try {
      const response = await api.get(`/circles/${circle.id}/messages`);
      setMessages((current) => {
        const combined = new Map(current.map((message) => [message.id, message]));
        response.data.forEach((message) => combined.set(message.id, message));
        return [...combined.values()].sort((left, right) => new Date(left.created_at) - new Date(right.created_at));
      });
      setLoadError('');
    } catch (err) {
      setLoadError(err.response?.data?.detail || 'Could not load circle messages.');
    } finally {
      setLoading(false);
    }
  }, [circle.id]);

  useFocusEffect(useCallback(() => {
    loadMessages(true);
    const interval = setInterval(() => loadMessages(false), 5000);
    return () => clearInterval(interval);
  }, [loadMessages]));

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const response = await api.post(`/circles/${circle.id}/messages`, { content });
      setMessages((current) => [...current, response.data]);
      setDraft('');
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch (err) {
      Alert.alert('Message not sent', err.response?.data?.detail || 'Check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView style={styles.keyboardFrame} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.chatHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.circleName} numberOfLines={1}>{circle.name || 'Circle chat'}</Text>
            <Text style={styles.memberCount}>{circle.members_count || 0} members · private to this circle</Text>
          </View>
          <View style={styles.headerMark}><Text style={styles.headerMarkText}>•••</Text></View>
        </View>

        <View style={styles.messagesArea}>
          {loading ? <Text style={styles.stateMessage}>Loading messages…</Text> : null}
          {loadError ? <Text style={styles.errorMessage}>{loadError}</Text> : null}
          {!loading && !loadError && messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Start the conversation</Text>
              <Text style={styles.emptySub}>Messages are visible to members of this circle.</Text>
            </View>
          ) : null}
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            keyboardShouldPersistTaps="handled"
            onScroll={(event) => {
              const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
              nearBottomRef.current = contentSize.height - (contentOffset.y + layoutMeasurement.height) < 100;
            }}
            scrollEventThrottle={200}
            onContentSizeChange={() => {
              if (nearBottomRef.current) listRef.current?.scrollToEnd({ animated: false });
            }}
            renderItem={({ item }) => {
              const isMine = item.user_id === user?.id;
              return (
                <View style={[styles.messageRow, isMine && styles.messageRowMine]}>
                  {!isMine ? (
                    <View style={styles.senderAvatar}>
                      <Text style={styles.senderAvatarText}>{(item.sender_name || 'M').charAt(0).toUpperCase()}</Text>
                    </View>
                  ) : null}
                  <View style={[styles.messageBlock, isMine && styles.messageBlockMine]}>
                    {!isMine ? <Text style={styles.senderName}>{item.sender_name}</Text> : null}
                    <View style={[styles.bubble, isMine ? styles.ownBubble : styles.otherBubble]}>
                      <Text style={[styles.messageText, isMine && styles.ownMessageText]}>{item.content}</Text>
                    </View>
                    <Text style={[styles.messageTime, isMine && styles.messageTimeMine]}>{formatTime(item.created_at)}</Text>
                  </View>
                </View>
              );
            }}
          />
        </View>

        <View style={styles.composer}>
          <TextInput
            style={styles.messageInput}
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message…"
            placeholderTextColor="#89939A"
            multiline
            maxLength={2000}
            returnKeyType="default"
            blurOnSubmit={false}
            textAlignVertical="center"
          />
          <TouchableOpacity
            style={[styles.sendButton, (!draft.trim() || sending) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!draft.trim() || sending}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Text style={styles.sendIcon}>{sending ? '…' : '➤'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F6F9F9', flex: 1 },
  keyboardFrame: { flex: 1 },
  chatHeader: { alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomColor: '#E9EEF0', borderBottomWidth: 1, flexDirection: 'row', minHeight: 66, paddingHorizontal: 14 },
  backButton: { alignItems: 'center', height: 42, justifyContent: 'center', width: 34 },
  backText: { color: '#005B7F', fontSize: 34, lineHeight: 38 },
  headerCopy: { flex: 1, paddingHorizontal: 8 },
  circleName: { color: '#161C20', fontSize: 15, fontWeight: '800' },
  memberCount: { color: '#737980', fontSize: 10, marginTop: 3 },
  headerMark: { alignItems: 'center', height: 36, justifyContent: 'center', width: 34 },
  headerMarkText: { color: '#737980', fontSize: 18, fontWeight: '800' },
  messagesArea: { flex: 1, paddingHorizontal: 14 },
  messageList: { flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 16, paddingTop: 18 },
  stateMessage: { color: '#737980', fontSize: 12, padding: 16, textAlign: 'center' },
  errorMessage: { color: '#B42318', fontSize: 12, padding: 14, textAlign: 'center' },
  emptyState: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  emptyTitle: { color: '#161C20', fontSize: 16, fontWeight: '800', marginBottom: 5 },
  emptySub: { color: '#737980', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  messageRow: { alignItems: 'flex-end', flexDirection: 'row', marginBottom: 14 },
  messageRowMine: { justifyContent: 'flex-end' },
  senderAvatar: { alignItems: 'center', backgroundColor: '#D5EAF2', borderRadius: 16, height: 32, justifyContent: 'center', marginBottom: 18, marginRight: 8, width: 32 },
  senderAvatarText: { color: '#005B7F', fontSize: 12, fontWeight: '800' },
  messageBlock: { maxWidth: '82%' },
  messageBlockMine: { alignItems: 'flex-end' },
  senderName: { color: '#005B7F', fontSize: 10, fontWeight: '800', marginBottom: 4, marginLeft: 4 },
  bubble: { borderRadius: 15, paddingHorizontal: 13, paddingVertical: 10 },
  otherBubble: { backgroundColor: '#E8ECEE', borderBottomLeftRadius: 5 },
  ownBubble: { backgroundColor: '#005B7F', borderBottomRightRadius: 5 },
  messageText: { color: '#161C20', fontSize: 13, lineHeight: 19 },
  ownMessageText: { color: '#FFFFFF' },
  messageTime: { color: '#89939A', fontSize: 9, marginTop: 4, marginHorizontal: 4 },
  messageTimeMine: { textAlign: 'right' },
  composer: { alignItems: 'flex-end', backgroundColor: '#FFFFFF', borderTopColor: '#E9EEF0', borderTopWidth: 1, flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10 },
  messageInput: { backgroundColor: '#F0F3F5', borderRadius: 18, color: '#161C20', flex: 1, fontSize: 13, maxHeight: 110, minHeight: 42, paddingHorizontal: 15, paddingVertical: 10 },
  sendButton: { alignItems: 'center', backgroundColor: '#005B7F', borderRadius: 21, height: 42, justifyContent: 'center', marginLeft: 9, width: 42 },
  sendButtonDisabled: { backgroundColor: '#A8C1CC' },
  sendIcon: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
});