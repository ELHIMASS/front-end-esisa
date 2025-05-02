import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image } from 'react-native';

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
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🌐 L'ESISA ET L'INTERNATIONAL</Text>

      <Text style={styles.description}>
        🚀 Une formation tournée vers l’international : L'ESISA ouvre à ses étudiants les portes d’une carrière mondiale
        grâce à ses partenariats avec des institutions de renom en France, aux États-Unis et au-delà.
        Nos programmes sont conçus pour offrir une expérience académique et professionnelle enrichissante.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📅 STAGES À L'ÉTRANGER</Text>
        <Text style={styles.cardText}>
          - 3ème année : Stage de 2 à 3 mois dans des entreprises partenaires.{"\n"}
          - 5ème année : Stage de 4 à 6 mois dans des secteurs innovants.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧠 COMPÉTENCES LINGUISTIQUES</Text>
        <Text style={styles.cardText}>
          - Préparation avancée au TOEIC pour une maîtrise de l’anglais professionnel.{"\n"}
          - Certification B2/C1 en français grâce à notre partenariat avec l’Institut Français.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌍 CARRIÈRES GLOBALES</Text>
        <Text style={styles.cardText}>
          Chaque année, nos étudiants poursuivent leurs études dans des établissements de prestige ou débutent leur
          carrière dans des environnements internationaux.{"\n"}
          Pour l’année universitaire 2025/2026, 95% de nos étudiants de master 1 IS2IA ont intégré des masters dans
          des universités prestigieuses et des écoles d’ingénieurs d’État en France.
        </Text>
      </View>

      <Text style={styles.subtitle}>🌎 ADMIS À L'ÉTRANGER</Text>
      <Text style={styles.description}>
        Chaque année, une grande partie des étudiants de la 4ème année continuent leurs études en France,
        soit avec nos partenaires, soit dans d'autres universités étrangères.
        L’année universitaire 2024/2025, 95% des étudiants ont été acceptés dans nos universités et écoles partenaires.
      </Text>

      <Text style={styles.partnersTitle}>NOS PARTENAIRES EN FRANCE</Text>
      <View style={styles.logoGrid}>
        {logos.map((img, index) => (
          <Image key={index} source={img} style={styles.logoImage} resizeMode="contain" />
        ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Text style={styles.footerTitle}>📍 ADRESSE</Text>
          <Text style={styles.footerText}>29 Bis Av Ibn Khatib Route d’Imouzzer, Fès-Maroc</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerTitle}>📞 TÉLÉPHONE</Text>
          <Text style={styles.footerText}>+212 (0)6 61 45 35 09</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerTitle}>📧 EMAIL</Text>
          <Text style={styles.footerText}>info@esisa.ac.ma</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F8FB",
    padding: 20,
  },
  title: {
    fontSize: 22,
    color: "#00BFFF",
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 20,
    color: "#1A3F6F",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 30,
  },
  description: {
    fontSize: 15,
    color: "#333",
    marginTop: 10,
    lineHeight: 22,
    textAlign: "justify",
  },
  card: {
    backgroundColor: "#AFCBFF",
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#0A1F3A",
    marginBottom: 8,
  },
  cardText: {
    color: "#0A1F3A",
    fontSize: 14,
    lineHeight: 20,
  },
  partnersTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 20,
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
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  footerItem: {
    marginBottom: 15,
  },
  footerTitle: {
    fontWeight: "bold",
    color: "#00BFFF",
  },
  footerText: {
    color: "#333",
  },
});

export default InternationalPage;
