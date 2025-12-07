import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
  const isTeacher: boolean = route.params.isTeacher;
  const childName = route.params.childName || 'Child';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [myUserId, setMyUserId] = useState<number | null>(null);

  const flatListRef = useRef<FlatList>(null);
  
  // Canlı sohbet hissi için interval referansı
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const myType: 'parent' | 'teacher' = isTeacher ? 'teacher' : 'parent';

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    loadUserAndMessages();

    // Sayfadan çıkınca polling'i temizle
    return () => stopPolling();
  }, []);

  // 3 Saniyede bir yeni mesaj var mı diye kontrol et (Basit Real-time)
  const startPolling = useCallback((uid: number) => {
    stopPolling();
    pollingRef.current = setInterval(() => {
      fetchMessages(uid, true); // true = silent loading (loading spinner gösterme)
    }, 3000); 
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const markMessagesAsRead = useCallback(async () => {
    if (!myUserId || !finalChildId) return;

    try {
      await fetch(`${BASE_URL}/messages/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: otherUserId,
          receiver_id: myUserId,
          category,
          child_id: finalChildId,
        }),
      });
    } catch (e) {
      console.log('mark-read error:', e);
    }
  }, [myUserId, finalChildId, otherUserId, category]);

  // Ekran focus olduğunda okundu yap ve polling başlat
  useFocusEffect(
    useCallback(() => {
      if (myUserId && finalChildId) {
        markMessagesAsRead();
        startPolling(myUserId);
      }
      return () => stopPolling(); // Ekran flulaşınca durdur (performans için)
    }, [myUserId, finalChildId, markMessagesAsRead, startPolling, stopPolling])
  );

  const loadUserAndMessages = async () => {
    try {
      const key = isTeacher ? 'teacher_id' : 'parent_id';
      const idString = await AsyncStorage.getItem(key);

      if (!idString) return;

      const uid = parseInt(idString, 10);
      setMyUserId(uid);

      await fetchMessages(uid);
    } catch (e) {
      console.log('load user error:', e);
    }
  };

  const fetchMessages = async (myId: number, silent = false) => {
    if (!finalChildId) return;
    if (!silent) setLoading(true);

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
    } catch (err) {
      console.log('fetch error:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSend = async (
    type: 'text' | 'image',
    content: string,
    url?: string
  ) => {
    if (!myUserId || !finalChildId) return;

    setSending(true);

    const payload = {
      sender_id: myUserId,
      sender_type: myType,
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
        // Anında listeyi güncelle
        fetchMessages(myUserId, true);
        // Mesaj gittikten sonra en alta kaydır
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
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
      maxWidth: 800, // Performans için resmi küçültüyoruz
      maxHeight: 800,
      quality: 0.7,  // Kaliteyi optimize ediyoruz
    });

    if (result.assets && result.assets.length > 0) {
      const a = result.assets[0];

      if (a.base64 && a.type) {
        const uri = `data:${a.type};base64,${a.base64}`;
        handleSend('image', '📷 Photo', uri);
      }
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    // DÜZELTME: Hem sender_id hem sender_type kontrol edilmeli
    const isMe = item.sender_id === myUserId && item.sender_type === myType;

    return (
      <View
        style={[
          styles.bubble,
          isMe ? styles.myBubble : styles.otherBubble,
        ]}
      >
        {item.content_type === 'image' && item.content_url ? (
          <Image
            source={{ uri: item.content_url }}
            style={styles.chatImage}
            resizeMode="cover"
          />
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

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} color={categoryColor} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          // Klavye açılınca listeyi koru
          keyboardShouldPersistTaps="handled"
          // Liste yüklendiğinde en alta git
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
            placeholder="Mesaj yazın..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: categoryColor, opacity: (!inputText.trim() && !sending) ? 0.6 : 1 },
            ]}
            disabled={sending || !inputText.trim()}
            onPress={() => handleSend('text', inputText.trim())}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
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
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
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
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.95)', fontWeight: '500' },

  listContent: { padding: 20, paddingBottom: 40 },

  bubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },

  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#4ECDC4',
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  messageText: { fontSize: 16, lineHeight: 22 },
  myText: { color: '#FFF' },
  otherText: { color: '#333' },

  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    alignItems: 'center',
  },

  timeText: { fontSize: 10 },
  myTime: { color: 'rgba(255,255,255,0.8)' },
  otherTime: { color: '#999' },

  readReceipt: { marginLeft: 6, color: '#FFF', fontSize: 10, fontWeight: 'bold' },

  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
  },

  input: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: 100, // Çok uzun mesajlarda input çok büyümesin
  },

  attachButton: { padding: 10 },
  attachIcon: { fontSize: 24, color: '#555' },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },

  sendButtonText: { fontSize: 20, color: '#FFF', fontWeight: 'bold', marginBottom: 2 },

  chatImage: { width: 200, height: 150, borderRadius: 12, marginBottom: 4, backgroundColor: '#eee' },
});
