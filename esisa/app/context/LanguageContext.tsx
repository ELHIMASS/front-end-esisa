import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LanguageContext = createContext({
  language: 'fr',
  setLanguage: (lang: string) => {},
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('fr');

  // Charger la langue au démarrage
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('appLanguage');
        if (savedLang) setLanguageState(savedLang);
      } catch (e) {
        console.log('Erreur lecture langue', e);
      }
    };
    loadLanguage();
  }, []);

  // Fonction pour changer la langue ET la sauvegarder
  const setLanguage = async (lang) => {
    try {
      await AsyncStorage.setItem('appLanguage', lang);
      setLanguageState(lang);
    } catch (e) {
      console.log('Erreur sauvegarde langue', e);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
