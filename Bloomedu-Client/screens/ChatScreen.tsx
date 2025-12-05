import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { useFocusEffect } from '@react-navigation/native';

interface Message {
  id: number;
  sender_id: number;
  sender_type: 'parent' | 'teacher';
  receiver_id: number;
  message_text: string;
  created_at: string;
  category: string;
  child_id?: number;
  content_type: 'text' | 'image';
  content_url?: string;
  is_read?: boolean;
}

const BASE_URL = 'https://bloomedu-production.up.railway.app';

const ChatScreen = ({ route, navigation }: any) => {
  const finalChildId =
    route.params.childId ||
    route.params.child_id ||
    route.params.child?.id ||
    null;

  const category = route.params.category;
  const categoryTitle = route.params.categoryTitle;
  const categoryColor = route.params.categoryColor;
  const otherUserId = route.params.otherUserId;
  const isTeacher = route.params.isTeacher;
  const childName = route.params.childName || 'Child';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [myUserId, setMyUserId] = useState<number | null>(null);

  const flatListRef = useRef<FlatList>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const markMessagesAsRead = async (myId: number) => {
    if (!myId || !finalChildId) return;

    try {
      await fetch(`${BASE_URL}/messages/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: otherUserId,
          receiver_id: myId,
          category,
          child_id: finalChildId,
        }),
      });
    } catch (e) {
      console.log('mark-read error:', e);
    }
  };

  const fetchMessages = async (myId: number) => {
    if (!finalChildId) return;
    setLoading(true);

    try {
      const res = await fetch(
        `${BASE_URL}/messages?user1_id=${myId}&user2_id=${otherUserId}&category=${category}&child_id=${finalChildId}`
      );

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        console.log('JSON ERROR:', text.substring(0, 150));
        return;
      }

      if (json.success) {
        setMessages(json.messages);
      }

      await markMessagesAsRead(myId);
    } catch (err) {
      console.log('fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserAndMessages = async () => {
    try {
      const key = isTeacher ? 'teacher_id' : 'parent_id';
      const idString = await AsyncStorage.getItem(key);
      if (!idString) return;

      const uid = parseInt(idString, 10);
      setMyUserId(uid);

      fetchMessages(uid);
    } catch (e) {
      console.log('load user error:', e);
    }
  };

  useEffect(() => {
    loadUserAndMessages();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (myUserId && finalChildId) {
        markMessagesAsRead(myUserId);
      }
    }, [myUserId, finalChildId])
  );

  const handleSend = async (
    type: 'text' | 'image',
    content: string,
    url?: string
  ) => {
    if (!myUserId || !finalChildId) return;
    if (type === 'text' && !content.trim()) return;

    setSending(true);

    const payload = {
      sender_id: myUserId,
      sender_type: isTeacher ? 'teacher' : 'parent',
      receiver_id: otherUserId,
      category,
      child_id: finalChildId,
      message_text: content,
      content_type: type,
      content_url: url || '',
    };

    try {
      const res = await fetch(`${BASE_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let json;

      try {
        json = JSON.parse(text);
      } catch {
        console.log('SEND JSON ERROR:', text);
        return;
      }

      if (json.success) {
        setInputText('');
        fetchMessages(myUserId);
      }
    } catch (err) {
      console.log('send error:', err);
    } finally {
      setSending(false);
    }
  };

  const onPickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
    });

    if (result.assets?.length > 0) {
      const a = result.assets[0];
      if (a.base64) {
        const uri = `data:${a.type};base64,${a.base64}`;
        handleSend('image', '📷 Photo', uri);
      }
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === myUserId;

    return (
      <View
        style={[
          styles.bubble,
          isMe ? styles.myBubble : styles.otherBubble,
        ]}
      >
        {item.content_type === 'image' && item.content_url ? (
          <Image source={{ uri: item.content_url }} style={styles.chatImage} />
        ) : (
          <Text
            style={[
              styles.messageText,
              isMe ? styles.myText : styles.otherText,
            ]}
          >
            {item.message_text}
          </Text>
        )}

        <View style={styles.bubbleFooter}>
          <Text
            style={[
              styles.timeText,
              isMe ? styles.myTime : styles.otherTime,
            ]}
          >
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {isMe && (
            <Text style={styles.readReceipt}>
              {item.is_read ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: categoryColor }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{categoryTitle}</Text>
          <Text style={styles.headerSubtitle}>{childName}</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* MESSAGES */}
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />
      )}

      {/* INPUT */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity
            onPress={onPickImage}
            style={styles.attachButton}
          >
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: categoryColor },
            ]}
            disabled={sending || !inputText.trim()}
            onPress={() => handleSend('text', inputText.trim())}
          >
            {sending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>→</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },

  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },

  backButtonText: { fontSize: 24, color: '#FFF', fontWeight: 'bold' },

  headerInfo: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.9)' },

  listContent: { padding: 20 },

  bubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },

  myBubble: { alignSelf: 'flex-end', backgroundColor: '#4ECDC4' },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  messageText: { fontSize: 16 },
  myText: { color: '#FFF' },
  otherText: { color: '#333' },

  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
    alignItems: 'center',
  },

  timeText: { fontSize: 10 },
  myTime: { color: 'rgba(255,255,255,0.8)' },
  otherTime: { color: '#999' },

  readReceipt: { marginLeft: 6, color: '#FFF', fontSize: 10 },

  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  attachButton: { padding: 8 },
  attachIcon: { fontSize: 24, color: '#555' },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendButtonText: { fontSize: 22, color: '#FFF', fontWeight: 'bold' },

  chatImage: { width: 200, height: 150, borderRadius: 12, marginBottom: 8 },
});
