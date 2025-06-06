import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // For navigation
import { DarkModeContext } from '../context/DarkModeContext';
import { LanguageContext } from '../context/LanguageContext';
import { translations } from '../utils/transactions'; // Import translations from your transactions file

import config from '../../config'; // Assuming config for API_URL is available
import AsyncStorage from '@react-native-async-storage/async-storage'; // Make sure AsyncStorage is imported

export default function ChatBotScreen() {
  const { darkMode } = useContext(DarkModeContext);
  const { language, setLanguage } = useContext(LanguageContext);
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('Guest'); // Default 'Guest' until the username is fetched from AsyncStorage
  const router = useRouter();

  // Load user data (for username, etc.)
  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUsername(parsed?.name || 'User'); // Update username if available, else default to 'User'
      }
    };
    loadUser();
    }, []); // Empty dependency array to run only once on mount

  // Send message to API
  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { from: username, text: input }]);
    setInput('');

    try {
      const response = await fetch(`${config.API_URL}/api/chat/chatgpt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      const botResponse = data?.response || translations[language].einstein_response_error;
      setMessages((prev) => [...prev, { from: 'Einstein', text: botResponse }]);
    } catch (error) {
      console.error('❌ Erreur fetch:', error);
      setMessages((prev) => [
        ...prev,
        { from: 'Einstein', text: translations[language].einstein_connection_error },
      ]);
    }
  };

  // Render messages
  const renderItem = ({ item }: { item: { from: string; text: string } }) => {
    const isUser = item.from === username;
    const avatar = isUser
      ? require('../../assets/images/user.png')
      : require('../../assets/images/einstein.png');

    return (
      <View style={[styles.messageRow, isUser ? styles.right : styles.left]}>
        {!isUser && <Image source={avatar} style={styles.avatar} />}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.name, isUser ? styles.nameUser : styles.nameBot]}>{item.from}</Text>
          <Text style={[styles.text, isUser ? styles.textUser : styles.textBot]}>{item.text}</Text>
        </View>
        {isUser && <Image source={avatar} style={styles.avatar} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: darkMode ? '#0A1F3A' : '#FFF' }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={darkMode ? '#FFD700' : '#007AFF'} />
          </TouchableOpacity>
        </View>

        <View style={styles.topContainer}>
          <Image source={require('../../assets/images/einstein.png')} style={styles.topImage} resizeMode="contain" />
          <Text style={[styles.topTitle, { color: darkMode ? '#FFD700' : '#007AFF' }]}>
            {translations[language].chat_with_einstein}
          </Text>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          style={styles.chat}
          contentContainerStyle={{ paddingVertical: 20 }}
        />

        <View
          style={[
            styles.inputContainer,
            { backgroundColor: darkMode ? '#0A1F3A' : '#EEE', borderTopColor: darkMode ? '#FFD700' : '#007AFF' },
          ]}
        >
          <TextInput
            placeholder={translations[language].ask_einstein}
            placeholderTextColor={darkMode ? '#999' : '#666'}
            value={input}
            onChangeText={setInput}
            style={[
              styles.input,
              {
                color: darkMode ? '#FFF' : '#000',
                backgroundColor: darkMode ? '#1A3F6F' : '#FFF',
                borderColor: darkMode ? '#FFD700' : '#007AFF',
              },
            ]}
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[styles.sendButton, { backgroundColor: darkMode ? '#FFD700' : '#007AFF' }]}
          >
            <Text style={[styles.sendText, { color: darkMode ? '#0A1F3A' : '#FFF' }]}>
              {translations[language].send}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 10,
    marginTop: 5,
  },
  backButton: {
    backgroundColor: "#1A3F6F",
    borderRadius: 50,
    padding: 10,
    marginRight: "88%",
  },
  topContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  topImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 50,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  chat: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 8,
  },
  left: {
    justifyContent: 'flex-start',
  },
  right: {
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginHorizontal: 5,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#1A3F6F',
  },
  botBubble: {
    backgroundColor: '#FFD700',
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nameUser: {
    color: '#fff',
  },
  nameBot: {
    color: '#0A1F3A',
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  textUser: {
    color: '#fff',
  },
  textBot: {
    color: '#0A1F3A',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
  },
  sendButton: {
    marginLeft: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
  },
  sendText: {
    fontWeight: 'bold',
  },
});
