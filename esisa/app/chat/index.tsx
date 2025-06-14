import React, { useEffect, useState, useRef, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  I18nManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import socket from '../utils/socket';
import config from '../../config';
import { DarkModeContext } from '../context/DarkModeContext';
import { LanguageContext } from '../context/LanguageContext';
import { translations } from '../utils/transactions';

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const channelId = params.channelId;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);

  const { darkMode } = useContext(DarkModeContext);
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  useEffect(() => {
    if (language === 'ar') I18nManager.forceRTL(true);
    else I18nManager.forceRTL(false);
  }, [language]);

  useEffect(() => {
    AsyncStorage.getItem('user')
      .then(data => {
        const parsed = JSON.parse(data || '{}');
        setUser(parsed);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!channelId) return;
    fetch(`${config.API_URL}/api/channels/${channelId}/messages`)
      .then(res => res.json())
      .then(setMessages)
      .catch(err => console.error("Erreur chargement messages :", err));
  }, [channelId]);

  useEffect(() => {
    if (!channelId) return;

    socket.connect();
    socket.emit('joinChannel', { channelId });

    socket.on('receiveMessage', (msg: any) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off('receiveMessage');
      socket.disconnect();
    };
  }, [channelId]);

  const sendMessage = () => {
    if (message.trim() && user) {
      const fullMessage = {
        user: user.name,
        content: message,
        timestamp: new Date().toISOString()
      };

      socket.emit('sendMessage', { channelId, message: fullMessage });
      setMessage('');
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={[
          styles.container,
          darkMode ? styles.darkContainer : styles.lightContainer
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/chat/choose')}>
            <Ionicons name="arrow-back" size={24} color="#FFD700" />
          </TouchableOpacity>
          <Text style={[styles.title, { color: '#FFD700' }]}>
            {(channelId as string)?.includes('group')
              ? `${t.channelGroup || 'Canal : Groupe'} → `
              : `${t.channelYear || 'Canal : Année'} → `}
            <Text style={{ color: '#FFD700' }}>
              {(channelId as string)?.split(':')[1]}
            </Text>
          </Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages.filter(m => typeof m === 'object' && m.content)}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.user === user?.name ? styles.mine : styles.theirs
              ]}
            >
              <Text style={styles.user}>{item.user}</Text>
              <Text style={styles.messageText}>{item.content}</Text>
            </View>
          )}
          keyExtractor={(_, i) => i.toString()}
          style={styles.list}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        <View style={styles.inputWrapper}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={t.writeMessage || 'Écrire un message...'}
            style={styles.input}
            placeholderTextColor="#999"
          />
          <Text style={styles.sendIcon} onPress={sendMessage}>
            📤
          </Text>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkContainer: { backgroundColor: '#0A1F3A' },
  lightContainer: { backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
    marginTop: Platform.OS === 'ios' ? 40 : 10,
    paddingHorizontal: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  list: {
    flex: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  mine: {
    backgroundColor: '#1A3F6F',
    alignSelf: 'flex-end',
  },
  theirs: {
    backgroundColor: '#6D8EB4',
    alignSelf: 'flex-start',
  },
  user: {
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    margin: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color: '#000',
  },
  sendIcon: {
    fontSize: 20,
    marginLeft: 10,
    color: '#1A3F6F',
  },
});
