import React, { useEffect, useState, useContext } from 'react';
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
  ListRenderItemInfo,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import config from '../../config';
import { DarkModeContext } from '../context/DarkModeContext';
import { useTranslation } from 'react-i18next';

interface Message {
  from: string;
  text: string;
}

export default function ChatBotScreen(): JSX.Element {
  const { darkMode } = useContext(DarkModeContext);
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [username, setUsername] = useState<string>('Guest');

  useEffect(() => {
    const loadUser = async (): Promise<void> => {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUsername(parsed?.name ?? 'User');
      }
    };
    loadUser();
  }, []);

  const sendMessage = async (): Promise<void> => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { from: username, text: input }]);
    setInput('');

    try {
      const response = await fetch(`${config.API_URL}/api/chat/chatgpt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      const botResponse: string = data?.response ?? t('einstein_response_error');
      setMessages(prev => [...prev, { from: t('einstein'), text: botResponse }]);
    } catch (error) {
      console.error('❌ Erreur fetch:', error);
      setMessages(prev => [...prev, { from: t('einstein'), text: t('einstein_connection_error') }]);
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<Message>): JSX.Element => {
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
          <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
            <Ionicons name="arrow-back" size={24} color={darkMode ? '#FFD700' : '#007AFF'} />
          </TouchableOpacity>
        </View>

        <View style={styles.topContainer}>
          <Image
            source={require('../../assets/images/einstein.png')}
            style={styles.topImage}
            resizeMode="contain"
          />
          <Text style={[styles.topTitle, { color: darkMode ? '#FFD700' : '#007AFF' }]}>
            {t('how can we help')}
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
            placeholder={t('ask einstein')}
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
          <TouchableOpacity onPress={sendMessage} style={[styles.sendButton, { backgroundColor: darkMode ? '#FFD700' : '#007AFF' }]}>
            <Text style={[styles.sendText, { color: darkMode ? '#0A1F3A' : '#FFF' }]}>{t('send')}</Text>
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
