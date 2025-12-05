import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
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
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';

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
  const {
    category,
    categoryTitle,
    categoryColor,
    otherUserId,
    isTeacher,
    childId,
    childName,
  } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [showWorkHoursWarning, setShowWorkHoursWarning] = useState(false);

  // Parent tarafında şimdilik öğretmen ID = 1 (legacy davranış)
  const receiverId = isTeacher ? otherUserId : 1;

  const flatListRef = useRef<FlatList>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    loadUserAndMessages();
    if (!isTeacher) checkWorkHours();
  }, []);

  useEffect(() => {
    if (myUserId) {
      markMessagesAsRead();
    }
  }, [myUserId]);

  const checkWorkHours = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 9 || hour >= 18) {
      setShowWorkHoursWarning(true);
    }
  };

  const markMessagesAsRead = async () => {
    if (!myUserId || !childId) return;
    try {
      await fetch(`${BASE_URL}/messages/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: receiverId, // karşı taraf
          receiver_id: myUserId, // ben
          category,
          child_id: childId,
        }),
      });
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  const loadUserAndMessages = async () => {
    try {
      const key = isTeacher ? 'teacher_id' : 'parent_id';
      const idString = await AsyncStorage.getItem(key);

      if (idString) {
        const uid = parseInt(idString, 10);
        setMyUserId(uid);
        fetchMessages(uid);
      }
    } catch (error) {
      console.error('Error loading user ID:', error);
    }
  };

  const fetchMessages = async (myId: number) => {
    if (!childId) return;

    setLoading(true);

    const cacheKey = `messages_${myId}_${receiverId}_${category}_${childId}`;
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        setMessages(JSON.parse(cached));
        setLoading(false);
      }
    } catch (e) {
      console.log('Cache error:', e);
    }

    try {
      const response = await fetch(
        `${BASE_URL}/messages?user1_id=${myId}&user2_id=${receiverId}&category=${category}&child_id=${childId}`
      );

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        if (json.success) {
          setMessages(json.messages);
          await AsyncStorage.setItem(cacheKey, JSON.stringify(json.messages));
        }
      } catch (e) {
        console.warn('Invalid JSON response:', text.substring(0, 100));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (type: 'text' | 'image', content: string, url?: string) => {
    if (!myUserId || !childId) return;

    setSending(true);

    const payload = {
      sender_id: myUserId,
      sender_type: isTeacher ? 'teacher' : 'parent',
      receiver_id: receiverId,
      category,
      child_id: childId,
      message_text: content,
      content_type: type,
      content_url: url || '',
    };

    try {
      const response = await fetch(`${BASE_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        if (json.success) {
          setInputText('');
          fetchMessages(myUserId);
        } else {
          Alert.alert('Error', 'Message could not be sent.');
        }
      } catch (e) {
        console.error('Send message invalid JSON:', text);
        Alert.alert('Error', 'Server communication error.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Network error.');
    } finally {
      setSending(false);
    }
  };

  const onPickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.5,
      includeBase64: true,
    });

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];

      if (asset.base64) {
        const dataUri = `data:${asset.type};base64,${asset.base64}`;
        handleSend('image', '📷 Photo', dataUri);
      } else if (asset.uri) {
        try {
          const base64Img = await RNFS.readFile(asset.uri, 'base64');
          const dataUri = `data:${asset.type || 'image/jpeg'};base64,${base64Img}`;
          handleSend('image', '📷 Photo', dataUri);
        } catch (e) {
          console.error('Image read error', e);
        }
      }
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const myType = isTeacher ? 'teacher' : 'parent';
    const isMe = item.sender_type === myType;

    let content = (
      <Text style={[styles.messageText, isMe ? styles.myText : styles.otherText]}>
        {item.message_text}
      </Text>
    );

    if (item.content_type === 'image' && item.content_url) {
      content = (
        <Image source={{ uri: item.content_url }} style={styles.chatImage} resizeMode="cover" />
      );
    }

    return (
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
        {content}
        <View style={styles.bubbleFooter}>
          <Text style={[styles.timeText, isMe ? styles.myTime : styles.otherTime]}>
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {isMe && (
            <Text style={styles.readReceipt}>{item.is_read ? '✓✓' : '✓'}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: categoryColor }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{categoryTitle}</Text>
          <Text style={styles.headerSubtitle}>
            {childName ? childName : isTeacher ? 'Parent Chat' : 'Teacher Chat'}
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {showWorkHoursWarning && !isTeacher && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            🌙 You are messaging outside of work hours. The teacher will see your message later.
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {loading && messages.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={categoryColor} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={onPickImage} style={styles.attachButton}>
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline
          />

          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: categoryColor }]}
            onPress={() => {
              if (inputText.trim().length > 0) {
                handleSend('text', inputText.trim());
              }
            }}
            disabled={sending || inputText.trim().length === 0}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFF" />
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
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  warningBanner: {
    backgroundColor: '#FFF3CD',
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE69C',
  },
  warningText: {
    color: '#856404',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 20,
  },
  bubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#4ECDC4',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myText: {
    color: '#FFF',
  },
  otherText: {
    color: '#333',
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
  },
  myTime: {
    color: 'rgba(255,255,255,0.8)',
  },
  otherTime: {
    color: '#999',
  },
  readReceipt: {
    fontSize: 10,
    color: '#FFF',
    marginLeft: 4,
    fontWeight: 'bold',
  },
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
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
    marginTop: -2,
  },
  attachButton: {
    padding: 10,
    marginRight: 5,
  },
  attachIcon: {
    fontSize: 24,
    color: '#666',
  },
  chatImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginBottom: 5,
  },
});
