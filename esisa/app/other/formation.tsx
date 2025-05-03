// app/formation.tsx
import React from "react";
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

export default function FormationScreen() {
  const insets = useSafeAreaInsets();

  const goBack = () => {
    // Navigate back using Expo Router
    router.back();
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
             source={require('C:/Users/ismai/Desktop/front-end-esisa/esisa/assets/images/icon.png')}
                  style={styles.logoImage}
                          
                />
            </View>
        
        <Text style={styles.pageTitle}>Nos Formations</Text>
        <Text style={styles.sectionDescription}>
          L'enseignement à l'école ESISA est fondé sur un fonctionnement par semestre, 
          basé sur le système modulaire. À l'école ESISA, l'enseignement est dispensé en 2 cycles 
          étalés sur 5 années d'études.
        </Text>

        {/* Premier Cycle */}
        <View style={styles.cycleContainer}>
          <View style={styles.cycleHeader}>
            <Text style={styles.cycleTitle}>1er Cycle (Bac +3 ans)</Text>
          </View>
          
          <View style={styles.yearContainer}>
            <Text style={styles.yearTitle}>1ère et 2ème années</Text>
            <Text style={styles.yearDescription}>
              L'objectif est d'initier l'étudiant aux domaines de l'informatique avec ses différentes 
              disciplines, et de développer ses compétences en développement informatique à travers 
              une formation centrée sur:
            </Text>
            <View style={styles.subjectsList}>
              <Text style={styles.subjectItem}>• Programmation</Text>
              <Text style={styles.subjectItem}>• Structures de données</Text>
              <Text style={styles.subjectItem}>• Langages de programmation</Text>
              <Text style={styles.subjectItem}>• Bases de données</Text>
              <Text style={styles.subjectItem}>• Systèmes d'information</Text>
              <Text style={styles.subjectItem}>• Réseaux informatiques</Text>
            </View>
          </View>

          <View style={styles.yearContainer}>
            <Text style={styles.yearTitle}>3ème année</Text>
            <Text style={styles.yearDescription}>
              L'objectif est de former des assistants débutants à la maîtrise d'œuvre (MOE) 
              et à la maîtrise d'ouvrage (MO), dans les domaines de la conception et de 
              l'administration des systèmes d'information:
            </Text>
            <View style={styles.subjectsList}>
              <Text style={styles.subjectItem}>• Bases de données</Text>
              <Text style={styles.subjectItem}>• Réseaux</Text>
              <Text style={styles.subjectItem}>• Architecture technique</Text>
              <Text style={styles.subjectItem}>• Développement d'applications</Text>
              <Text style={styles.subjectItem}>• Déploiement logiciel</Text>
              <Text style={styles.subjectItem}>• Intégration d'exploitation</Text>
              <Text style={styles.subjectItem}>• Analyse et traitements statistiques</Text>
            </View>
          </View>
        </View>

        {/* Deuxième Cycle */}
        <View style={styles.cycleContainer}>
          <View style={styles.cycleHeader}>
            <Text style={styles.cycleTitle}>2ème Cycle (2 ans après Bac +3)</Text>
          </View>
          
          <View style={styles.yearContainer}>
            <Text style={styles.yearTitle}>4ème et 5ème années</Text>
            <Text style={styles.yearDescription}>
              Ce cycle comprend 2 années d'études. Il a pour objectif principal de faire 
              évoluer les compétences de l'étudiant vers la maîtrise des grands systèmes 
              et leurs architectures, avec une grande expérience théorique et technique 
              dans le domaine du développement basé sur les nouvelles technologies informatiques.
            </Text>
            <Text style={styles.yearDescription}>
              Il se clôt par la réalisation d'un projet de fin d'études dans le secteur 
              industriel, mené principalement au sein des entreprises actives dans le 
              développement informatique à l'échelle internationale et dans le domaine du 
              développement offshore.
            </Text>
            <Text style={styles.yearDescription}>
              Options disponibles:
            </Text>
            <View style={styles.subjectsList}>
              <Text style={styles.subjectItem}>• M1 et M2 à l'ESISA</Text>
              <Text style={styles.subjectItem}>• M2 dans des universités étatiques en France suite au M1 à l'ESISA</Text>
              <Text style={styles.subjectItem}>• Diplôme d'Ingénieur d'état en France (2 ans)</Text>
            </View>
          </View>
        </View>

        {/* Section langues */}
        <View style={styles.languageSection}>
          <Text style={styles.sectionTitle}>Importance des langues</Text>
          <Text style={styles.sectionDescription}>
            L'école ESISA met l'accent sur l'importance de la communication en français et 
            en anglais dans les métiers de l'ingénierie. Tout au long des années d'études, 
            les étudiants sont préparés à une meilleure adaptation linguistique pour faciliter 
            leur intégration dans les cursus finaux à l'étranger et ouvrir les portes des 
            métiers de l'avenir.
          </Text>
          <Text style={styles.sectionDescription}>
            En outre, les entretiens de sélection pour les différentes écoles et universités 
            partenaires se passent en français et en anglais. Les étudiants de l'ESISA sont 
            appelés à atteindre le niveau de TOEIC (Test Of English for International 
            Communication) en fin de 4ème année.
          </Text>
        </View>

       
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  logoImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
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
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1A3F6F",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFD700",
  },
  glowEffect: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFD700",
    opacity: 0.3,
    top: -10,
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
  },
  cycleContainer: {
    marginTop: 20,
    marginBottom: 30,
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#36D7B7",
  },
  cycleHeader: {
    backgroundColor: "#1A3F6F",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#36D7B7",
  },
  cycleTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFD700",
  },
  yearContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(54, 215, 183, 0.3)",
  },
  yearTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#36D7B7",
    marginBottom: 10,
  },
  yearDescription: {
    fontSize: 15,
    color: "#DDD",
    marginBottom: 10,
    lineHeight: 21,
  },
  subjectsList: {
    marginLeft: 10,
    marginTop: 5,
  },
  subjectItem: {
    fontSize: 15,
    color: "#BBB",
    marginBottom: 5,
    lineHeight: 20,
  },
  languageSection: {
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#36D7B7",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: "#1A3F6F",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#36D7B7",
    alignItems: "center",
    marginVertical: 20,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});