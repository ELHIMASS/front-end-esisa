import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

export default function ChatBotScreen() {
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Ajouter le message de l'utilisateur
    const newMessages = [...messages, { from: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await fetch('http://192.168.100.219:5000/api/chatgpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      console.log("🧠 Réponse de Ollama :", data);

      const botResponse = data.response || 'Erreur de réponse d’Ollama.';
      setMessages((prev) => [...prev, { from: 'gpt', text: botResponse }]);
    } catch (error) {
      console.error('❌ Erreur fetch:', error);
      setMessages((prev) => [...prev, { from: 'gpt', text: 'Erreur de connexion.' }]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={[styles.message, item.from === 'user' ? styles.user : styles.gpt]}>
            {item.from === 'user' ? 'Tu : ' : 'GPT : '}
            {item.text}
          </Text>
        )}
        style={styles.chat}
      />
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Pose ta question..."
          value={input}
          onChangeText={setInput}
          style={styles.input}
          placeholderTextColor="#ccc"
        />
        <Button title="Envoyer" onPress={sendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  chat: { padding: 15 },
  message: {
    fontSize: 16,
    marginVertical: 6,
    color: '#fff',
  },
  user: {
    alignSelf: 'flex-start',
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 10,
  },
  gpt: {
    alignSelf: 'flex-end',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#111',
    borderTopColor: '#333',
    borderTopWidth: 1,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: '#fff',
    padding: 10,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 10,
  },
});
