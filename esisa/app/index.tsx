import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Audio } from "expo-av";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { LinearGradient } from "expo-linear-gradient";
import { Platform } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function SplashScreenPage() {
  // Définition des caractères à afficher un par un
  const textParts = ["B", "i", "e", "n", "v", "e", "n", "u", "e", " ", "à", " ", "l", "'", "E", "S", "I", "S", "A"];
  const [displayIndex, setDisplayIndex] = useState(0);
  const logoAnim = useRef(new Animated.Value(0)).current;

  // Animation logo
  useEffect(() => {
    Animated.timing(logoAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Animation texte lettre par lettre
  useEffect(() => {
    if (displayIndex < textParts.length) {
      const timeout = setTimeout(() => {
        setDisplayIndex(displayIndex + 1);
      }, 90);
      return () => clearTimeout(timeout);
    }
  }, [displayIndex]);

  // Audio + redirection
  useEffect(() => {
    const playSoundAndRedirect = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../assets/audio/intro.mp3")
        );
        await sound.playAsync();

        setTimeout(async () => {
          await SplashScreen.hideAsync();
          router.replace("/(tabs)");
        }, 3000);
      } catch (e) {
        console.warn("Erreur audio:", e);
        router.replace("/(tabs)");
      }
    };
    playSoundAndRedirect();
  }, []);

  return (
    <LinearGradient colors={["#0A1F3A", "#1A3F6F"]} style={styles.container}>
      <Animated.Image
        source={require("../assets/icons/icon.png")}
        style={[
          styles.logo,
          {
            opacity: logoAnim,
            transform: [
              {
                scale: logoAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }),
              },
            ],
          },
        ]}
        resizeMode="contain"
      />
      <Text style={styles.text}>
        {textParts.slice(0, displayIndex).join('')}
      </Text>
      <Text style={styles.footer}>Powered by : Learnify</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 30,
  },
  text: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFD700",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  footer: {
    position: "absolute",
    bottom: 20,
    fontSize: 14,
    color: "#6D8EB4",
  },
});