import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements'; // Vous pouvez installer react-native-elements si vous ne l'avez pas déjà
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native'; // Assurez-vous d'avoir react-navigation installé
import { router } from 'expo-router';

export default function VirtualTourOrbite() {
  const navigation = useNavigation();

  // Fonction pour revenir à l'écran précédent
  const goBack = () => {
    router.replace("/(tabs)");  };

  return (
    <View style={styles.container}>
      {/* Flèche de retour */}
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Icon name="arrow-back" size={30} color="#FFF" />
      </TouchableOpacity>

      {/* WebView pour afficher le contenu Orbite */}
      <WebView
        source={{ uri: 'https://orbite.ma/esisa/' }} // L'URL de votre site
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Choisissez la couleur de fond appropriée
    position: 'relative', // Permet d'ajouter des éléments positionnés au-dessus
  },
  backButton: {
    position: 'absolute',
    top: 60, // Ajustez la position de la flèche
    left: 20, // Ajustez la position de la flèche
    zIndex: 10, // Assurez-vous que la flèche reste au-dessus du contenu
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optionnel, ajoute un fond semi-transparent derrière la flèche
    borderRadius: 30, // Optionnel, pour arrondir les bords de la flèche
    padding: 10, // Ajustez l'espace autour de l'icône
  },
  webview: {
    flex: 1, // Utilisez flex pour occuper l'espace restant
    marginTop: 50, // Laisser de l'espace pour la flèche en haut
    height: '80%', // Réduit la taille du WebView à 80% de l'écran, ajustez si nécessaire
    marginBottom: 20, // Laisser un peu d'espace en bas
  },
});
