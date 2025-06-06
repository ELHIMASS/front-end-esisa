import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DarkModeContext } from '../context/DarkModeContext';
import { LanguageContext } from '../context/LanguageContext';
import { translations } from '../utils/transactions';

export default function ChooseChannelScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { darkMode } = useContext(DarkModeContext);
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        if (!stored) return Alert.alert(t.error || "Erreur", t.userNotConnected || "Utilisateur non connecté");
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch (e) {
        Alert.alert(t.error || "Erreur", t.userLoadFail || "Impossible de charger l'utilisateur");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  if (loading || !user) {
    return (
      <View style={[styles.center, darkMode ? styles.darkContainer : styles.lightContainer]}>
        <ActivityIndicator color="#FFD700" size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, darkMode ? styles.darkContainer : styles.lightContainer]}>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={darkMode ? '#0A1F3A' : '#FFF'}
      />

      <TouchableOpacity style={styles.back} onPress={() => router.replace('/(tabs)')}>
        <Ionicons name="arrow-back" size={24} color="#FFD700" />
        <Text style={[styles.backText, { color: '#FFD700' }]}>
          {t.back || 'Retour'}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: '#FFD700' }]}>
        {t.chooseChannel || 'Choisissez votre canal de discussion'}
      </Text>

      <TouchableOpacity
        style={[styles.option, { backgroundColor: darkMode ? '#1A3F6F' : '#EEE' }]}
        onPress={() => router.push(`/chat?channelId=group:${user.group}`)}
      >
        <Text style={[styles.optionText, { color: darkMode ? '#FFF' : '#000' }]}>
          💬 {t.group || 'Groupe'} : {user.group}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, { backgroundColor: darkMode ? '#1A3F6F' : '#EEE' }]}
        onPress={() => router.push(`/chat?channelId=year:${user.anne_scolaire}`)}
      >
        <Text style={[styles.optionText, { color: darkMode ? '#FFF' : '#000' }]}>
          📅 {t.schoolYear || 'Année scolaire'} : {user.anne_scolaire}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  darkContainer: {
    backgroundColor: '#0A1F3A',
  },
  lightContainer: {
    backgroundColor: '#FFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  option: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
});