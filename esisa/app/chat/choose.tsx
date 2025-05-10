import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ChooseChannelScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        if (!stored) return Alert.alert("Erreur", "Utilisateur non connecté");
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch (e) {
        Alert.alert("Erreur", "Impossible de charger l'utilisateur");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  if (loading || !user) return (
    <View style={styles.center}>
      <ActivityIndicator color="#FFD700" size="large" />
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.replace('/(tabs)')}>
        <Ionicons name="arrow-back" size={24} color="#FFD700" />
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Choisissez votre canal de discussion</Text>

      <TouchableOpacity
        style={styles.option}
        onPress={() => router.push(`/chat?channelId=group:${user.group}`)}
      >
        <Text style={styles.optionText}>💬 Groupe : {user.group}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.option}
        onPress={() => router.push(`/chat?channelId=year:${user.anne_scolaire}`)}
      >
        <Text style={styles.optionText}>📅 Année scolaire : {user.anne_scolaire}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1F3A',
    padding: 20,
    paddingTop: 50,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1F3A',
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    color: '#FFD700',
    marginLeft: 8,
    fontSize: 16,
  },
  title: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  option: {
    backgroundColor: '#1A3F6F',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  optionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});
