import React from 'react';
import { View, Button } from 'react-native';
import { useRouter } from 'expo-router';

const HomeScreen: React.FC = () => {
  const router = useRouter();

  return (
    <View>
        <Button title="Messagerie" onPress={() => router.push('/chat/choose')} />
    </View>
  );
};

export default HomeScreen;