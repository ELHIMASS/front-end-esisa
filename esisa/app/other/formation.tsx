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

export default function FormationScreen() {
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

      {/* Back Button */}
      <TouchableOpacity
        onPress={goBack}
        style={[
          styles.backButton,
          { backgroundColor: darkMode ? "#1A3F6F" : "#ddd" },
        ]}
      >
        <Icon name="arrow-back" size={24} color={darkMode ? "#FFD700" : "#000"} />
      </TouchableOpacity>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/icons/icon.png")}
            style={styles.logoImage}
          />
        </View>

        <Text style={[styles.pageTitle, { color: darkMode ? "#FFD700" : "#0056b3" }]}>
          {t.coursesTitle}
        </Text>
        <Text
          style={[
            styles.sectionDescription,
            { color: darkMode ? "#DDD" : "#444" },
          ]}
        >
          {t.coursesIntro}
        </Text>

        {/* Premier Cycle */}
        <View
          style={[
            styles.cycleContainer,
            { backgroundColor: darkMode ? "rgba(26, 63, 111, 0.3)" : "#e6f0ff" },
            { borderColor: darkMode ? "#36D7B7" : "#0056b3" },
          ]}
        >
          <View style={[styles.cycleHeader, { backgroundColor: darkMode ? "#1A3F6F" : "#0056b3" }]}>
            <Text style={[styles.cycleTitle, { color: darkMode ? "#FFD700" : "#FFF" }]}>
              {t.firstCycleTitle}
            </Text>
          </View>

          <View style={styles.yearContainer}>
            <Text style={[styles.yearTitle, { color: darkMode ? "#36D7B7" : "#003366" }]}>
              {t.years12Title}
            </Text>
            <Text style={[styles.yearDescription, { color: darkMode ? "#DDD" : "#444" }]}>
              {t.years12Description}
            </Text>
            <View style={styles.subjectsList}>
              {t.years12Subjects.map((subj, i) => (
                <Text
                  key={i}
                  style={[styles.subjectItem, { color: darkMode ? "#BBB" : "#222" }]}
                >
                  • {subj}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.yearContainer}>
            <Text style={[styles.yearTitle, { color: darkMode ? "#36D7B7" : "#003366" }]}>
              {t.year3Title}
            </Text>
            <Text style={[styles.yearDescription, { color: darkMode ? "#DDD" : "#444" }]}>
              {t.year3Description}
            </Text>
            <View style={styles.subjectsList}>
              {t.year3Subjects.map((subj, i) => (
                <Text
                  key={i}
                  style={[styles.subjectItem, { color: darkMode ? "#BBB" : "#222" }]}
                >
                  • {subj}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Deuxième Cycle */}
        <View
          style={[
            styles.cycleContainer,
            { backgroundColor: darkMode ? "rgba(26, 63, 111, 0.3)" : "#e6f0ff" },
            { borderColor: darkMode ? "#36D7B7" : "#0056b3" },
          ]}
        >
          <View style={[styles.cycleHeader, { backgroundColor: darkMode ? "#1A3F6F" : "#0056b3" }]}>
            <Text style={[styles.cycleTitle, { color: darkMode ? "#FFD700" : "#FFF" }]}>
              {t.secondCycleTitle}
            </Text>
          </View>

          <View style={styles.yearContainer}>
            <Text style={[styles.yearTitle, { color: darkMode ? "#36D7B7" : "#003366" }]}>
              {t.years45Title}
            </Text>
            <Text style={[styles.yearDescription, { color: darkMode ? "#DDD" : "#444" }]}>
              {t.years45Description1}
            </Text>
            <Text style={[styles.yearDescription, { color: darkMode ? "#DDD" : "#444" }]}>
              {t.years45Description2}
            </Text>
            <Text style={[styles.yearDescription, { color: darkMode ? "#DDD" : "#444" }]}>
              {t.years45Description3}
            </Text>
            <View style={styles.subjectsList}>
              {t.years45Options.map((opt, i) => (
                <Text
                  key={i}
                  style={[styles.subjectItem, { color: darkMode ? "#BBB" : "#222" }]}
                >
                  • {opt}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Section langues */}
        <View
          style={[
            styles.languageSection,
            { backgroundColor: darkMode ? "rgba(26, 63, 111, 0.3)" : "#e6f0ff" },
            { borderColor: darkMode ? "#36D7B7" : "#0056b3" },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: darkMode ? "#FFD700" : "#0056b3" }]}>
            {t.languageSectionTitle}
          </Text>
          <Text style={[styles.sectionDescription, { color: darkMode ? "#DDD" : "#444" }]}>
            {t.languageSectionDesc1}
          </Text>
          <Text style={[styles.sectionDescription, { color: darkMode ? "#DDD" : "#444" }]}>
            {t.languageSectionDesc2}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkContainer: { backgroundColor: "#0A1F3A" },
  lightContainer: { backgroundColor: "#FFF" },
  scrollView: {
    flex: 1,
  },
  logoImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginTop: -20,
  },
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
  cycleContainer: {
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
  },
  cycleHeader: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  cycleTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 0,
  },
  yearContainer: {
    padding: 15,
    borderBottomWidth: 1,
  },
  yearTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  yearDescription: {
    fontSize: 15,
    marginBottom: 10,
    lineHeight: 21,
  },
  subjectsList: {
    marginLeft: 10,
    marginTop: 5,
  },
  subjectItem: {
    fontSize: 15,
    marginBottom: 5,
    lineHeight: 20,
  },
  languageSection: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
    borderWidth: 1,
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
  backButton: {
    position: "absolute",
    top: 70,
    left: 20,
    zIndex: 10,
    borderRadius: 20,
    padding: 10,
  },
});