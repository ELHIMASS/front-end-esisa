import React from 'react';
import { Icon } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const logos = [
  require('C:/Users/ismai/Desktop/front-end-esisa/esisa/assets/partenaire/amu.png'),
  require('C:/Users/ismai/Desktop/front-end-esisa/esisa/assets/partenaire/cote1.png'),
  require('C:/Users/ismai/Desktop/front-end-esisa/esisa/assets/partenaire/cotedazur.png'),
  require('C:/Users/ismai/Desktop/front-end-esisa/esisa/assets/partenaire/ensiie1.png'),
  require('C:/Users/ismai/Desktop/front-end-esisa/esisa/assets/partenaire/iscid.png'),
  require('C:/Users/ismai/Desktop/front-end-esisa/esisa/assets/partenaire/isima1.png'),
  require('C:/Users/ismai/Desktop/front-end-esisa/esisa/assets/partenaire/poly1.png'),
  require('C:/Users/ismai/Desktop/front-end-esisa/esisa/assets/partenaire/paris81.png'),
  require('C:/Users/ismai/Desktop/front-end-esisa/esisa/assets/partenaire/lor1.png'),
  require('C:/Users/ismai/Desktop/front-end-esisa/esisa/assets/partenaire/lyon1.png'),
  require('C:/Users/ismai/Desktop/front-end-esisa/esisa/assets/partenaire/lille1.png'),
  require('C:/Users/ismai/Desktop/front-end-esisa/esisa/assets/partenaire/uca1.png'),
  require('C:/Users/ismai/Desktop/front-end-esisa/esisa/assets/partenaire/unvop1.png'),
  require('C:/Users/ismai/Desktop/front-end-esisa/esisa/assets/partenaire/paris131.png'),
  require('C:/Users/ismai/Desktop/front-end-esisa/esisa/assets/partenaire/unvbou1.png'),
  require('C:/Users/ismai/Desktop/front-end-esisa/esisa/assets/partenaire/lis1.png'),
];

const InternationalPage = () => {
  const insets = useSafeAreaInsets();

  const goBack = () => {
    router.replace('/(tabs)');
  };

  return (
    
    <View style={{ flex: 1, backgroundColor: '#0A1F3A' }}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={goBack}
        style={{
          position: 'absolute',
          top: insets.top + 10,
          left: 20,
          zIndex: 10,
          backgroundColor: '#1A3F6F',
          borderRadius: 20,
          padding: 10,
        }}
      >
        <Icon name="arrow-back" size={24} color="#FFD700" />
      </TouchableOpacity>

    
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
     <View style={styles.logoContainer}>
        <Image
          source={require('C:/Users/ismai/Desktop/front-end-esisa/esisa/assets/icons/icon.png')}
            style={styles.logoImage}
              resizeMode="contain"
            />
      </View>

      <Text style={styles.pageTitle}>L'ESISA ET L'INTERNATIONAL</Text>

      <Text style={styles.sectionDescription}>
        🚀 Une formation tournée vers l’international : L'ESISA ouvre à ses étudiants les portes d’une carrière mondiale
        grâce à ses partenariats avec des institutions de renom en France, aux États-Unis et au-delà.
        Nos programmes sont conçus pour offrir une expérience académique et professionnelle enrichissante.
      </Text>

      <View style={styles.cycleContainer}>
        <View style={styles.cycleHeader}>
          <Text style={styles.cycleTitle}>📅 STAGES À L'ÉTRANGER</Text>
        </View>
        <View style={styles.yearContainer}>
          <Text style={styles.yearDescription}>
            - 3ème année : Stage de 2 à 3 mois dans des entreprises partenaires.{"\n"}
            - 5ème année : Stage de 4 à 6 mois dans des secteurs innovants.
          </Text>
        </View>
      </View>

      <View style={styles.cycleContainer}>
        <View style={styles.cycleHeader}>
          <Text style={styles.cycleTitle}>🧠 COMPÉTENCES LINGUISTIQUES</Text>
        </View>
        <View style={styles.yearContainer}>
          <Text style={styles.yearDescription}>
            - Préparation avancée au TOEIC pour une maîtrise de l’anglais professionnel.{"\n"}
            - Certification B2/C1 en français grâce à notre partenariat avec l’Institut Français.
          </Text>
        </View>
      </View>

      <View style={styles.cycleContainer}>
        <View style={styles.cycleHeader}>
          <Text style={styles.cycleTitle}>🌍 CARRIÈRES GLOBALES</Text>
        </View>
        <View style={styles.yearContainer}>
          <Text style={styles.yearDescription}>
            Chaque année, nos étudiants poursuivent leurs études dans des établissements de prestige ou débutent leur
            carrière dans des environnements internationaux.{"\n"}
            Pour l’année universitaire 2025/2026, 95% de nos étudiants de master 1 IS2IA ont intégré des masters dans
            des universités prestigieuses et des écoles d’ingénieurs d’État en France.
          </Text>
        </View>
      </View>

      <Text style={styles.pageTitle}>🌎 ADMIS À L'ÉTRANGER</Text>
      <Text style={styles.sectionDescription}>
        Chaque année, une grande partie des étudiants de la 4ème année continuent leurs études en France,
        soit avec nos partenaires, soit dans d'autres universités étrangères.
        L’année universitaire 2024/2025, 95% des étudiants ont été acceptés dans nos universités et écoles partenaires.
      </Text>

      <Text style={styles.sectionTitle}>NOS PARTENAIRES EN FRANCE</Text>
      <View style={styles.logoGrid}>
        {logos.map((img, index) => (
          <Image key={index} source={img} style={styles.logoImage} resizeMode="contain" />
        ))}
      </View>

      <View style={styles.footerContainer}>
  <View style={styles.footerRow}>
    <Text style={styles.footerIcon}>📍</Text>
    <View>
      <Text style={styles.footerLabel}>ADRESSE</Text>
      <Text style={styles.footerText}>29 Bis Av Ibn Khatib Route d’Imouzzer, Fès-Maroc</Text>
    </View>
  </View>

  <View style={styles.footerRow}>
    <Text style={styles.footerIcon}>📞</Text>
    <View>
      <Text style={styles.footerLabel}>TÉLÉPHONE</Text>
      <Text style={styles.footerText}>+212 (0)6 61 45 35 09</Text>
    </View>
  </View>

  <View style={styles.footerRow}>
    <Text style={styles.footerIcon}>📧</Text>
    <View>
      <Text style={styles.footerLabel}>EMAIL</Text>
      <Text style={styles.footerText}>info@esisa.ac.ma</Text>
    </View>
  </View>
</View>
</ScrollView>
    </View>
  );
};


const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#0A1F3A",
  },
  logoText: {
    fontSize: 32,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
    paddingTop: 120,
  },
  logoContainer: {
    position: "absolute",
    top: 40,
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
    fontSize: 24,
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
    textAlign: "justify",
  },
  cycleContainer: {
    marginTop: 20,
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
    color: "#DDD",
    lineHeight: 21,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
    marginTop: 30,
    textAlign: "center",
  },
  logoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  logoImage: {
    width: width / 3 - 30,
    height: 60,
    margin: 5,
    marginTop: 20,
  },
  languageSection: {
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    padding: 15,
    marginTop: 30,
    borderWidth: 1,
    borderColor: "#36D7B7",
  },
  footerContainer: {
    backgroundColor: 'rgba(26, 63, 111, 0.3)',
    borderRadius: 10,
    padding: 20,
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#36D7B7',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  footerIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
    color: '#FFD700',
  },
  footerLabel: {
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 2,
  },
  footerText: {
    color: '#DDD',
    fontSize: 15,
  },
  
});

export default InternationalPage;
