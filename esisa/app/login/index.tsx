import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import config from '../../config';
import { DarkModeContext } from '../context/DarkModeContext';

const { width } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const { darkMode } = useContext(DarkModeContext);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const checkAlreadyLoggedIn = async () => {
      try {
        const admin = await AsyncStorage.getItem("admin");
        const student = await AsyncStorage.getItem("user");
        const prof = await AsyncStorage.getItem("prof");

        if (admin) router.replace("/admin");
        else if (student) router.replace("/(tabs)");
        else if (prof) router.replace("/prof");
      } catch (error) {
        console.warn("Erreur de vérification de session", error);
      }
    };
    checkAlreadyLoggedIn();
  }, [router]);

  const playSound = useCallback(async (file: any) => {
    try {
      const { sound } = await Audio.Sound.createAsync(file);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && !status.isPlaying) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.warn("Erreur de lecture audio", error);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    setErrorMessage(""); // Réinitialiser le message d'erreur à chaque tentative

    if (!email || !password) {
      await playSound(require('../../assets/audio/error.mp3'));
      setErrorMessage("Veuillez remplir tous les champs.");
      return;
    }

    try {
      setLoading(true);
      // Affichage de l'URL et des paramètres dans la console pour le débogage
      console.log(`Requête vers l'API: ${config.API_URL}/api/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
      
      const response = await fetch(`${config.API_URL}/api/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
      
      // Vérification du statut de la réponse
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur de serveur:', errorData);
        await playSound(require('../../assets/audio/error.mp3'));
        setErrorMessage("Erreur du serveur, réessayez.");
        return;
      }

      const userData: { role?: string } = await response.json();
      console.log('Réponse du serveur:', userData); // Vérifie la réponse dans la console

      if (!userData.role) {
        await playSound(require('../../assets/audio/error.mp3'));
        setErrorMessage("Identifiants invalides.");
        return;
      }

      if (userData.role === "admin") {
        await playSound(require('../../assets/audio/done.mp3'));
        await AsyncStorage.setItem("admin", JSON.stringify(userData));
        router.replace("/admin");
      } else if (userData.role === "student") {
        await playSound(require('../../assets/audio/done.mp3'));
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        router.replace("/(tabs)");
      } else if (userData.role === "prof") {
        await playSound(require('../../assets/audio/done.mp3'));
        await AsyncStorage.setItem("prof", JSON.stringify(userData));
        router.replace("/prof");
      } else {
        await playSound(require('../../assets/audio/error.mp3'));
        setErrorMessage("Rôle inconnu.");
      }
    } catch (err) {
      console.error("Erreur de connexion", err);
      await playSound(require('../../assets/audio/error.mp3'));
      setErrorMessage("Erreur du serveur, réessayez.");
    } finally {
      setLoading(false);
    }
  }, [email, password, playSound, router]);

  const navigateToForgotPassword = () => {
    router.push("/forgotpassword");
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, darkMode ? { backgroundColor: "#0A1F3A" } : { backgroundColor: "#FFF" }]}>
        <ActivityIndicator size="large" color={darkMode ? "#FFD700" : "#4B72FF"} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: darkMode ? "#0A1F3A" : "#FFF" }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/(tabs)")}>
        <Icon name="arrow-back" size={28} color={darkMode ? "#FFD700" : "#007AFF"} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.welcomeText, { color: darkMode ? "#6D8EB4" : "#333" }]}>Bienvenue sur</Text>
            <Text style={[styles.esisaText, { color: darkMode ? "#FFD700" : "#4B72FF" }]}>ESISA</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={[styles.inputContainer, { backgroundColor: darkMode ? "#1A3F6F" : "#E0E0E0", borderLeftColor: darkMode ? "#FFD700" : "#007AFF" }]}>
              <Icon name="email" size={20} color={darkMode ? "#FFD700" : "#007AFF"} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: darkMode ? "#FFF" : "#222" }]}
                placeholder="Email"
                placeholderTextColor={darkMode ? "#999" : "#666"}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: darkMode ? "#1A3F6F" : "#E0E0E0", borderLeftColor: darkMode ? "#FFD700" : "#007AFF" }]}>
              <Icon name="lock" size={20} color={darkMode ? "#FFD700" : "#007AFF"} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: darkMode ? "#FFF" : "#222" }]}
                placeholder="Mot de passe"
                placeholderTextColor={darkMode ? "#999" : "#666"}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordLink}
              onPress={navigateToForgotPassword}
            >
              <Text style={[styles.forgotPasswordText, { color: darkMode ? "#FFD700" : "#007AFF" }]}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: darkMode ? "#4B72FF" : "#007AFF" }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Se connecter</Text>
              <Icon name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>

            {errorMessage !== "" && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: darkMode ? "#6D8EB4" : "#666" }]}>© 2025 ESISA</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 70,
    left: 20,
    zIndex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  welcomeText: {
    fontSize: 18,
    letterSpacing: 2,
  },
  esisaText: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  loginButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  loginButtonText: {
    color: "#FFF",
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
    letterSpacing: 1,
  },
  errorText: {
    color: "#FF5555",
    textAlign: "center",
    marginTop: 15,
    fontSize: 14,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});

export default LoginScreen;
