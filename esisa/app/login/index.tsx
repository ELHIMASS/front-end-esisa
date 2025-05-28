import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import config from '../../config';



const { width } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  // ✅ Si déjà connecté, rediriger automatiquement
  useEffect(() => {
    const checkAlreadyLoggedIn = async () => {
      const admin = await AsyncStorage.getItem("admin");
      const student = await AsyncStorage.getItem("user");
      const prof = await AsyncStorage.getItem("prof");

      if (admin) router.replace("/admin");
      else if (student) router.replace("/(tabs)");
      else if (prof) router.replace("/prof");
    };

    checkAlreadyLoggedIn();
  }, []);

  const playSound = async (file: any) => {
    try {
      const { sound } = await Audio.Sound.createAsync(file);
      await sound.playAsync();
    } catch (error) {
      console.warn("Erreur audio :", error);
    }
  };
  

  const handleSubmit = async () => {
    setErrorMessage(""); // reset l'erreur

    if (!email || !password) {
        await playSound(require('../../assets/audio/error.mp3'));
        setErrorMessage("Veuillez remplir tous les champs.");
        return;
      }
      

    try {
      setLoading(true);
      const response = await fetch(`${config.API_URL}/api/login?email=${email}&password=${password}`);
      const userData = await response.json();

      if (!response.ok || !userData.role) {
        await playSound(require('../../assets/audio/error.mp3'));
        setErrorMessage("Email ou mot de passe incorrect.");
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
        setErrorMessage("Rôle utilisateur inconnu.");
      }

    } catch (err) {
      console.error("Erreur de connexion :", err);
      setErrorMessage("Erreur serveur. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const navigateToForgotPassword = () => {
    router.push("/forgotpassword");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/(tabs)")}>
        <Icon name="arrow-back" size={28} color="#FFD700" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>BIENVENUE À</Text>
          <Text style={styles.esisaText}>ESISA</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Icon name="email" size={20} color="#FFD700" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#6D8EB4"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#FFD700" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#6D8EB4"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.forgotPasswordLink}
            onPress={navigateToForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>CONNEXION</Text>
            <Icon name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>

          {errorMessage !== "" && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>ESISA © 2023 - Tous droits réservés</Text>
        </View>
      </ScrollView>
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
    backgroundColor: "#0A1F3A",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A1F3A",
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
    color: "#6D8EB4",
    letterSpacing: 2,
  },
  esisaText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: "#FFD700",
    letterSpacing: 2,
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#1A3F6F",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FFD700",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#FFF",
    fontSize: 16,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#FFD700",
    fontSize: 14,
  },
  loginButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#4B72FF",
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
    color: "#6D8EB4",
    fontSize: 12,
  },
});

export default LoginScreen;
