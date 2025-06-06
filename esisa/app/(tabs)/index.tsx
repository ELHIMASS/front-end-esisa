import { router } from "expo-router";
import React, { useEffect, useRef, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Modal,
  Pressable,
  SafeAreaView,
  useWindowDimensions,
  Image,
  StatusBar,
} from "react-native";
import { Icon } from "react-native-elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";

import { DarkModeContext, DarkModeProvider } from "../context/DarkModeContext";
import { LanguageContext } from "../context/LanguageContext";

// Traductions à compléter selon besoins
const translations = {
  fr: {
    accueil: "🏠 Accueil",
    profil: "👤 Profil",
    formations: "🎓 Formations",
    messagerie: "💬 Messagerie",
    laboratoires: "🔬 Laboratoires",
    international: "🌐 International",
    calendrier: "📅 Calendrier",
    einstein: "👴 Einstein",
    settings: "⚙️ Réglages",
    deconnexion: "🔓 Déconnexion",
    espaceEtudiant: "🔑 Espace étudiant",
    welcomeTitle: "École Supérieure d'Ingénierie en Sciences Appliquées",
    welcomeSubtitle: "Formation d'excellence en développement et sciences informatiques",
    formationsBtn: "FORMATIONS",
    admissionBtn: "ADMISSION",
    virtualExperience: "🎥 Expérience virtuelle à 360°",
  },
  en: {
    accueil: "🏠 Home",
    profil: "👤 Profile",
    formations: "🎓 Courses",
    messagerie: "💬 Messaging",
    corpsEnseignant: "👨‍🏫 Faculty",
    programmes: "📚 Programs",
    laboratoires: "🔬 Labs",
    international: "🌐 International",
    calendrier: "📅 Calendar",
    campus: "🏢 Campus",
    einstein: "👴 Einstein",
    settings: "⚙️ Settings",
    deconnexion: "🔓 Logout",
    espaceEtudiant: "🔑 Student Area",
    welcomeTitle: "Higher School of Applied Science Engineering",
    welcomeSubtitle: "Excellence in development and computer science training",
    formationsBtn: "COURSES",
    admissionBtn: "ADMISSION",
    virtualExperience: "🎥 Virtual experience at 360°",

  },
  ar: {
    accueil: "🏠 الرئيسية",
    profil: "👤 الملف الشخصي",
    formations: "🎓 الدورات",
    messagerie: "💬 الرسائل",
    laboratoires: "🔬 المختبرات",
    international: "🌐 دولي",
    calendrier: "📅 التقويم",
    einstein: "👴 أينشتاين",
    settings: "⚙️ الإعدادات",
    deconnexion: "🔓 تسجيل الخروج",
    espaceEtudiant: "🔑 منطقة الطالب",
    welcomeTitle: "المدرسة العليا للهندسة في العلوم التطبيقية",
    welcomeSubtitle: "تدريب متميز في تطوير البرمجيات وعلوم الكمبيوتر",
    formationsBtn: "الدورات",
    admissionBtn: "القبول",
    virtualExperience: "🎥 تجربة افتراضية بزاوية 360°",
  },
  es: {
    accueil: "🏠 Inicio",
    profil: "👤 Perfil",
    formations: "🎓 Cursos",
    messagerie: "💬 Mensajes",
    laboratoires: "🔬 Laboratorios",
    international: "🌐 Internacional",
    calendrier: "📅 Calendario",
    einstein: "👴 Einstein",
    settings: "⚙️ Configuración",
    deconnexion: "🔓 Cerrar sesión",
    espaceEtudiant: "🔑 Área de estudiante",
    welcomeTitle: "Escuela Superior de Ingeniería en Ciencias Aplicadas",
    welcomeSubtitle: "Excelencia en formación en desarrollo y ciencias de la computación",
    formationsBtn: "CURSOS",
    admissionBtn: "ADMISIÓN",
    virtualExperience: "🎥 Experiencia virtual a 360°",
  },
};

function ESISAHomePageInner() {
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string } | null>(null);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const { darkMode } = useContext(DarkModeContext);
  const { language } = useContext(LanguageContext);

  const t = translations[language] || translations.fr;

  // Audio click sound
  const playClickSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/audio/tap.mp3")
      );
      await sound.playAsync();
    } catch (error) {
      console.log("Erreur de lecture du son :", error);
    }
  };

  // Session reset on first launch
  useEffect(() => {
    const resetSessionOnFirstLaunch = async () => {
      const firstLaunch = await AsyncStorage.getItem("firstLaunchDone");
      if (!firstLaunch) {
        await AsyncStorage.multiRemove(["user", "prof", "admin"]);
        await AsyncStorage.setItem("firstLaunchDone", "true");
      }
    };
    resetSessionOnFirstLaunch();
  }, []);

  const codeSegments = 15;
  const [codeTrailPosition, setCodeTrailPosition] = useState([]);
  const directionRef = useRef({ x: 1, y: 0 });
  const animationSpeed = 120;
  const segmentSize = 12;

  const codeSymbols = ["{", "}", "(", ")", ";", "<>", "[]", "//", "=>", "&&", "||", "+=", "==", "++"];
  const [segmentSymbols, setSegmentSymbols] = useState([]);

  useEffect(() => {
    const initialX = Math.floor(width / 2);
    const initialY = Math.floor(height / 3);
    const initialPositions = [];
    const initialSymbols = [];

    for (let i = 0; i < codeSegments; i++) {
      initialPositions.push({ x: initialX - i * segmentSize, y: initialY });
      initialSymbols.push(codeSymbols[Math.floor(Math.random() * codeSymbols.length)]);
    }

    setCodeTrailPosition(initialPositions);
    setSegmentSymbols(initialSymbols);
    const intervalId = setInterval(() => moveCodeTrail(), animationSpeed);

    return () => clearInterval(intervalId);
  }, [width, height]);

  const moveCodeTrail = () => {
    setCodeTrailPosition((prevPositions) => {
      if (!prevPositions || prevPositions.length === 0) return prevPositions;
      const newPositions = [...prevPositions];
      const head = { x: newPositions[0].x, y: newPositions[0].y };

      const centerX = width / 2;
      const centerY = height / 2;
      const distanceFromCenter = Math.sqrt((head.x - centerX) ** 2 + (head.y - centerY) ** 2);
      const changeDirectionProb = Math.min(0.15, 0.05 + (distanceFromCenter / (width + height)) * 0.2);

      if (Math.random() < changeDirectionProb) {
        const preferredX = head.x < centerX ? 1 : -1;
        const preferredY = head.y < centerY ? 1 : -1;
        const directions = [];

        for (let i = 0; i < 3; i++) directions.push({ x: preferredX, y: 0 });
        for (let i = 0; i < 3; i++) directions.push({ x: 0, y: preferredY });
        directions.push({ x: -preferredX, y: 0 });
        directions.push({ x: 0, y: -preferredY });

        const validDirections = directions.filter(
          (dir) => !(dir.x === -directionRef.current.x && dir.y === -directionRef.current.y)
        );

        const newDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
        directionRef.current = newDirection;

        setSegmentSymbols((prevSymbols) => {
          const newSymbols = [...prevSymbols];
          newSymbols[0] = codeSymbols[Math.floor(Math.random() * codeSymbols.length)];
          return newSymbols;
        });
      }

      head.x += directionRef.current.x * segmentSize;
      head.y += directionRef.current.y * segmentSize;

      if (head.x < 0) head.x = 0;
      if (head.x > width - segmentSize) head.x = width - segmentSize;
      if (head.y < 0) head.y = 0;
      if (head.y > height - segmentSize) head.y = height - segmentSize;

      newPositions.unshift(head);
      if (newPositions.length > codeSegments) newPositions.pop();

      return newPositions;
    });
  };

  const toggleMenu = async () => {
    const sound = new Audio.Sound();
    try {
      await sound.loadAsync(require("../../assets/audio/tap.mp3"));
      await sound.playAsync();
    } catch (e) {
      console.warn("Erreur lecture son :", e);
    }

    if (isMenuVisible) {
      Animated.timing(slideAnim, {
        toValue: width * 0.75,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      if (await AsyncStorage.getItem("prof")) {
        router.replace("/prof");
        return;
      } else if (await AsyncStorage.getItem("admin")) {
        router.replace("/admin");
        return;
      }
      const student = await AsyncStorage.getItem("user");

      let user = null;
      if (student) user = JSON.parse(student);

      if (user) {
        setIsLoggedIn(true);
        setUserInfo({ name: user.name || user.nom || user.fullName });
      } else {
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setIsLoggedIn(false);
    setUserInfo(null);
    router.replace("/login");
  };

  const menuItems = isLoggedIn
    ? [
        { label: t.accueil, route: "/" },
        { label: t.profil, route: "/explore" },
        { label: t.formations, route: "/other/formation" },
        { label: t.messagerie, route: "/chat/choose" },
        { label: t.laboratoires, route: "/other/laboratoire" },
        { label: t.international, route: "/other/international" },
        { label: t.calendrier, route: "/other/calendrier" },
        { label: t.einstein, route: "/chat/chatgpt" },
        { label: t.virtualExperience, route: "/other/orbit" },
        { label: t.settings, route: "/Settings" },
        { label: t.deconnexion, route: "/", onPress: handleLogout },
      ]
    : [
        { label: t.accueil, route: "/" },
        { label: t.formations, route: "/other/formation" },
        { label: t.international, route: "/other/international" },
        { label: t.calendrier, route: "/other/calendrier" },
        { label: t.einstein, route: "/chat/chatgpt" },
        { label: t.settings, route: "/Settings/settings" },
        { label: t.espaceEtudiant, route: "/login" },
      ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: darkMode ? "#0A1F3A" : "#FFFFFF" }]}
    >
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} backgroundColor={darkMode ? "#0A1F3A" : "#FFF"} />

      {codeTrailPosition.map((segment, index) => (
        <View
          key={index}
          style={[styles.codeSegment, { left: segment.x, top: segment.y, opacity: 1 - (index / codeSegments) * 0.6, width: segmentSize, height: segmentSize }]}
        >
          <Text style={[styles.codeSymbol, { color: darkMode ? "#36D7B7" : "#1A3F6F" }]}>
            {segmentSymbols[index]}
          </Text>
        </View>
      ))}

      <TouchableOpacity
        onPress={toggleMenu}
        style={{
          position: "absolute",
          top: insets.top + 10,
          right: 20,
          zIndex: 10,
          backgroundColor: darkMode ? "#1A3F6F" : "#1A3F6F",
          borderRadius: 20,
          padding: 10,
        }}
      >
        <Icon name="menu" size={30} color="#FFD700" />
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/icons/icon.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.mainContent}>
        <Text style={[styles.welcomeText, { color: darkMode ? "#FFD700" : "#1A3F6F" }]}>
          {t.welcomeTitle}
        </Text>
        <Text style={[styles.subText, { color: darkMode ? "#BBB" : "#444" }]}>
          {t.welcomeSubtitle}
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: darkMode ? "#1A3F6F" : "#0056b3" }]}
            onPress={async () => {
              await playClickSound();
              router.push("/other/formation");
            }}
          >
            <Text style={styles.buttonText}>{t.formationsBtn}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: darkMode ? "#1A3F6F" : "#0056b3" }]}
            onPress={async () => {
              await playClickSound();
              router.push("/other/admission");
            }}
          >
            <Text style={styles.buttonText}>{t.admissionBtn}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu latéral */}
      <Modal visible={isMenuVisible} transparent animationType="none" onRequestClose={toggleMenu}>
        <Pressable style={styles.modalBackgroundRight} onPress={toggleMenu}>
          <Animated.View
            style={[
              styles.menuDrawerRight,
              { transform: [{ translateX: slideAnim }] },
              { backgroundColor: darkMode ? "#0A1F3A" : "#FFF" },
            ]}
          >
            <View style={styles.menuHeader}>
              <Text style={[styles.menuHeaderText, { color: darkMode ? "#FFD700" : "#0056b3" }]}>ESISA</Text>
              {userInfo && (
                <Text style={[styles.userNameText, { color: darkMode ? "#6D8EB4" : "#0056b3" }]}>
                  {userInfo.name}
                </Text>
              )}
            </View>

            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, { borderBottomColor: darkMode ? "#1A3F6F" : "#0056b3" }]}
                onPress={async () => {
                  await playClickSound();
                  toggleMenu();
                  if (item.onPress) item.onPress();
                  else router.push(item.route as any);
                }}
              >
                <Text
                  style={[
                    styles.menuText,
                    {
                      color:
                        item.label && item.label.includes("🔑")
                          ? "#4CAF50"
                          : item.label && item.label.includes("🔓")
                          ? "#FF5252"
                          : darkMode
                          ? "#FFF"
                          : "#000",
                    },
                  ]}
                >
                  {item.label}
                </Text>

                <Icon name="chevron-right" size={20} color={darkMode ? "#FFD700" : "#000"} />
              </TouchableOpacity>
            ))}
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

export default function ESISAHomePage() {
  return (
    <DarkModeProvider>
      <LanguageContext.Consumer>
        {() => <ESISAHomePageInner />}
      </LanguageContext.Consumer>
    </DarkModeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoImage: { marginTop: 40, width: 170, height: 170 },
  codeSegment: {
    position: "absolute",
    backgroundColor: "rgba(0, 150, 255, 0.2)",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#36D7B7",
    shadowColor: "#36D7B7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
  },
  codeSymbol: {
    fontSize: 8,
    fontWeight: "bold",
  },
  logoContainer: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 5,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 150,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  actionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 150,
    alignItems: "center",
    borderColor: "#36D7B7",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  modalBackgroundRight: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    flexDirection: "row",
  },
  menuDrawerRight: {
    width: "75%",
    height: "100%",
    padding: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderLeftWidth: 2,
    borderLeftColor: "#FFD700",
  },
  menuHeader: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  menuHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
  },
  userNameText: {
    marginTop: 5,
    fontSize: 14,
    textAlign: "center",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 16,
  },
});
