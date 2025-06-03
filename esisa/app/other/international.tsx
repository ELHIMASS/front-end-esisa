import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
} from "react-native";
import { Icon } from "react-native-elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { DarkModeContext } from "../context/DarkModeContext";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../utils/transactions";

const logos = [
  require("../../assets/icons/icon.png"),
  require("../../assets/partenaire/amu.png"),
  require("../../assets/partenaire/cote1.png"),
  require("../../assets/partenaire/cotedazur.png"),
  require("../../assets/partenaire/ensiie1.png"),
  require("../../assets/partenaire/iscid.png"),
  require("../../assets/partenaire/isima1.png"),
  require("../../assets/partenaire/poly1.png"),
  require("../../assets/partenaire/paris81.png"),
  require("../../assets/partenaire/lor1.png"),
  require("../../assets/partenaire/lyon1.png"),
  require("../../assets/partenaire/lille1.png"),
  require("../../assets/partenaire/uca1.png"),
  require("../../assets/partenaire/unvop1.png"),
  require("../../assets/partenaire/paris131.png"),
  require("../../assets/partenaire/unvbou1.png"),
  require("../../assets/partenaire/lis1.png"),
];

export default function InternationalPage() {
  const insets = useSafeAreaInsets();
  const { darkMode } = useContext(DarkModeContext);
  const { language } = useContext(LanguageContext);
  const t = translations[language];

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
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/icons/icon.png")}
            style={styles.logoImageTop}
            resizeMode="contain"
          />
        </View>

        <Text
          style={[
            styles.pageTitle,
            { color: darkMode ? "#FFD700" : "#000" },
          ]}
        >
          {t.internationalTitle || "L'ESISA ET L'INTERNATIONAL"}
        </Text>

        <Text
          style={[styles.sectionDescription, { color: darkMode ? "#DDD" : "#444" }]}
        >
          {t.internationalIntro ||
            "🚀 Une formation tournée vers l’international : L'ESISA ouvre à ses étudiants les portes d’une carrière mondiale grâce à ses partenariats avec des institutions de renom en France, aux États-Unis et au-delà. Nos programmes sont conçus pour offrir une expérience académique et professionnelle enrichissante."}
        </Text>

        {/* Stages */}
        <View
          style={[
            styles.cycleContainer,
            { borderColor: darkMode ? "#36D7B7" : "#36D7B7" },
          ]}
        >
          <View style={styles.cycleHeader}>
            <Text style={styles.cycleTitle}>
              {t.internationalStagesTitle || "📅 STAGES À L'ÉTRANGER"}
            </Text>
          </View>
          <View style={styles.yearContainer}>
            <Text style={[styles.yearDescription, { color: darkMode ? "#DDD" : "#444" }]}>
              {t.internationalStagesDesc ||
                "- 3ème année : Stage de 2 à 3 mois dans des entreprises partenaires.\n- 5ème année : Stage de 4 à 6 mois dans des secteurs innovants."}
            </Text>
          </View>
        </View>

        {/* Linguistiques */}
        <View
          style={[
            styles.cycleContainer,
            { borderColor: darkMode ? "#36D7B7" : "#36D7B7" },
          ]}
        >
          <View style={styles.cycleHeader}>
            <Text style={styles.cycleTitle}>
              {t.internationalSkillsTitle || "🧠 COMPÉTENCES LINGUISTIQUES"}
            </Text>
          </View>
          <View style={styles.yearContainer}>
            <Text style={[styles.yearDescription, { color: darkMode ? "#DDD" : "#444" }]}>
              {t.internationalSkillsDesc ||
                "- Préparation avancée au TOEIC pour une maîtrise de l’anglais professionnel.\n- Certification B2/C1 en français grâce à notre partenariat avec l’Institut Français."}
            </Text>
          </View>
        </View>

        {/* Carrières */}
        <View
          style={[
            styles.cycleContainer,
            { borderColor: darkMode ? "#36D7B7" : "#36D7B7" },
          ]}
        >
          <View style={styles.cycleHeader}>
            <Text style={styles.cycleTitle}>
              {t.internationalCareersTitle || "🌍 CARRIÈRES GLOBALES"}
            </Text>
          </View>
          <View style={styles.yearContainer}>
            <Text style={[styles.yearDescription, { color: darkMode ? "#DDD" : "#444" }]}>
              {t.internationalCareersDesc ||
                "Chaque année, nos étudiants poursuivent leurs études dans des établissements de prestige ou débutent leur carrière dans des environnements internationaux.\nPour l’année universitaire 2025/2026, 95% de nos étudiants de master 1 IS2IA ont intégré des masters dans des universités prestigieuses et des écoles d’ingénieurs d’État en France."}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.pageTitle,
            { color: darkMode ? "#FFD700" : "#000", marginTop: 30 },
          ]}
        >
          {t.internationalAdmittedTitle || "🌎 ADMIS À L'ÉTRANGER"}
        </Text>
        <Text
          style={[styles.sectionDescription, { color: darkMode ? "#DDD" : "#444" }]}
        >
          {t.internationalAdmittedDesc ||
            "Chaque année, une grande partie des étudiants de la 4ème année continuent leurs études en France, soit avec nos partenaires, soit dans d'autres universités étrangères.\nL’année universitaire 2024/2025, 95% des étudiants ont été acceptés dans nos universités et écoles partenaires."}
        </Text>

        <Text
          style={[styles.sectionTitle, { color: darkMode ? "#FFD700" : "#000" }]}
        >
          {t.internationalPartnersTitle || "NOS PARTENAIRES EN FRANCE"}
        </Text>
        <View style={styles.logoGrid}>
          {logos.map((img, index) => (
            <Image
              key={index}
              source={img}
              style={styles.logoImage}
              resizeMode="contain"
            />
          ))}
        </View>

        <View
          style={[
            styles.footerContainer,
            { borderColor: darkMode ? "#36D7B7" : "#36D7B7" },
          ]}
        >
          <View style={styles.footerRow}>
            <Text style={[styles.footerIcon, { color: darkMode ? "#FFD700" : "#000" }]}>
              📍
            </Text>
            <View>
              <Text
                style={[styles.footerLabel, { color: darkMode ? "#FFD700" : "#000" }]}
              >
                {t.internationalAddressLabel || "ADRESSE"}
              </Text>
              <Text style={[styles.footerText, { color: darkMode ? "#DDD" : "#444" }]}>
                {t.internationalAddress || "29 Bis Av Ibn Khatib Route d’Imouzzer, Fès-Maroc"}
              </Text>
            </View>
          </View>

          <View style={styles.footerRow}>
            <Text style={[styles.footerIcon, { color: darkMode ? "#FFD700" : "#000" }]}>
              📞
            </Text>
            <View>
              <Text
                style={[styles.footerLabel, { color: darkMode ? "#FFD700" : "#000" }]}
              >
                {t.internationalPhoneLabel || "TÉLÉPHONE"}
              </Text>
              <Text style={[styles.footerText, { color: darkMode ? "#DDD" : "#444" }]}>
                {t.internationalPhone || "+212 (0)6 61 45 35 09"}
              </Text>
            </View>
          </View>

          <View style={styles.footerRow}>
            <Text style={[styles.footerIcon, { color: darkMode ? "#FFD700" : "#000" }]}>
              📧
            </Text>
            <View>
              <Text
                style={[styles.footerLabel, { color: darkMode ? "#FFD700" : "#000" }]}
              >
                {t.internationalEmailLabel || "EMAIL"}
              </Text>
              <Text style={[styles.footerText, { color: darkMode ? "#DDD" : "#444" }]}>
                {t.internationalEmail || "info@esisa.ac.ma"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkContainer: { backgroundColor: "#0A1F3A" },
  lightContainer: { backgroundColor: "#FFF" },
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
  logoImageTop: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: -20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionDescription: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
    textAlign: "justify",
  },
  cycleContainer: {
    marginTop: 20,
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#36D7B7",
    overflow: "hidden",
  },
  cycleHeader: {
    backgroundColor: "#1A3F6F",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#36D7B7",
  },
  cycleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
  },
  yearContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(54, 215, 183, 0.3)",
  },
  yearDescription: {
    fontSize: 15,
    lineHeight: 21,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 30,
    textAlign: "center",
  },
  logoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },
  logoImage: {
    width: width / 3 - 30,
    height: 60,
    margin: 5,
    marginTop: 20,
  },
  footerContainer: {
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    padding: 20,
    marginTop: 30,
    borderWidth: 1,
    borderColor: "#36D7B7",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  footerIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  footerLabel: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  footerText: {
    fontSize: 15,
  },
});
