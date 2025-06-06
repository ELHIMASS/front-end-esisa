import React, { useState, useRef, useCallback, useContext } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Dimensions,
  StatusBar 
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Icon } from "react-native-elements";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import des contextes
import { DarkModeContext } from "../context/DarkModeContext";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../utils/transactions"; // Utilisation du même fichier de traductions

export default function LabScreen() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();


  // Utilisation des contextes
  const { darkMode } = useContext(DarkModeContext);
  const { language } = useContext(LanguageContext);

  const screenHeight = Dimensions.get("window").height;

  // Utilisation des traductions centralisées
  const t = translations[language];

  const handleVisibility = useCallback((event) => {
    const layout = event.nativeEvent.layout;
    const videoBottom = layout.y + layout.height;

    if (videoBottom > 0 && layout.y < screenHeight / 2) {
      if (!isPlaying) {
        videoRef.current?.playAsync();
        setIsPlaying(true);
      }
    } else {
      if (isPlaying) {
        videoRef.current?.pauseAsync();
        setIsPlaying(false);
      }
    }
  }, [isPlaying]);

  const goBack = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        darkMode ? styles.darkContainer : styles.lightContainer,
        { paddingTop: insets.top },
      ]}
    >
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={darkMode ? "#0A1F3A" : "#FFF"}
      />

      {/* Bouton retour */}
      <TouchableOpacity
        onPress={goBack}
        style={{
          position: "absolute",
          top: insets.top + 10,
          left: 20,
          zIndex: 10,
          backgroundColor: darkMode ? "#1A3F6F" : "#ddd",
          borderRadius: 20,
          padding: 10,
        }}
      >
        <Icon name="arrow-back" size={24} color={darkMode ? "#FFD700" : "#000"} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/icons/image.png")}
            style={styles.logoImageTop}
            resizeMode="contain"
          />
        </View>

        {/* Header avec icône et titre */}
        <View style={styles.headerContainer}>
          <Icon name="science" size={28} color={darkMode ? "#FFD700" : "#000"} />
          <Text
            style={[
              styles.pageTitle,
              { color: darkMode ? "#FFD700" : "#000" },
            ]}
          >
            {t.labTitle || "ESISA ANALYTICA"}
          </Text>
        </View>

        {/* Description principale */}
        <Text
          style={[styles.introText, { color: darkMode ? "#DDD" : "#444" }]}
        >
          {t.labDescription || "Bienvenue dans notre laboratoire, où l'innovation et la recherche sont au cœur de nos activités."}
        </Text>

        {/* Section Recherches */}
        <View style={[styles.researchContainer, { borderColor: darkMode ? "#36D7B7" : "#36D7B7" }]}>
          <Text style={[styles.sectionTitle, { color: darkMode ? "#FFD700" : "#000" }]}>
            {t.researchTitle || "Nos Recherches"}
          </Text>
          <Text style={[styles.sectionDescription, { color: darkMode ? "#DDD" : "#444" }]}>
            {t.researchDescription || "Découvrez nos projets et collaborations à travers des vidéos immersives."}
          </Text>

          {/* Domaines de recherche */}
          {(t.researchAreas || [
            { title: "Intelligence Artificielle", description: "Développement d'algorithmes avancés" },
            { title: "Analyse de Données", description: "Traitement et visualisation de données complexes" },
            { title: "Systèmes Embarqués", description: "Conception de solutions IoT innovantes" }
          ]).map((area, i) => (
            <View key={i} style={styles.researchItem}>
              <Icon name="lightbulb-outline" size={20} color="#FFD700" />
              <Text style={styles.researchText}>
                <Text style={styles.researchItemTitle}>{area.title} : </Text>
                <Text style={[styles.researchItemDesc, { color: darkMode ? "#DDD" : "#444" }]}>
                  {area.description}
                </Text>
              </Text>
            </View>
          ))}
        </View>

        {/* Vidéo */}
        <View style={[styles.videoSection, { borderColor: darkMode ? "#36D7B7" : "#36D7B7" }]}>
          <Text style={[styles.sectionTitle, { color: darkMode ? "#FFD700" : "#000" }]}>
            {t.videoTitle || "Vidéo de Présentation"}
          </Text>
          <View
            style={[
              styles.videoContainer, 
              { backgroundColor: darkMode ? "#1A3F6F" : "#F5F5F5" }
            ]}
            onLayout={handleVisibility}
          >
            <Video
              ref={videoRef}
              source={require("../../assets/video/analitica.mp4")}
              style={styles.video}
              useNativeControls
              resizeMode={ResizeMode.COVER}
              isLooping
              shouldPlay={isPlaying}
              isMuted={false}
            />
          </View>
        </View>

        {/* Équipements */}
        <View style={[styles.equipmentContainer, { borderColor: darkMode ? "#36D7B7" : "#36D7B7" }]}>
          <Text style={[styles.sectionTitle, { color: darkMode ? "#FFD700" : "#000" }]}>
            {t.equipmentTitle || "Nos Équipements"}
          </Text>
          {(t.equipment || [
            { name: "Serveurs haute performance", description: "Pour le calcul intensif" },
            { name: "Stations de développement", description: "Environnements de développement avancés" },
            { name: "Laboratoire IoT", description: "Espace dédié aux objets connectés" }
          ]).map((item, i) => (
            <View key={i} style={styles.equipmentItem}>
              <Icon name="memory" size={24} color="#36D7B7" />
              <View style={styles.equipmentContent}>
                <Text style={[styles.equipmentName, { color: darkMode ? "#FFD700" : "#000" }]}>
                  {item.name}
                </Text>
                <Text style={[styles.equipmentDescription, { color: darkMode ? "#DDD" : "#444" }]}>
                  {item.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Contact Laboratoire */}
        <View style={[styles.contactContainer, { borderColor: darkMode ? "#36D7B7" : "#36D7B7" }]}>
          <Text style={[styles.sectionTitle, { color: darkMode ? "#FFD700" : "#000" }]}>
            {t.labContactTitle || "Contact Laboratoire"}
          </Text>
          {(t.labContacts || [
            { icon: "email", text: "info@esisa.ac.ma" },
            { icon: "phone", text: "+212 5 35 65 70 95" },
            { icon: "location-on", text: "29 bis avenue Ibn Khatib, route D'imouzzer, Fès 30050" }
          ]).map((contact, i) => (
            <View key={i} style={styles.contactItem}>
              <Icon name={contact.icon} size={24} color="#FFD700" />
              <Text style={[styles.contactText, { color: darkMode ? "#DDD" : "#444" }]}>
                {contact.text}
              </Text>
            </View>
          ))}
        </View>

       
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkContainer: { backgroundColor: "#0A1F3A" },
  lightContainer: { backgroundColor: "#FFF" },
  logoImageTop: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: -20,
  },
  scrollView: { flex: 1 },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
    paddingTop: 120,
  },
  logoContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 5,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 10,
  },
  introText: {
    fontSize: 16,
    fontStyle: "italic",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  sectionDescription: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  researchContainer: {
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
  },
  researchItem: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "flex-start",
  },
  researchText: {
    marginLeft: 10,
    flex: 1,
    fontSize: 15,
  },
  researchItemTitle: {
    fontWeight: "bold",
    color: "#36D7B7",
  },
  researchItemDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  videoSection: {
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
  },
  videoContainer: {
    width: "100%",
    height: 620,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  equipmentContainer: {
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
  },
  equipmentItem: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "flex-start",
  },
  equipmentContent: {
    marginLeft: 10,
    flex: 1,
  },
  equipmentName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  equipmentDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  contactContainer: {
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
  },
  contactItem: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
  },
  contactText: {
    marginLeft: 10,
    fontSize: 15,
  },
  actionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    marginVertical: 20,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});