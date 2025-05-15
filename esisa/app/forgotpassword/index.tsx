import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const playSound = async (file: any) => {
    try {
      const { sound } = await Audio.Sound.createAsync(file);
      await sound.playAsync();
    } catch (error) {
      console.warn("Erreur audio :", error);
    }
  };

  const handleSubmit = async () => {
    setMessage("");
    
    if (!email) {
      await playSound(require('../../assets/audio/error.mp3'));
      setMessage("Veuillez entrer votre adresse email.");
      setIsSuccess(false);
      return;
    }

    try {
      setLoading(true);
        const response = await fetch('http://192.168.1.14:5000/api/forgotpassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        await playSound(require('../../assets/audio/done.mp3'));
        setMessage("Un email de récupération a été envoyé à votre adresse.");
        setIsSuccess(true);
      } else {
        await playSound(require('../../assets/audio/error.mp3'));
        setMessage(data.message || "Aucun compte n'est associé à cette adresse.");
        setIsSuccess(false);
      }
    } catch (err) {
      console.error("Erreur de récupération :", err);
      setMessage("Erreur serveur. Veuillez réessayer.");
      setIsSuccess(false);
      await playSound(require('../../assets/audio/error.mp3'));
    } finally {
      setLoading(false);
    }
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
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Icon name="arrow-back" size={28} color="#FFD700" />
      </TouchableOpacity>

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>MOT DE PASSE OUBLIÉ</Text>
          <Text style={styles.subtitle}>
            Entrez votre adresse email pour recevoir un lien de récupération
          </Text>
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

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>ENVOYER</Text>
            <Icon name="send" size={18} color="#FFF" />
          </TouchableOpacity>

          {message !== "" && (
            <Text style={[
              styles.messageText,
              isSuccess ? styles.successText : styles.errorText
            ]}>
              {message}
            </Text>
          )}

          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => router.replace("/login")}
          >
            <Text style={styles.loginLinkText}>Retour à la connexion</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#FFD700",
    letterSpacing: 1,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: "#6D8EB4",
    textAlign: 'center',
    lineHeight: 22,
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
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#4B72FF",
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 10,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  submitButtonText: {
    color: "#FFF",
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
    letterSpacing: 1,
  },
  messageText: {
    textAlign: "center",
    marginTop: 15,
    fontSize: 14,
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: "#FF5555",
    backgroundColor: "rgba(255, 85, 85, 0.1)",
  },
  successText: {
    color: "#4CAF50",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  loginLink: {
    marginTop: 30,
    alignSelf: 'center',
  },
  loginLinkText: {
    color: "#FFD700",
    fontSize: 16,
  },
});

export default ForgotPasswordScreen;