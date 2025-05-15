import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';



// Configuration API
const SERVER_IP = "192.168.1.14"; // Remplacez par votre adresse IP réelle
const API_URL = `http://${SERVER_IP}:5000`;


const AddProfessorForm = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  
  // État pour gérer les matières (multiple)
  const [matiere, setMatiere] = useState('');
  const [matieresList, setMatieresList] = useState([]);
  
  // État initial du formulaire
  const [newProfessor, setNewProfessor] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    phone: '',
    matiere: []
  });

  // Gestion des modifications de champs
  const handleChange = (field, value) => {
    setNewProfessor({
      ...newProfessor,
      [field]: field === 'age' ? value.replace(/[^0-9]/g, '') : value,
    });
  };

  // Ajout d'une matière à la liste
  const addMatiere = () => {
    if (matiere.trim()) {
      const updatedList = [...matieresList, matiere.trim()];
      setMatieresList(updatedList);
      setNewProfessor({
        ...newProfessor,
        matiere: updatedList
      });
      setMatiere('');
    }
  };

  // Suppression d'une matière
  const removeMatiere = (index) => {
    const updatedList = [...matieresList];
    updatedList.splice(index, 1);
    setMatieresList(updatedList);
    setNewProfessor({
      ...newProfessor,
      matiere: updatedList
    });
  };

  // Gestion de la soumission du formulaire
  const handleAddProfessor = async () => {
    // Vérification des champs obligatoires
    if (!newProfessor.name || !newProfessor.email || !newProfessor.password || 
        !newProfessor.age || !newProfessor.phone || newProfessor.matiere.length === 0) {
      Alert.alert("Erreur", "Tous les champs sont obligatoires");
      return;
    }

    try {
      // Appel API vers le backend Node.js
      const response = await fetch(`${API_URL}/api/addProf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newProfessor)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors de l'ajout du professeur");
      }

      // Gestion du succès
      setModalVisible(false);
      Alert.alert("Succès", "Professeur ajouté avec succès");

      // On peut stocker en local si nécessaire
      // Récupérer la liste actuelle des professeurs
      const storedProfessors = await AsyncStorage.getItem('professors');
      const currentProfessors = storedProfessors ? JSON.parse(storedProfessors) : [];
      
      // Ajouter le nouveau professeur
      const updatedProfessors = [...currentProfessors, result.professor];
      await AsyncStorage.setItem('professors', JSON.stringify(updatedProfessors));

      // Réinitialisation du formulaire
      setNewProfessor({
        name: '',
        email: '',
        password: '',
        age: '',
        phone: '',
        matiere: []
      });
      setMatieresList([]);
      
      // Redirection
      router.replace("/admin");
      
    } catch (error) {
      console.error("Erreur lors de l'ajout du professeur:", error);
      
      // Affichage d'une erreur spécifique pour l'email déjà utilisé
      if (error.message.includes("Email déjà utilisé")) {
        Alert.alert("Erreur", "Cet email est déjà utilisé par un autre professeur");
      } else {
        Alert.alert("Erreur", error.message || "Erreur lors de l'ajout du professeur");
      }
    }
  };

  

  return (
    <ScrollView style={styles.container}>
    <View style={styles.formWrapper}>
      
      <View style={styles.backHeader}>
        <TouchableOpacity onPress={() => router.replace("/admin")}>
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      <Text style={styles.modalTitle}>Ajouter un professeur</Text>

      <View style={styles.formContainer}>
          {/* Nom */}
          <Text style={styles.label}>Nom complet*</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez le nom complet"
            placeholderTextColor="#6D8EB4"
            value={newProfessor.name}
            onChangeText={(text) => handleChange('name', text)}
          />
  
          {/* Email */}
          <Text style={styles.label}>Email*</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez l'email"
            placeholderTextColor="#6D8EB4"
            keyboardType="email-address"
            autoCapitalize="none"
            value={newProfessor.email}
            onChangeText={(text) => handleChange('email', text)}
          />
  
          {/* Mot de passe */}
          <Text style={styles.label}>Mot de passe*</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez le mot de passe"
            placeholderTextColor="#6D8EB4"
            secureTextEntry
            value={newProfessor.password}
            onChangeText={(text) => handleChange('password', text)}
          />
  
          {/* Âge */}
          <Text style={styles.label}>Âge*</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez l'âge"
            placeholderTextColor="#6D8EB4"
            keyboardType="numeric"
            value={newProfessor.age}
            onChangeText={(text) => handleChange('age', text)}
          />
  
          {/* Téléphone */}
          <Text style={styles.label}>Téléphone*</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez le numéro de téléphone"
            placeholderTextColor="#6D8EB4"
            keyboardType="phone-pad"
            value={newProfessor.phone}
            onChangeText={(text) => handleChange('phone', text)}
          />
  
          {/* Matières */}
          <Text style={styles.label}>Matières enseignées*</Text>
          <View style={styles.matiereInputContainer}>
            <TextInput
              style={styles.matiereInput}
              placeholder="Ajouter une matière"
              placeholderTextColor="#6D8EB4"
              value={matiere}
              onChangeText={setMatiere}
            />
            <TouchableOpacity style={styles.addMatiereButton} onPress={addMatiere}>
              <Text style={styles.addMatiereButtonText}>+</Text>
            </TouchableOpacity>
          </View>
  
          {matieresList.length > 0 && (
            <View style={styles.matieresList}>
              <Text style={styles.subLabel}>Matières ajoutées :</Text>
              {matieresList.map((item, index) => (
                <View key={index} style={styles.matiereItem}>
                  <Text style={styles.matiereText}>{item}</Text>
                  <TouchableOpacity onPress={() => removeMatiere(index)}>
                    <Ionicons name="close-circle" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
  
          {/* Bouton de soumission */}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleAddProfessor}
          >
            <Text style={styles.submitButtonText}>Ajouter le professeur</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
  
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#0A1F3A",
      padding: 20,
    },
    addButton: {
      backgroundColor: "#2E7D32",
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      marginVertical: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    addButtonText: {
      color: "#FFF",
      fontWeight: "bold",
      fontSize: 16,
    },
    centeredView: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.7)",
      padding: 15,
    },
    modalView: {
      backgroundColor: "#0A1F3A",
      borderRadius: 15,
      padding: 20,
      borderWidth: 2,
      borderColor: "#1A3F6F",
      maxHeight: "90%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#1A3F6F",
      marginBottom: 15,
    },
    formWrapper: {
        backgroundColor: "#0A1F3A",
        borderWidth: 2,
        borderColor: "#FFD700",
        borderRadius: 15,
        padding: 20,
        marginTop: 30,
        marginBottom: 30,
        marginHorizontal: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 6,
      },
      modalTitle: {
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFD700",
        marginBottom: 20,
      },
      
    formContainer: {
      marginBottom: 10,
    },
    label: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#FFD700",
      marginBottom: 5,
      marginTop: 10,
    },
    subLabel: {
      fontSize: 12,
      color: "#6D8EB4",
      marginBottom: 5,
      marginTop: 5,
    },
    backHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
      },
      
    input: {
      backgroundColor: "#1A3F6F",
      color: "#FFF",
      borderRadius: 10,
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: "#2A4F7F",
      fontSize: 14,
    },
    matiereInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 5,
    },
    matiereInput: {
      flex: 1,
      backgroundColor: "#1A3F6F",
      color: "#FFF",
      borderRadius: 10,
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: "#2A4F7F",
      fontSize: 14,
    },
    addMatiereButton: {
      backgroundColor: "#FFD700",
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 10,
    },
    addMatiereButtonText: {
      color: "#0A1F3A",
      fontSize: 24,
      fontWeight: "bold",
    },
    matieresList: {
      marginTop: 10,
    },
    matiereItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#1A3F6F",
      borderRadius: 8,
      padding: 10,
      marginBottom: 5,
      borderWidth: 1,
      borderColor: "#FFD700",
    },
    matiereText: {
      color: "#FFF",
      fontSize: 14,
      flex: 1,
    },
    submitButton: {
      backgroundColor: "#2E7D32",
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 20,
    },
    submitButtonText: {
      color: "#FFF",
      fontWeight: "bold",
      fontSize: 16,
    },
  });
  

export default AddProfessorForm;