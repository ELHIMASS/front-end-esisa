import React, { createContext, useState, useEffect, ReactNode } from "react";
import { Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => Promise<void>;
  availableLanguages: { code: string; label: string }[];
}

export const LanguageContext = createContext<LanguageContextType>({
  language: "fr",
  setLanguage: async () => {},
  availableLanguages: [],
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState("fr");
  
  // Liste des langues supportées
  const availableLanguages = [
    { code: "fr", label: "Français" },
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "ar", label: "عربي" },
  ];

  // Charger la langue sauvegardée au démarrage
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('@app_language');
        if (savedLanguage && availableLanguages.some(lang => lang.code === savedLanguage)) {
          setLanguageState(savedLanguage);
        }
      } catch (error) {
        console.error('Failed to load language', error);
      }
    };
    
    loadLanguage();
  }, []);

  const setLanguage = async (newLang: string) => {
    try {
      // Vérifier que la langue est supportée
      if (!availableLanguages.some(lang => lang.code === newLang)) {
        throw new Error('Unsupported language');
      }

      // Sauvegarder la nouvelle langue
      await AsyncStorage.setItem('@app_language', newLang);
      setLanguageState(newLang);
      
      // Afficher une alerte avec le nom de la langue
      const langObj = availableLanguages.find(lang => lang.code === newLang);
      Alert.alert(
        "Language changed",
        `Language set to ${langObj?.label || newLang}`
      );
    } catch (error) {
      console.error('Failed to save language', error);
      Alert.alert("Error", "Failed to change language");
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};