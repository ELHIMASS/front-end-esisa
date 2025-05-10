import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';
import socket from '../app/utils/socket';

interface ChatProps {
  channelId: string;
}

const Chat: React.FC<ChatProps> = ({ channelId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socket.connect();
    socket.emit('joinChannel', { channelId });

    const handleMessage = (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('receiveMessage', handleMessage);

    return () => {
      socket.off('receiveMessage', handleMessage);
      socket.disconnect();
    };
  }, [channelId]);

  const sendMessage = () => {
    if (message.trim() !== '') {
      socket.emit('sendMessage', { channelId, message });
      setMessages((prev) => [...prev, message]); // affichage immédiat
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => <Text style={styles.message}>{item}</Text>}
        keyExtractor={(_, index) => index.toString()}
        style={styles.list}
      />
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Écrire un message..."
        style={styles.input}
      />
      <Button title="Envoyer" onPress={sendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  list: {
    marginBottom: 10,
  },
  message: {
    padding: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    marginVertical: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: '#fff'
  },
});

export default Chat;
