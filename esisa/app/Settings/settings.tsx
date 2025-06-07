import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  Switch,
  TextInput,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router"; // Added missing import

import { DarkModeContext } from "../context/DarkModeContext";
import { LanguageContext } from "../context/LanguageContext";

import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Dummy notifications for the example
const dummyNotifications = [
  { id: "1", title: "Nouvelle note disponible", date: "2025-06-02" },
  { id: "2", title: "Absence validée", date: "2025-06-01" },
  { id: "3", title: "Message de M. Dupont", date: "2025-05-30" },
];

export default function Settings() {
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  const { language, setLanguage } = useContext(LanguageContext);
  const router = useRouter(); // Initialize router properly

  const [showNotifications, setShowNotifications] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const insets = useSafeAreaInsets();

  

  useEffect(() => {
  const goBackByRole = async () => {
    const role = await AsyncStorage.getItem("role");
    const currentRoute = router.pathname;

    if (currentRoute === "/settings") {
      if (role === "admin") {
        router.replace("/admin");
      } else if (role === "prof") {
        router.replace("/prof");
      } else if (role === "student" || role === null) {
        router.replace("/(tabs)");
      }
    }
  };

  goBackByRole();
}, []);


  

  const handleToggleDarkMode = () => {
    toggleDarkMode();
    Alert.alert("Mode sombre", darkMode ? "Mode clair activé" : "Mode sombre activé");
  };

  const handleLanguageChange = () => {
    const newLang = language === "fr" ? "en" : language === "en" ? "es" : language === "es" ? "ar" : "fr";
    setLanguage(newLang);
    
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Erreur", "Merci de remplir tous les champs.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Erreur", "Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    Alert.alert("Succès", "Mot de passe changé avec succès.");
    setShowChangePassword(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const currentTheme = darkMode ? styles.dark : styles.light;

  return (
    <View style={[styles.container, currentTheme.container]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, currentTheme.text]}>
          {language === "fr" ? "Réglages" : language === "es" ? "Configuración" : language === "ar" ? "الإعدادات" : "Settings"}
        </Text>
         
        <TouchableOpacity onPress={() => setShowNotifications(true)} style={styles.iconBtn}>
          <Icon name="notifications-outline" size={30} color={darkMode ? "#FFD700" : "#1A3F6F"} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Apparence */}
        <View style={[styles.card, currentTheme.card]}>
          <Text style={[styles.cardTitle, currentTheme.text]}>
            {language === "fr" ? "Apparence" : language === "es" ? "Apariencia" : language === "ar" ? "المظهر" : "Appearance"}
          </Text>
          <View style={styles.row}>
            <Text style={[styles.text, currentTheme.text]}>
              {language === "fr" ? "Mode sombre" : language === "es" ? "Modo oscuro" : language === "ar" ? "الوضع المظلم" : "Dark Mode"}
            </Text>
            <Switch
              value={darkMode}
              onValueChange={handleToggleDarkMode}
              thumbColor={darkMode ? "#FFD700" : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#FFD700" }}
            />
          </View>

          <View style={[styles.row, styles.rowSpaced]}>
            <Text style={[styles.text, currentTheme.text]}>
              {language === "fr" ? "Langue" : language === "es" ? "Idioma" : language === "ar" ? "اللغة" : "Language"}
            </Text>
            <TouchableOpacity
              style={[styles.languageSelector, currentTheme.languageSelector]}
              onPress={handleLanguageChange}
            >
              <Text style={[styles.text, currentTheme.text]}>
                {language === "fr" ? "Français" : language === "es" ? "Español" : language === "ar" ? "عربي" : "English"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Compte */}
        <View style={[styles.card, currentTheme.card]}>
          <Text style={[styles.cardTitle, currentTheme.text]}>
            {language === "fr" ? "Compte" : language === "es" ? "Cuenta" : language === "ar" ? "الحساب" : "Account"}
          </Text>
          <TouchableOpacity style={[styles.button, currentTheme.button]} onPress={() => setShowChangePassword(true)}>
            <Text style={[styles.buttonText, currentTheme.buttonText]}>
              {language === "fr" ? "Changer mot de passe" : language === "es" ? "Cambiar contraseña" : language === "ar" ? "تغيير كلمة المرور" : "Change password"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Aide & Support */}
        <View style={[styles.card, currentTheme.card]}>
          <Text style={[styles.cardTitle, currentTheme.text]}>
            {language === "fr" ? "Aide & Support" : language === "es" ? "Ayuda y Soporte" : language === "ar" ? "المساعدة والدعم" : "Help & Support"}
          </Text>
          <TouchableOpacity
            style={[styles.button, currentTheme.button]}
            onPress={() =>
              Alert.alert(language === "fr" ? "FAQ" : language === "es" ? "FAQ" : language === "ar" ? "الأسئلة المتكررة" : "FAQ", 
                          language === "fr" ? "Ici la FAQ dédiée à la scolarité." : language === "es" ? "Aquí está la FAQ de la escuela." : language === "ar" ? "هنا الأسئلة المتكررة" : "School FAQ here.")
            }
          >
            <Text style={[styles.buttonText, currentTheme.buttonText]}>
              {language === "fr" ? "FAQ dédiée à la scolarité" : language === "es" ? "FAQ de la escuela" : language === "ar" ? "الأسئلة المتكررة" : "School FAQ"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, currentTheme.button]}
            onPress={() =>
              Alert.alert(language === "fr" ? "Contact" : language === "es" ? "Contacto" : language === "ar" ? "اتصال" : "Contact", 
                          language === "fr" ? "Contact professeurs / administration" : language === "es" ? "Contacto con profesores / administración" : language === "ar" ? "اتصال مع المعلمين / الإدارة" : "Contact teachers / administration")
            }
          >
            <Text style={[styles.buttonText, currentTheme.buttonText]}>
              {language === "fr" ? "Contact professeurs / administration" : language === "es" ? "Contacto con profesores / administración" : language === "ar" ? "اتصال مع المعلمين / الإدارة" : "Contact teachers / administration"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Infos légales */}
        <View style={[styles.card, currentTheme.card]}>
          <Text style={[styles.cardTitle, currentTheme.text]}>
            {language === "fr" ? "Informations légales" : language === "es" ? "Información legal" : language === "ar" ? "المعلومات القانونية" : "Legal Information"}
          </Text>
          <TouchableOpacity
            style={[styles.button, currentTheme.button]}
            onPress={() => Alert.alert("CGU", language === "fr" ? "Conditions générales d'utilisation" : language === "es" ? "Términos y condiciones" : language === "ar" ? "شروط الاستخدام" : "Terms and conditions")}
          >
            <Text style={[styles.buttonText, currentTheme.buttonText]}>
              CGU
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, currentTheme.button]}
            onPress={() => Alert.alert("Politique", language === "fr" ? "Politique de confidentialité" : language === "es" ? "Política de privacidad" : language === "ar" ? "سياسة الخصوصية" : "Privacy Policy")}
          >
            <Text style={[styles.buttonText, currentTheme.buttonText]}>
              {language === "fr" ? "Politique de confidentialité" : language === "es" ? "Política de privacidad" : language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, currentTheme.button]}
            onPress={() => Alert.alert("Règlement", language === "fr" ? "Règlement intérieur scolaire" : language === "es" ? "Reglamento escolar" : language === "ar" ? "القوانين المدرسية" : "School rules")}
          >
            <Text style={[styles.buttonText, currentTheme.buttonText]}>
              {language === "fr" ? "Règlement intérieur scolaire" : language === "es" ? "Reglamento escolar" : language === "ar" ? "القوانين المدرسية" : "School rules"}
            </Text>
          </TouchableOpacity>
          <View style={styles.versionContainer}>
            <Text style={[styles.versionText, currentTheme.text]}>
              {language === "fr" ? "Version de l'application : 1.0.0" : language === "es" ? "Versión de la aplicación: 1.0.0" : language === "ar" ? "إصدار التطبيق: 1.0.0" : "App version: 1.0.0"}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal Notifications */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={[styles.modalContainer, currentTheme.container]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, currentTheme.text]}>
              {language === "fr" ? "Notifications" : "Notifications"}
            </Text>
            <TouchableOpacity onPress={() => setShowNotifications(false)}>
              <Icon
                name="close"
                size={28}
                color={darkMode ? "#FFD700" : "#1A3F6F"}
              />
            </TouchableOpacity>
          </View>
          <FlatList
            data={dummyNotifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.notificationItem}>
                <Text style={[styles.notificationTitle, currentTheme.text]}>
                  {item.title}
                </Text>
                <Text style={[styles.notificationDate, currentTheme.text]}>
                  {item.date}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={[styles.emptyText, currentTheme.text]}>
                {language === "fr" ? "Aucune notification" : "No notifications"}
              </Text>
            }
          />
        </View>
      </Modal>

      {/* Modal Changer mot de passe */}
      <Modal
        visible={showChangePassword}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowChangePassword(false)}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, currentTheme.container]}>
            <Text style={[styles.modalTitle, currentTheme.text]}>
              {language === "fr" ? "Changer mot de passe" : "Change password"}
            </Text>

            <Text style={[styles.inputLabel, currentTheme.text]}>
              {language === "fr" ? "Ancien mot de passe" : "Old password"}
            </Text>
            <TextInput
              style={[styles.input, currentTheme.input]}
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder={language === "fr" ? "Ancien mot de passe" : "Old password"}
              placeholderTextColor={darkMode ? "#bbb" : "#666"}
            />

            <Text style={[styles.inputLabel, currentTheme.text]}>
              {language === "fr" ? "Nouveau mot de passe" : "New password"}
            </Text>
            <TextInput
              style={[styles.input, currentTheme.input]}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={language === "fr" ? "Nouveau mot de passe" : "New password"}
              placeholderTextColor={darkMode ? "#bbb" : "#666"}
            />

            <Text style={[styles.inputLabel, currentTheme.text]}>
              {language === "fr" ? "Confirmer nouveau mot de passe" : "Confirm new password"}
            </Text>
            <TextInput
              style={[styles.input, currentTheme.input]}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={language === "fr" ? "Confirmer mot de passe" : "Confirm password"}
              placeholderTextColor={darkMode ? "#bbb" : "#666"}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowChangePassword(false)}
              >
                <Text style={styles.cancelButtonText}>
                  {language === "fr" ? "Annuler" : "Cancel"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.validateButton}
                onPress={handleChangePassword}
              >
                <Text style={styles.validateButtonText}>
                  {language === "fr" ? "Valider" : "Validate"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    backgroundColor: "#1A3F6F",
    borderRadius: 20,
    padding: 10,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  iconBtn: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowSpaced: {
    marginTop: 15,
  },
  languageSelector: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  versionContainer: {
    marginTop: 15,
  },
  versionText: {
    fontSize: 14,
    opacity: 0.7,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  notificationItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#FFD700",
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  notificationDate: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(10,31,58,0.9)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    marginRight: 8,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#444",
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  validateButton: {
    flex: 1,
    paddingVertical: 14,
    marginLeft: 8,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#FFD700",
  },
  validateButtonText: {
    color: "#000",
    fontWeight: "bold",
  },

  // Theme variants
  light: {
    container: {
      backgroundColor: "#FFFFFF",
    },
    card: {
      backgroundColor: "#FFFFFF",
    },
    text: {
      color: "#1A3F6F",
    },
    button: {
      backgroundColor: "#1A3F6F",
    },
    buttonText: {
      color: "#FFFFFF",
    },
    languageSelector: {
      borderColor: "#1A3F6F",
    },
    input: {
      borderColor: "#1A3F6F",
      backgroundColor: "#FFFFFF",
      color: "#1A3F6F",
    },
  },
  dark: {
    container: {
      backgroundColor: "#0A1F3A",
    },
    card: {
      backgroundColor: "#102D56",
    },
    text: {
      color: "#FFFFFF",
    },
    button: {
      backgroundColor: "#FFD700",
    },
    buttonText: {
      color: "#0A1F3A",
    },
    languageSelector: {
      borderColor: "#FFD700",
    },
    input: {
      borderColor: "#FFD700",
      backgroundColor: "#0A1F3A",
      color: "#FFFFFF",
    },
  },
});
