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
  PermissionsAndroid,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';

// -umut: (22.11.2025) Updated ChatScreen to support both Teacher and Parent roles
// Now dynamically handles sender/receiver based on route params.

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message_text: string;
  created_at: string;
  category: string;
  content_type: 'text' | 'audio' | 'image';
  content_url?: string;
  is_read?: boolean;
}

// Correct instantiation for the updated version of the library
const audioRecorderPlayer = new AudioRecorderPlayer();

// -umut: (22.11.2025) Base URL
const BASE_URL = 'https://bloomedu-production.up.railway.app';
// For local testing (Emulator): 'http://10.0.2.2:8080'

const ChatScreen = ({ route, navigation }: any) => {
  const { category, categoryTitle, categoryColor, otherUserId, isTeacher } = route.params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');
  const [showWorkHoursWarning, setShowWorkHoursWarning] = useState(false);
  // -umut: Store the recording path to ensure we read from the correct location on Android
  const audioPathRef = useRef<string>('');
  
  // If I am parent, I talk to Teacher(1). If I am Teacher, I talk to Parent(otherUserId)
  // -umut: Dynamic ID assignment
  const receiverId = isTeacher ? otherUserId : 1; 

  const flatListRef = useRef<FlatList>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    loadUserAndMessages();
    if (!isTeacher) checkWorkHours(); // Only show warning to parents
    
    // Mark messages as read on mount
    if (myUserId) {
      markMessagesAsRead();
    }

    return () => {
      audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
    };
  }, []);

  useEffect(() => {
    if (myUserId) {
      markMessagesAsRead();
    }
  }, [myUserId]);

  const checkWorkHours = () => {
    const now = new Date();
    const hour = now.getHours();
    // Work hours: 09:00 - 18:00
    if (hour < 9 || hour >= 18) {
      setShowWorkHoursWarning(true);
    }
  };

  const markMessagesAsRead = async () => {
    if (!myUserId) return;
    try {
      await fetch(`${BASE_URL}/messages/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: receiverId, // Mark messages FROM the other person
          receiver_id: myUserId, // TO me
          category: category
        }),
      });
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  const loadUserAndMessages = async () => {
    try {
      // -umut: Determine my ID based on role
      const key = isTeacher ? 'teacher_id' : 'parent_id';
      const idString = await AsyncStorage.getItem(key);
      
      if (idString) {
        const pid = parseInt(idString, 10);
        setMyUserId(pid);
        fetchMessages(pid);
      }
    } catch (error) {
      console.error('Error loading user ID:', error);
    }
  };

  const fetchMessages = async (myId: number) => {
    setLoading(true);
    
    // -umut: (22.11.2025) Offline Logic: Load from cache first
    const cacheKey = `messages_${myId}_${receiverId}_${category}`;
    try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
            setMessages(JSON.parse(cached));
            setLoading(false); // Show cached data immediately
        }
    } catch (e) {
        console.log('Cache error:', e);
    }

    try {
      const response = await fetch(
        `${BASE_URL}/messages?user1_id=${myId}&user2_id=${receiverId}&category=${category}`
      );
      
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        if (json.success) {
          setMessages(json.messages);
          // Update cache with fresh data
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

  const handleSend = async (type: 'text' | 'audio' | 'image', content: string, url?: string) => {
    if (!myUserId) return;

    setSending(true);
    const payload = {
      sender_id: myUserId,
      sender_type: isTeacher ? 'teacher' : 'parent',
      receiver_id: receiverId,
      category: category,
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

  // === AUDIO RECORDING ===
  const onStartRecord = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'Bloomedu needs access to your microphone to send voice notes.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
    }

    const path = Platform.select({
      ios: 'hello.m4a',
      android: `${RNFS.CachesDirectoryPath}/hello.mp4`,
    });

    if (path) {
        audioPathRef.current = path;
    }

    await audioRecorderPlayer.startRecorder(path);
    audioRecorderPlayer.addRecordBackListener((e: any) => {
      setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
      return;
    });
    setIsRecording(true);
  };

  const onStopRecord = async () => {
    await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setIsRecording(false);
    setRecordTime('00:00');
    
    // -umut: Convert audio file to Base64 for sending
    try {
      // Use the stored path instead of the result from stopRecorder()
      const filePath = audioPathRef.current;
      
      // Check if file exists before reading
      const exists = await RNFS.exists(filePath);
      if (!exists) {
          console.error('Audio file not found at:', filePath);
          Alert.alert('Error', 'Recording failed (file not found).');
          return;
      }

      const base64Audio = await RNFS.readFile(filePath, 'base64');
      // Add data URI scheme prefix
      const dataUri = `data:audio/mp4;base64,${base64Audio}`;
      handleSend('audio', '🎤 Voice Message', dataUri);
    } catch (err) {
      console.error('Error reading audio file:', err);
      Alert.alert('Error', 'Could not process audio recording.');
    }
  };

  // === IMAGE PICKER ===
  const onPickImage = async () => {
    const result = await launchImageLibrary({ 
      mediaType: 'photo', 
      quality: 0.5, // Compress image to reduce Base64 size
      includeBase64: true // Request Base64 directly from picker
    });

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset.base64) {
        const dataUri = `data:${asset.type};base64,${asset.base64}`;
        handleSend('image', '📷 Photo', dataUri);
      } else {
        // Fallback if picker doesn't return base64 (shouldn't happen with includeBase64: true)
        if (asset.uri) {
             try {
                const base64Img = await RNFS.readFile(asset.uri, 'base64');
                const dataUri = `data:${asset.type || 'image/jpeg'};base64,${base64Img}`;
                handleSend('image', '📷 Photo', dataUri);
             } catch(e) {
                 console.error("Image read error", e);
             }
        }
      }
    }
  };

  // === RENDER ITEM ===
  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === myUserId;
    
    let content = <Text style={[styles.messageText, isMe ? styles.myText : styles.otherText]}>{item.message_text}</Text>;

    if (item.content_type === 'audio') {
      content = (
        <TouchableOpacity 
          style={styles.audioContainer}
          onPress={async () => {
             if (item.content_url) {
                 // To play base64 audio, we might need to save it to a temp file first
                 // Or use a player that supports data URI. 
                 // audio-recorder-player supports playing from URL/Path.
                 // Workaround: Save base64 to temp file and play.
                 try {
                     const path = `${RNFS.CachesDirectoryPath}/temp_audio_${item.id}.mp4`;
                     // Remove scheme
                     const base64Data = item.content_url.split(',')[1];
                     if(base64Data){
                        await RNFS.writeFile(path, base64Data, 'base64');
                        await audioRecorderPlayer.startPlayer(path);
                     }
                 } catch (e) {
                     console.error("Play error", e);
                     Alert.alert("Error", "Could not play audio.");
                 }
             }
          }}
        >
          <Text style={styles.audioIcon}>▶️</Text>
          <Text style={[styles.messageText, isMe ? styles.myText : styles.otherText]}>Voice Note (Tap to Play)</Text>
        </TouchableOpacity>
      );
    } else if (item.content_type === 'image' && item.content_url) {
      content = (
        <Image source={{ uri: item.content_url }} style={styles.chatImage} resizeMode="cover" />
      );
    }

    return (
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
        {content}
        <View style={styles.bubbleFooter}>
          <Text style={[styles.timeText, isMe ? styles.myTime : styles.otherTime]}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
      {/* Header */}
      <View style={[styles.header, { backgroundColor: categoryColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{categoryTitle}</Text>
          <Text style={styles.headerSubtitle}>
            {isTeacher ? 'Parent Chat' : 'Teacher Chat'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Work Hours Warning */}
      {showWorkHoursWarning && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>🌙 You are messaging outside of work hours. The teacher will see your message in the morning.</Text>
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
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          {isRecording ? (
            <View style={styles.recordingContainer}>
              <Text style={styles.recordingText}>🔴 Recording... {recordTime}</Text>
              <TouchableOpacity onPress={onStopRecord} style={styles.stopButton}>
                <Text style={styles.stopButtonText}>■</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
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
              
              {inputText.trim().length > 0 ? (
                <TouchableOpacity
                  style={[styles.sendButton, { backgroundColor: categoryColor }]}
                  onPress={() => handleSend('text', inputText.trim())}
                  disabled={sending}
                >
                  {sending ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.sendButtonText}>→</Text>}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.micButton, { backgroundColor: categoryColor }]}
                  onLongPress={onStartRecord}
                  onPressOut={onStopRecord}
                  delayLongPress={300}
                >
                  <Text style={styles.micIcon}>🎤</Text>
                </TouchableOpacity>
              )}
            </>
          )}
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
    zIndex: 10,
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
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micIcon: {
    fontSize: 20,
    color: '#FFF',
  },
  recordingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  recordingText: {
    color: '#E53E3E',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E53E3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginBottom: 5,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioIcon: {
    fontSize: 20,
    marginRight: 8,
  },
});
