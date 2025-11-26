import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// -umut: (22.11.2025) Created new AI Chat screen with mock responses (Updated to English)
const ParentAIChatScreen = ({ navigation }: any) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am the Bloomedu Pedagogical Assistant. You can ask me about your child\'s development, game recommendations, or any challenges you are facing. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (inputText.trim().length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Mock AI Response Logic
    setTimeout(() => {
      const aiResponseText = getMockResponse(userMessage.text);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500); // 1.5s delay to simulate thinking
  };

  const getMockResponse = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    // Helper function to check multiple keywords
    const contains = (keywords: string[]) => keywords.some(k => lowerText.includes(k));

    // 1. SCREEN TIME & TIME MANAGEMENT
    if (contains(['screen', 'time', 'minute', 'hour', 'watch', 'tablet', 'phone', 'duration'])) {
      return "For preschool children (ages 3-6), the recommended daily screen time is limited to 1 hour. \n\n💡 Tip: You can let them play educational games on Bloomedu in 20-minute sessions. Balancing the remaining time with physical activities is great for their development!";
    }

    // 2. EYE CONTACT & COMMUNICATION
    if (contains(['eye', 'contact', 'look', 'stare', 'communication', 'focus'])) {
      return "Eye contact is fundamental to social development. You can encourage it gently through play:\n\n👀 Play 'Peek-a-boo'.\n🧸 Hold a favorite toy near your face while talking.\n🎈 Wait for them to look at you while playing blowing bubbles.";
    }

    // 3. SLEEP & RESTLESSNESS
    if (contains(['sleep', 'restless', 'cry', 'tantrum', 'angry', 'awake', 'night', 'bed'])) {
      return "Restlessness or sleep issues often stem from a need or a change in routine.\n\n🌙 Create a sleep routine (Bath -> Story -> Sleep).\n🎨 Engage in painting or dancing activities during the day to release energy.";
    }

    // 4. GAME & ACTIVITY SUGGESTIONS
    if (contains(['game', 'activity', 'play', 'suggest', 'bored', 'fun', 'recommend'])) {
      const suggestions = [
        "Have you tried the 'Color Match' game on Bloomedu? It supports visual perception and is very fun! 🎨",
        "You can play 'Fruit Basket' at home! Place real fruits in a basket and name them to reinforce the game from Bloomedu. 🍎🍌",
        "Go on a 'Shape Hunt' with your child! Find round or square objects around the house and match them. 🟧🔴"
      ];
      return suggestions[Math.floor(Math.random() * suggestions.length)];
    }

    // 5. SPEECH & LANGUAGE
    if (contains(['speak', 'talk', 'word', 'mom', 'dad', 'say', 'language'])) {
      return "To support language development:\n\n🗣️ Talk to them frequently and narrate what you are doing ('Now we are eating an apple').\n📖 Read picture books together.\n🎶 Sing nursery rhymes.";
    }

    // 6. GENERAL/FALLBACK (More natural fallback)
    return "I want to give you the best support possible. Could you provide a bit more detail about the situation?\n\nFor example:\n• 'He doesn't want to play games'\n• 'We struggle during meal times'\n• 'Which game do you recommend?'";
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
          {item.text}
        </Text>
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Pedagog AI</Text>
          <Text style={styles.headerSubtitle}>Smart Guide</Text>
        </View>
        <View style={{ width: 40 }} /> 
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingContainer}>
                <ActivityIndicator size="small" color="#FF6B9A" />
                <Text style={styles.typingText}>Typing...</Text>
              </View>
            ) : null
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask a question..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, inputText.trim().length === 0 && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={inputText.trim().length === 0}
          >
            <Text style={styles.sendButtonText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
    fontWeight: '600',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF6B9A',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#333333',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiTimestamp: {
    color: '#999',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginBottom: 12,
  },
  typingText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
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
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  sendButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default ParentAIChatScreen;
