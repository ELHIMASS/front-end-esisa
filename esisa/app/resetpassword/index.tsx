import React, { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { Audio } from "expo-av";
import config from '../../config';


const ResetPasswordScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const { token } = useLocalSearchParams();
  

  const playSound = async (file: any) => {
    try {
      const { sound } = await Audio.Sound.createAsync(file);
      await sound.playAsync();
    } catch (error) {
      console.warn("Erreur audio :", error);
    }
  };

  // Vérifier la validité du token au chargement
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        await playSound(require('../../assets/audio/error.mp3'));
        setMessage("Lien invalide ou expiré.");
        setIsSuccess(false);
        return;
      }
      
      try {
        const response = await fetch(`${config.API_IP}/api/forgotpassword/verify?token=${token}`);
        
        if (!response.ok) {
          await playSound(require('../../assets/audio/error.mp3'));
          setMessage("Ce lien est invalide ou a expiré.");
          setIsSuccess(false);
        }
      } catch (err) {
        console.error("Erreur de vérification du token :", err);
        setMessage("Erreur de communication avec le serveur.");
        setIsSuccess(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async () => {
    setMessage("");
    
    // Validation
    if (!password || !confirmPassword) {
      await playSound(require('../../assets/audio/error.mp3'));
      setMessage("Veuillez remplir tous les champs.");
      setIsSuccess(false);
      return;
    }

    if (password !== confirmPassword) {
      await playSound(require('../../assets/audio/error.mp3'));
      setMessage("Les mots de passe ne correspondent pas.");
      setIsSuccess(false);
      return;
    }

    if (password.length < 6) {
      await playSound(require('../../assets/audio/error.mp3'));
      setMessage("Le mot de passe doit contenir au moins 6 caractères.");
      setIsSuccess(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${config.API_IP}/api/forgotpassword/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword: password }),
    });


      const data = await response.json();

      if (response.ok) {
        await playSound(require('../../assets/audio/done.mp3'));
        setMessage("Votre mot de passe a été réinitialisé avec succès!");
        setIsSuccess(true);
        
        // Rediriger vers la page de connexion après 2 secondes
        setTimeout(() => {
          router.replace("/login");
        }, 2000);
      } else {
        await playSound(require('../../assets/audio/error.mp3'));
        setMessage(data.message || "Erreur lors de la réinitialisation du mot de passe.");
        setIsSuccess(false);
      }
    } catch (err) {
      console.error("Erreur de réinitialisation :", err);
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
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>RÉINITIALISATION</Text>
          <Text style={styles.subtitle}>
            Choisissez un nouveau mot de passe pour votre compte
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#FFD700" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nouveau mot de passe"
              placeholderTextColor="#6D8EB4"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock-outline" size={20} color="#FFD700" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmez le mot de passe"
              placeholderTextColor="#6D8EB4"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>RÉINITIALISER</Text>
            <Icon name="refresh" size={18} color="#FFF" />
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

export default ResetPasswordScreen;
