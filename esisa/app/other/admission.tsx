import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import { Icon } from "react-native-elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { DarkModeContext } from "../context/DarkModeContext";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../utils/transactions";

export default function AdmissionScreen() {
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

        <View style={styles.headerContainer}>
          <Icon name="school" size={28} color={darkMode ? "#FFD700" : "#000"} />
          <Text
            style={[
              styles.pageTitle,
              { color: darkMode ? "#FFD700" : "#000" },
            ]}
          >
            {t.admissionTitle}
          </Text>
        </View>

        <Text
          style={[styles.introText, { color: darkMode ? "#DDD" : "#444" }]}
        >
          {t.admissionIntro}
        </Text>

        <Text style={[styles.sectionDescription, { color: darkMode ? "#DDD" : "#444" }]}>
          {t.admissionDescription1}
          <Text style={styles.highlightText}>{t.highlightMotivation}</Text> {t.and} <Text style={styles.highlightText}>{t.highlightPassion}</Text> {t.admissionDescription2}
        </Text>

        {/* Critères d'admission */}
        <View style={[styles.criteriaContainer, { borderColor: darkMode ? "#36D7B7" : "#36D7B7" }]}>
          {t.criteria.map(({ title, description }, i) => (
            <View key={i} style={styles.criteriaItem}>
              <Icon name="star" size={20} color="#FF4444" />
              <Text style={styles.criteriaText}>
                <Text style={styles.criteriaTitle}>{title} : </Text>
                {description}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionDescription, { color: darkMode ? "#DDD" : "#444" }]}>
          {t.admissionConclusion}
        </Text>

        {/* Étapes du processus */}
        <View style={[styles.processContainer, { borderColor: darkMode ? "#36D7B7" : "#36D7B7" }]}>
          <Text style={[styles.sectionTitle, { color: darkMode ? "#FFD700" : "#000" }]}>{t.processTitle}</Text>
          {t.processSteps.map(({ title, description }, i) => (
            <View key={i} style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{title}</Text>
                <Text style={[styles.stepDescription, { color: darkMode ? "#DDD" : "#444" }]}>{description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Profils admissibles */}
        <View style={[styles.profilesContainer, { borderColor: darkMode ? "#36D7B7" : "#36D7B7" }]}>
          <Text style={[styles.sectionTitle, { color: darkMode ? "#FFD700" : "#000" }]}>{t.profilesTitle}</Text>
          {t.profiles.map(({ title, description }, i) => (
            <View key={i} style={styles.profileItem}>
              <Icon name="check-circle" size={24} color="#36D7B7" />
              <Text style={styles.profileText}>
                <Text style={styles.profileTitle}>{title} : </Text>
                {description}
              </Text>
            </View>
          ))}
        </View>

        {/* Dates importantes */}
        <View style={[styles.datesContainer, { borderColor: darkMode ? "#36D7B7" : "#36D7B7" }]}>
          <Text style={[styles.sectionTitle, { color: darkMode ? "#FFD700" : "#000" }]}>{t.datesTitle}</Text>
          {t.dates.map(({ date, description }, i) => (
            <View key={i} style={styles.dateItem}>
              <Icon name="event" size={24} color="#FFD700" />
              <View style={styles.dateContent}>
                <Text style={styles.dateTitle}>{date}</Text>
                <Text style={[styles.dateDescription, { color: darkMode ? "#DDD" : "#444" }]}>{description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Contact */}
        <View style={[styles.contactContainer, { borderColor: darkMode ? "#36D7B7" : "#36D7B7" }]}>
          <Text style={[styles.sectionTitle, { color: darkMode ? "#FFD700" : "#000" }]}>{t.contactTitle}</Text>
          {t.contacts.map(({ icon, text }, i) => (
            <View key={i} style={styles.contactItem}>
              <Icon name={icon} size={24} color="#FFD700" />
              <Text style={[styles.contactText, { color: darkMode ? "#DDD" : "#444" }]}>{text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: darkMode ? "#1A3F6F" : "#36D7B7" }]}
          onPress={() => router.push("/other/form")}
        >
          <Text style={styles.buttonText}>{t.applyNow}</Text>
        </TouchableOpacity>
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
  sectionDescription: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  highlightText: {
    fontWeight: "bold",
    color: "#FFD700",
  },
  criteriaContainer: {
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
  },
  criteriaItem: {
    flexDirection: "row",
    marginBottom: 15,
    backgroundColor: "#48A4E5",
    padding: 12,
    borderRadius: 8,
    alignItems: "flex-start",
  },
  criteriaText: {
    color: "white",
    marginLeft: 10,
    flex: 1,
    fontSize: 15,
  },
  criteriaTitle: {
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  processContainer: {
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    padding: 15,
    marginVertical: 20,
    borderWidth: 1,
  },
  stepItem: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    marginTop: 5,
  },
  stepNumberText: {
    color: "#0A1F3A",
    fontWeight: "bold",
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: "#36D7B7",
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  profilesContainer: {
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
  },
  profileItem: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
  },
  profileText: {
    marginLeft: 10,
    flex: 1,
    fontSize: 15,
  },
  profileTitle: {
    fontWeight: "bold",
  },
  datesContainer: {
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
  },
  dateItem: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "flex-start",
  },
  dateContent: {
    marginLeft: 10,
    flex: 1,
  },
  dateTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  dateDescription: {
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
