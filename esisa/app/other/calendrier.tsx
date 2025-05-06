// app/calendrier.tsx
import React, { useState } from "react";
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

export default function CalendrierScreen() {
  const insets = useSafeAreaInsets();
  const [selectedSemester, setSelectedSemester] = useState("S1");

  const goBack = () => {
    // Navigate back using Expo Router
    router.back();
  };

  const renderSchedule = () => {
    switch(selectedSemester) {
      case "S1":
        return (
          <View style={styles.scheduleContainer}>
            <Text style={styles.scheduleTitle}>Semestre 1 (Sept - Jan)</Text>
            <View style={styles.eventItem}>
              <View style={styles.eventDate}>
                <Text style={styles.dateText}>05</Text>
                <Text style={styles.monthText}>SEPT</Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>Rentrée universitaire</Text>
                <Text style={styles.eventDesc}>Premier jour de cours pour les étudiants</Text>
              </View>
            </View>
            <View style={styles.eventItem}>
              <View style={styles.eventDate}>
                <Text style={styles.dateText}>15</Text>
                <Text style={styles.monthText}>OCT</Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>Examens partiels</Text>
                <Text style={styles.eventDesc}>Examens de mi-semestre pour toutes les filières</Text>
              </View>
            </View>
            <View style={styles.eventItem}>
              <View style={styles.eventDate}>
                <Text style={styles.dateText}>10</Text>
                <Text style={styles.monthText}>DÉC</Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>Hackathon annuel</Text>
                <Text style={styles.eventDesc}>Compétition de programmation sur 48h</Text>
              </View>
            </View>
            <View style={styles.eventItem}>
              <View style={styles.eventDate}>
                <Text style={styles.dateText}>15</Text>
                <Text style={styles.monthText}>JAN</Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>Examens finaux S1</Text>
                <Text style={styles.eventDesc}>Examens de fin du premier semestre</Text>
              </View>
            </View>
          </View>
        );
      case "S2":
        return (
          <View style={styles.scheduleContainer}>
            <Text style={styles.scheduleTitle}>Semestre 2 (Fév - Juin)</Text>
            <View style={styles.eventItem}>
              <View style={styles.eventDate}>
                <Text style={styles.dateText}>01</Text>
                <Text style={styles.monthText}>FÉV</Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>Début du semestre 2</Text>
                <Text style={styles.eventDesc}>Reprise des cours pour le second semestre</Text>
              </View>
            </View>
            <View style={styles.eventItem}>
              <View style={styles.eventDate}>
                <Text style={styles.dateText}>20</Text>
                <Text style={styles.monthText}>MAR</Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>Forum entreprises</Text>
                <Text style={styles.eventDesc}>Rencontre avec les recruteurs et professionnels</Text>
              </View>
            </View>
            <View style={styles.eventItem}>
              <View style={styles.eventDate}>
                <Text style={styles.dateText}>15</Text>
                <Text style={styles.monthText}>AVR</Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>Examens partiels</Text>
                <Text style={styles.eventDesc}>Examens de mi-semestre pour toutes les filières</Text>
              </View>
            </View>
            <View style={styles.eventItem}>
              <View style={styles.eventDate}>
                <Text style={styles.dateText}>10</Text>
                <Text style={styles.monthText}>JUIN</Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>Examens finaux S2</Text>
                <Text style={styles.eventDesc}>Examens de fin d'année académique</Text>
              </View>
            </View>
          </View>
        );
      case "Spécial":
        return (
          <View style={styles.scheduleContainer}>
            <Text style={styles.scheduleTitle}>Événements Spéciaux</Text>
            <View style={styles.eventItem}>
              <View style={styles.eventDate}>
                <Text style={styles.dateText}>10</Text>
                <Text style={styles.monthText}>NOV</Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>Journée portes ouvertes</Text>
                <Text style={styles.eventDesc}>Présentation de l'école aux futurs étudiants</Text>
              </View>
            </View>
            <View style={styles.eventItem}>
              <View style={styles.eventDate}>
                <Text style={styles.dateText}>15</Text>
                <Text style={styles.monthText}>FÉV</Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>Concours d'admission</Text>
                <Text style={styles.eventDesc}>Tests d'entrée pour les nouveaux candidats</Text>
              </View>
            </View>
            <View style={styles.eventItem}>
              <View style={styles.eventDate}>
                <Text style={styles.dateText}>05</Text>
                <Text style={styles.monthText}>MAI</Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>ESISA Tech Day</Text>
                <Text style={styles.eventDesc}>Exposition des projets étudiants et conférences</Text>
              </View>
            </View>
            <View style={styles.eventItem}>
              <View style={styles.eventDate}>
                <Text style={styles.dateText}>30</Text>
                <Text style={styles.monthText}>JUIN</Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>Cérémonie de remise des diplômes</Text>
                <Text style={styles.eventDesc}>Célébration des nouveaux diplômés</Text>
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A1F3A" }}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1F3A" />

      {/* Back Button */}
      <TouchableOpacity
        onPress={goBack}
        style={{
          position: "absolute",
          top: insets.top + 10,
          left: 20,
          zIndex: 10,
          backgroundColor: "#1A3F6F",
          borderRadius: 20,
          padding: 10,
        }}
      >
        <Icon name="arrow-back" size={24} color="#FFD700" />
      </TouchableOpacity>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('C:/Users/ismai/Desktop/front-end-esisa/esisa/assets/icons/icon.png')}
            style={styles.logoImage}
          />
        </View>
        
        <Text style={styles.pageTitle}>Calendrier Académique</Text>
        <Text style={styles.sectionDescription}>
          Consultez les dates importantes de l'année académique, incluant les périodes 
          d'examens, les événements spéciaux et les vacances scolaires.
        </Text>

        {/* Semester Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, selectedSemester === "S1" && styles.activeTab]}
            onPress={() => setSelectedSemester("S1")}
          >
            <Text style={[styles.tabText, selectedSemester === "S1" && styles.activeTabText]}>Semestre 1</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, selectedSemester === "S2" && styles.activeTab]}
            onPress={() => setSelectedSemester("S2")}
          >
            <Text style={[styles.tabText, selectedSemester === "S2" && styles.activeTabText]}>Semestre 2</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, selectedSemester === "Spécial" && styles.activeTab]}
            onPress={() => setSelectedSemester("Spécial")}
          >
            <Text style={[styles.tabText, selectedSemester === "Spécial" && styles.activeTabText]}>Événements</Text>
          </TouchableOpacity>
        </View>

        {/* Schedule Content */}
        {renderSchedule()}

        {/* Academic Year Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Année Académique 2024-2025</Text>
          <View style={styles.infoItem}>
            <Icon name="event" size={18} color="#36D7B7" style={styles.infoIcon} />
            <Text style={styles.infoText}>Rentrée universitaire: 5 septembre 2024</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="timer" size={18} color="#36D7B7" style={styles.infoIcon} />
            <Text style={styles.infoText}>Fin des cours: 20 juin 2025</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="school" size={18} color="#36D7B7" style={styles.infoIcon} />
            <Text style={styles.infoText}>Remise des diplômes: 30 juin 2025</Text>
          </View>
        </View>

        {/* Vacances */}
        <View style={styles.vacancesSection}>
          <Text style={styles.sectionTitle}>Périodes de Vacances</Text>
          <View style={styles.vacanceItem}>
            <Text style={styles.vacanceName}>Vacances d'automne</Text>
            <Text style={styles.vacanceDates}>28 oct. - 5 nov. 2024</Text>
          </View>
          <View style={styles.vacanceItem}>
            <Text style={styles.vacanceName}>Vacances d'hiver</Text>
            <Text style={styles.vacanceDates}>23 déc. 2024 - 6 jan. 2025</Text>
          </View>
          <View style={styles.vacanceItem}>
            <Text style={styles.vacanceName}>Vacances de printemps</Text>
            <Text style={styles.vacanceDates}>24 fév. - 3 mars 2025</Text>
          </View>
          <View style={styles.vacanceItem}>
            <Text style={styles.vacanceName}>Vacances de Pâques</Text>
            <Text style={styles.vacanceDates}>14 avr. - 21 avr. 2025</Text>
          </View>
        </View>

        {/* Call to Action */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.buttonText}>Télécharger le calendrier complet (PDF)</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
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
  logoImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginTop: -20,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFD700",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionDescription: {
    fontSize: 16,
    color: "#DDD",
    marginBottom: 20,
    lineHeight: 22,
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#36D7B7",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "rgba(54, 215, 183, 0.3)",
  },
  activeTab: {
    backgroundColor: "#1A3F6F",
  },
  tabText: {
    color: "#CCC",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFD700",
    fontWeight: "bold",
  },
  scheduleContainer: {
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#36D7B7",
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 15,
    textAlign: "center",
  },
  eventItem: {
    flexDirection: "row",
    marginBottom: 15,
    backgroundColor: "rgba(10, 31, 58, 0.5)",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(54, 215, 183, 0.3)",
  },
  eventDate: {
    width: 60,
    backgroundColor: "#1A3F6F",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  dateText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFD700",
  },
  monthText: {
    fontSize: 12,
    color: "#36D7B7",
    fontWeight: "bold",
  },
  eventDetails: {
    flex: 1,
    padding: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 5,
  },
  eventDesc: {
    fontSize: 14,
    color: "#BBB",
  },
  infoSection: {
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#36D7B7",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 15,
    color: "#DDD",
  },
  vacancesSection: {
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#36D7B7",
  },
  vacanceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(54, 215, 183, 0.3)",
  },
  vacanceName: {
    fontSize: 15,
    color: "#FFF",
    fontWeight: "500",
  },
  vacanceDates: {
    fontSize: 15,
    color: "#36D7B7",
  },
  actionButton: {
    backgroundColor: "#1A3F6F",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#36D7B7",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});