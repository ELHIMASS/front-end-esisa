import React, { useEffect, useState } from 'react';
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
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ChatBotScreen() {
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('Guest');

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUsername(parsed?.name || 'User');
      }
    };
    loadUser();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { from: username, text: input }]);
    setInput('');

    try {
      const response = await fetch('http://192.168.1.14:5000/api/chatgpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      const botResponse = data?.response || "Erreur de réponse d'Einstein.";
      setMessages(prev => [...prev, { from: 'Einstein', text: botResponse }]);
    } catch (error) {
      console.error('❌ Erreur fetch:', error);
      setMessages(prev => [...prev, { from: 'Einstein', text: 'Erreur de connexion à Einstein.' }]);
    }
  };

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
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          style={styles.chat}
          contentContainerStyle={{ paddingVertical: 20 }}
        />

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Pose ta question à Einstein..."
            placeholderTextColor="#ccc"
            value={input}
            onChangeText={setInput}
            style={styles.input}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Text style={styles.sendText}>Envoyer</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0A1F3A',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A1F3A',
  },
  header: {
    padding: 10,
    marginTop: 5,
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
    backgroundColor: '#0A1F3A',
    borderTopColor: '#FFD700',
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    backgroundColor: '#1A3F6F',
    color: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  sendText: {
    fontWeight: 'bold',
    color: '#0A1F3A',
  },
});
