import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
} from "react-native";
import { Icon } from "react-native-elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av"; // ✅ IMPORT AUDIO
import { red } from "react-native-reanimated/lib/typescript/Colors";
import { DarkModeProvider } from '../context/DarkModeContext'; // chemin relatif selon ta structure
import Settings from "../Settings/settings";
export default function ESISAHomePage() {
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string } | null>(null);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

 

  // ✅ Audio : fonction pour jouer le son de clic
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

  // ✅ Effacer la session uniquement au tout premier lancement
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
      await sound.loadAsync(require("../../assets/audio/tap.mp3")); // adapte le chemin si besoin
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
      }else if (await AsyncStorage.getItem("admin")) {
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
        { label: "🏠 Accueil", route: "/" },
        { label: "👤 Profil", route: "/explore" },
        { label: "🎓 Formations", route: "/other/formation" },
        { label: "💬 Messagerie", route: "/chat/choose"},
        { label: "👨‍🏫 Corps enseignant", route: "#" },
        { label: "📚 Programmes", route: "#" },
        { label: "🔬 Laboratoires", route: "#" },
        { label: "🌐 International", route: "/other/international" },
        { label: "📅 Calendrier", route: "/other/calendrier" },
        { label: "🏢 Campus", route: "#" },
        { label: "👴 Einstein", route: "/chat/chatgpt" },
        { label: "🏠 Settings", route: "/Settings" },


        { label: "🔓 Déconnexion", route: "/", onPress: handleLogout },
      ]
    : [
        { label: "🏠 Accueil", route: "/" },
        { label: "🎓 Formations", route: "/other/formation" },
        { label: "🌐 International", route: "/other/international" },
        { label: "📅 Calendrier", route: "/other/calendrier" },
        { label: "👴 Einstein", route: "/chat/chatgpt" },

        
        { label: "🔑 Espace étudiant", route: "/login" },


      ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A1F3A" }}>
      {codeTrailPosition.map((segment, index) => (
        <View
          key={index}
          style={[
            styles.codeSegment,
            {
              left: segment.x,
              top: segment.y,
              opacity: 1 - (index / codeSegments) * 0.6,
              width: segmentSize,
              height: segmentSize,
            },
          ]}
        >
          <Text style={styles.codeSymbol}>{segmentSymbols[index]}</Text>
        </View>
      ))}

      <TouchableOpacity
        onPress={toggleMenu}
        style={{
          position: "absolute",
          top: insets.top + 10,
          right: 20,
          zIndex: 10,
          backgroundColor: "#1A3F6F",
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
        <Text style={styles.welcomeText}>École Supérieure d'Ingénierie en Sciences Appliquées</Text>
        <Text style={styles.subText}>Formation d'excellence en développement et sciences informatiques</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={async () => {
              await playClickSound();
              router.push("/other/formation");
            }}
          >
            <Text style={styles.buttonText}>FORMATIONS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={async () => {
              await playClickSound();
              router.push("/other/admission");
            }}
          >
            <Text style={styles.buttonText}>ADMISSION</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={isMenuVisible} transparent animationType="none" onRequestClose={toggleMenu}>
        <Pressable style={styles.modalBackgroundRight} onPress={toggleMenu}>
          <Animated.View style={[styles.menuDrawerRight, { transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuHeaderText}>ESISA</Text>
              {userInfo && <Text style={styles.userNameText}>{userInfo.name}</Text>}
            </View>

            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={async () => {
                  await playClickSound(); // 🔊 jouer le son avant
                  toggleMenu();
                  if (item.onPress) item.onPress();
                  else router.push(item.route as any);
                }}
                
              >
                <Text
                  style={[
                    styles.menuText,
                    item.label.includes("🔑") ? { color: "#4CAF50" } :
                    item.label.includes("🔓") ? { color: "#FF5252" } : {},
                  ]}
                >
                  {item.label}
                </Text>
                <Icon name="chevron-right" size={20} color="#FFD700" />
              </TouchableOpacity>
            ))}
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
   return (
    <DarkModeProvider>
      <Settings />
    </DarkModeProvider>
  );
  
}



const styles = StyleSheet.create({
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
    color: "#36D7B7",
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
    color: "#FFF",
    textAlign: "center",
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: "#BBB",
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
    backgroundColor: "#1A3F6F",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#36D7B7",
    minWidth: 150,
    alignItems: "center",
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
    backgroundColor: "#0A1F3A",
    padding: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderLeftWidth: 2,
    borderLeftColor: "#FFD700",
  },
  menuHeader: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1A3F6F",
    marginBottom: 10,
  },
  menuHeaderText: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
  },
  userNameText: {
    marginTop: 5,
    fontSize: 14,
    color: "#6D8EB4",
    textAlign: "center",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#1A3F6F",
  },
  menuText: {
    fontSize: 16,
    color: "#FFF",
  },
});
