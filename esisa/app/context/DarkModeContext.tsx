// context/DarkModeContext.tsx
import React, { createContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface DarkModeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

export const DarkModeContext = createContext<DarkModeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
  setDarkMode: () => {},
});

export const DarkModeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkModeState] = useState(false);

  useEffect(() => {
    // Charger la préférence stockée
    AsyncStorage.getItem("darkMode").then((value) => {
      if (value !== null) {
        setDarkModeState(value === "true");
      }
    });
  }, []);

  const setDarkMode = (value: boolean) => {
    setDarkModeState(value);
    AsyncStorage.setItem("darkMode", value ? "true" : "false");
  };

  const toggleDarkMode = () => {
    setDarkModeState((prev) => {
      const newVal = !prev;
      AsyncStorage.setItem("darkMode", newVal ? "true" : "false");
      return newVal;
    });
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};
