import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import config from '../../config';
import { DarkModeContext } from '../context/DarkModeContext';
import { useTranslation } from 'react-i18next';

const ForgotPasswordScreen: React.FC = () => {
  const { darkMode } = useContext(DarkModeContext);
  const { t } = useTranslation();
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const router = useRouter();

  const playSound = async (file: any) => {
    try {
      const { sound } = await Audio.Sound.createAsync(file);
      await sound.playAsync();
    } catch (error) {
      console.warn(t('audio_error'), error);
    }
  };

  const handleSubmit = async () => {
    setMessage("");
    
    if (!email) {
      await playSound(require('../../assets/audio/error.mp3'));
      setMessage(t('enter_email'));
      setIsSuccess(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${config.API_IP}/api/forgotpassword`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({ email })
      }); 

      const data = await response.json();

      if (response.ok) {
        await playSound(require('../../assets/audio/done.mp3'));
        setMessage(t('reset_email_sent'));
        setIsSuccess(true);
      } else {
        await playSound(require('../../assets/audio/error.mp3'));
        setMessage(data.message || t('no_account_found'));
        setIsSuccess(false);
      }
    } catch (err) {
      console.error(t('reset_error'), err);
      setMessage(t('server_error_retry'));
      setIsSuccess(false);
      await playSound(require('../../assets/audio/error.mp3'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: darkMode ? "#0A1F3A" : "#FFF" }]}>
        <ActivityIndicator size="large" color={darkMode ? "#FFD700" : "#4B72FF"} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: darkMode ? "#0A1F3A" : "#FFF" }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Icon name="arrow-back" size={28} color={darkMode ? "#FFD700" : "#007AFF"} />
      </TouchableOpacity>

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: darkMode ? "#FFD700" : "#000" }]}>{t('forgot password')}</Text>
          <Text style={[styles.subtitle, { color: darkMode ? "#6D8EB4" : "#555" }]}>
            {t('forgot password')}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={[styles.inputContainer, { backgroundColor: darkMode ? "#1A3F6F" : "#E0E0E0", borderLeftColor: darkMode ? "#FFD700" : "#007AFF" }]}>
            <Icon name="email" size={20} color={darkMode ? "#FFD700" : "#007AFF"} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: darkMode ? "#FFF" : "#222" }]}
              placeholder={t('email')}
              placeholderTextColor={darkMode ? "#999" : "#666"}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: darkMode ? "#4B72FF" : "#007AFF" }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>{t('send')}</Text>
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
            <Text style={[styles.loginLinkText, { color: darkMode ? "#FFD700" : "#007AFF" }]}>{t('back to login')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    letterSpacing: 1,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
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
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 16,
  },
});

export default ForgotPasswordScreen;
