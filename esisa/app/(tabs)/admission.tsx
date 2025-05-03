// app/admission/admission.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Icon } from "react-native-elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function AdmissionScreen() {
  const insets = useSafeAreaInsets();

  const goBack = () => {
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

      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>ESISA</Text>
        </View>
        <View style={styles.glowEffect} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.headerContainer}>
          <Icon name="school" size={28} color="#FFD700" />
          <Text style={styles.pageTitle}>PARCOURS ET PROCÉDURE D'ADMISSION</Text>
        </View>

        <Text style={styles.introText}>
          L'ESISA sélectionne les meilleurs talents pour former l'élite en ingénierie informatique.
        </Text>

        <Text style={styles.sectionDescription}>
          À l'ESISA, nous croyons que <Text style={styles.highlightText}>la motivation</Text> et <Text style={styles.highlightText}>la passion pour le numérique</Text> sont les moteurs de l'excellence. 
          Nous recherchons des étudiants déterminés, prêts à façonner le monde de demain grâce aux technologies 
          innovantes. Chaque candidature est évaluée avec soin en tenant compte de :
        </Text>

        {/* Critères d'admission */}
        <View style={styles.criteriaContainer}>
          <View style={styles.criteriaItem}>
            <Icon name="star" size={20} color="#FF4444" />
            <Text style={styles.criteriaText}>
              <Text style={styles.criteriaTitle}>Motivation et Ambition : </Text>
              Votre détermination à réussir et à innover est essentielle.
            </Text>
          </View>

          <View style={styles.criteriaItem}>
            <Icon name="star" size={20} color="#FF4444" />
            <Text style={styles.criteriaText}>
              <Text style={styles.criteriaTitle}>Note en Mathématiques et Français au Bac : </Text>
              Indicateurs clés de réussite.
            </Text>
          </View>

          <View style={styles.criteriaItem}>
            <Icon name="star" size={20} color="#FF4444" />
            <Text style={styles.criteriaText}>
              <Text style={styles.criteriaTitle}>Si les notes sont insuffisantes : </Text>
              Un test de Mathématiques est requis.
            </Text>
          </View>

          <View style={styles.criteriaItem}>
            <Icon name="star" size={20} color="#FF4444" />
            <Text style={styles.criteriaText}>
              <Text style={styles.criteriaTitle}>Entretien de motivation : </Text>
              Pour évaluer votre passion, vos objectifs et votre vision.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionDescription}>
          Nous privilégions les profils <Text style={styles.highlightText}>engagés</Text> et <Text style={styles.highlightText}>motivés</Text>, capables de relever les défis technologiques de demain.
        </Text>

        {/* Processus d'admission */}
        <View style={styles.processContainer}>
          <Text style={styles.sectionTitle}>Étapes du processus d'admission</Text>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Soumission du dossier</Text>
              <Text style={styles.stepDescription}>
                Formulaire d'inscription complété, copie de la CIN, relevés de notes du Bac, photo d'identité récente
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Étude du dossier académique</Text>
              <Text style={styles.stepDescription}>
                Analyse des notes en mathématiques et français, vérification du profil académique
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Test d'aptitude (si nécessaire)</Text>
              <Text style={styles.stepDescription}>
                Test de mathématiques pour les candidats dont les notes au Bac sont insuffisantes
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Entretien de motivation</Text>
              <Text style={styles.stepDescription}>
                Discussion approfondie sur vos objectifs, votre passion pour l'informatique et votre vision du futur numérique
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>5</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Décision d'admission</Text>
              <Text style={styles.stepDescription}>
                Notification par email et courrier dans un délai de 7 jours après l'entretien
              </Text>
            </View>
          </View>
        </View>

        {/* Profils admissibles */}
        <View style={styles.profilesContainer}>
          <Text style={styles.sectionTitle}>Profils admissibles</Text>
          
          <View style={styles.profileItem}>
            <Icon name="check-circle" size={24} color="#36D7B7" />
            <Text style={styles.profileText}>
              <Text style={styles.profileTitle}>Accès en 1ère année : </Text>
              Bac Scientifique, Économique et Technique
            </Text>
          </View>

          <View style={styles.profileItem}>
            <Icon name="check-circle" size={24} color="#36D7B7" />
            <Text style={styles.profileText}>
              <Text style={styles.profileTitle}>Accès en 2ème année : </Text>
              CPGE, Math Spé, EST, BTS, DUT ou Diplôme Équivalent
            </Text>
          </View>

          <View style={styles.profileItem}>
            <Icon name="check-circle" size={24} color="#36D7B7" />
            <Text style={styles.profileText}>
              <Text style={styles.profileTitle}>Accès en M1 : </Text>
              Licence en Informatique ou Diplôme Équivalent
            </Text>
          </View>
        </View>

        {/* Dates importantes */}
        <View style={styles.datesContainer}>
          <Text style={styles.sectionTitle}>Dates importantes</Text>
          
          <View style={styles.dateItem}>
            <Icon name="event" size={24} color="#FFD700" />
            <View style={styles.dateContent}>
              <Text style={styles.dateTitle}>1er Décembre - 30 Avril</Text>
              <Text style={styles.dateDescription}>Période de dépôt des candidatures pour l'année académique suivante</Text>
            </View>
          </View>

          <View style={styles.dateItem}>
            <Icon name="event" size={24} color="#FFD700" />
            <View style={styles.dateContent}>
              <Text style={styles.dateTitle}>Mai - Juin</Text>
              <Text style={styles.dateDescription}>Sessions d'entretiens et tests d'admission</Text>
            </View>
          </View>

          <View style={styles.dateItem}>
            <Icon name="event" size={24} color="#FFD700" />
            <View style={styles.dateContent}>
              <Text style={styles.dateTitle}>15 Juillet</Text>
              <Text style={styles.dateDescription}>Date limite de confirmation d'inscription pour les candidats admis</Text>
            </View>
          </View>

          <View style={styles.dateItem}>
            <Icon name="event" size={24} color="#FFD700" />
            <View style={styles.dateContent}>
              <Text style={styles.dateTitle}>Septembre</Text>
              <Text style={styles.dateDescription}>Rentrée académique et semaine d'intégration</Text>
            </View>
          </View>
        </View>

{/* Contact */}
<View style={styles.contactContainer}>
  <Text style={styles.sectionTitle}>Besoin d'informations supplémentaires ?</Text>
  
  <View style={styles.contactItem}>
    <Icon name="mail" size={24} color="#FFD700" />
    <Text style={styles.contactText}>admission@esisa.ma</Text>
  </View>

  <View style={styles.contactItem}>
    <Icon name="phone" size={24} color="#FFD700" />
    <Text style={styles.contactText}>+212 5 22 27 22 42</Text>
  </View>

  <View style={styles.contactItem}>
    <Icon name="location-on" size={24} color="#FFD700" />
    <Text style={styles.contactText}>282, Boulevard Zerktouni, Casablanca, Maroc</Text>
  </View>
</View>

<TouchableOpacity 
  style={styles.actionButton}
  onPress={() => router.push('/form')}
>
  <Text style={styles.buttonText}>POSTULER MAINTENANT</Text>
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
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFD700",
    textAlign: "center",
    marginLeft: 10,
  },
  introText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#DDD",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionDescription: {
    fontSize: 16,
    color: "#DDD",
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
    borderColor: "#36D7B7",
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
    color: "#FFD700",
    marginBottom: 15,
  },
  processContainer: {
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    padding: 15,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "#36D7B7",
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
    color: "#DDD",
    fontSize: 14,
    lineHeight: 20,
  },
  profilesContainer: {
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#36D7B7",
  },
  profileItem: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
  },
  profileText: {
    color: "#DDD",
    marginLeft: 10,
    flex: 1,
    fontSize: 15,
  },
  profileTitle: {
    fontWeight: "bold",
    color: "#36D7B7",
  },
  datesContainer: {
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#36D7B7",
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
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  dateDescription: {
    color: "#DDD",
    fontSize: 14,
  },
  contactContainer: {
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#36D7B7",
  },
  contactItem: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
  },
  contactText: {
    color: "#DDD",
    marginLeft: 10,
    fontSize: 15,
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