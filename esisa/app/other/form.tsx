// app/admission/applicationForm.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Icon } from "react-native-elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import RNPickerSelect from 'react-native-picker-select'; // en haut du fichier
import config from '../../config';



export default function ApplicationFormScreen() {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    dateNaissance: "",
    adresse: "",
    ville: "",
    niveau: "premiere-année", // par défaut
    filiere: "",
    notesBac: {
      mathematiques: "",
      francais: "",
      moyenneGenerale: "",
    },
    motivation: "",
  });

  // Documents state
  const [documents, setDocuments] = useState<{
    cin: DocumentPicker.DocumentPickerAsset | null;
    relevesBac: DocumentPicker.DocumentPickerAsset | null;
    photo: DocumentPicker.DocumentPickerAsset | null;
  }>({
    cin: null,
    relevesBac: null,
    photo: null,
  });

  const goBack = () => {
    router.back();
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      if (parent in formData && typeof formData[parent as keyof typeof formData] === 'object') {
        setFormData({
          ...formData,
          [parent]: {
            ...(formData[parent as keyof typeof formData] as object),
            [child]: value,
          },
        });
      }
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  const pickDocument = async (docType: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: docType === "photo" ? "image/*" : "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setDocuments({
          ...documents,
          [docType]: result.assets[0],
        });
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de sélectionner le document");
    }
  };

  const validateForm = () => {
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Phone validation regex (for Moroccan numbers)
    const phoneRegex = /^(\+212|0)[5-7][0-9]{8}$/;
    
    if (!formData.nom || !formData.prenom) {
      Alert.alert("Erreur", "Veuillez saisir votre nom et prénom");
      return false;
    }
    
    if (!formData.email || !emailRegex.test(formData.email)) {
      Alert.alert("Erreur", "Veuillez saisir une adresse email valide");
      return false;
    }
    
    if (!formData.telephone || !phoneRegex.test(formData.telephone)) {
      Alert.alert("Erreur", "Veuillez saisir un numéro de téléphone valide (format marocain)");
      return false;
    }
    
    if (!formData.dateNaissance) {
      Alert.alert("Erreur", "Veuillez saisir votre date de naissance");
      return false;
    }
    
    if (!formData.niveau) {
      Alert.alert("Erreur", "Veuillez sélectionner le niveau d'entrée souhaité");
      return false;
    }
    
    if (!formData.notesBac.mathematiques || !formData.notesBac.francais) {
      Alert.alert("Erreur", "Veuillez saisir vos notes de mathématiques et de français au baccalauréat");
      return false;
    }
    
    if (!documents.cin) {
      Alert.alert("Erreur", "Veuillez joindre une copie de votre CIN");
      return false;
    }
    
    if (!documents.relevesBac) {
      Alert.alert("Erreur", "Veuillez joindre vos relevés de notes du baccalauréat");
      return false;
    }
    
    if (!documents.photo) {
      Alert.alert("Erreur", "Veuillez joindre une photo d'identité récente");
      return false;
    }
    
    return true;
  };

  const submitForm = async () => {
    if (!validateForm()) {
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Create FormData object for multipart/form-data request
      const formDataObj = new FormData();
      
      // Add form data as JSON string
      formDataObj.append('formData', JSON.stringify(formData));
      
      // Add file attachments
      if (documents.cin && documents.cin.uri) {
        const uriParts = documents.cin.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formDataObj.append('cin', {
          uri: documents.cin.uri,
          name: documents.cin.name || `cin.${fileType}`,
          type: documents.cin.mimeType || `application/${fileType}`
        } as any);
      }
      
      if (documents.relevesBac && documents.relevesBac.uri) {
        const uriParts = documents.relevesBac.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formDataObj.append('relevesBac', {
          uri: documents.relevesBac.uri,
          name: documents.relevesBac.name || `relevesBac.${fileType}`,
          type: documents.relevesBac.mimeType || `application/${fileType}`
        } as any);
      }
      
      if (documents.photo && documents.photo.uri) {
        const uriParts = documents.photo.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formDataObj.append('photo', {
          uri: documents.photo.uri,
          name: documents.photo.name || `photo.${fileType}`,
          type: documents.photo.mimeType || `image/${fileType}`
        } as any);
      }
  
      // Use your actual server address here
      const serverUrl = `${config.API_IP}/send-email-with-attachments`;
      const response = await fetch(serverUrl, {
        method: 'POST',
        body: formDataObj,
        headers: {
          // Don't set Content-Type here - it will be automatically set with boundary for FormData
        },
      });
  
      const responseData = await response.json();
      
      if (responseData.success) {
        setSuccessModalVisible(true);
        setTimeout(() => {
          setSuccessModalVisible(false);
          goBack();
        }, 3000);
      } else {
        Alert.alert("Erreur", responseData.message || "Une erreur est survenue lors de l'envoi.");
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de l'envoi de votre candidature. Veuillez réessayer ultérieurement."
      );
    } finally {
      setIsLoading(false);
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

      

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        >
             <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/icons/icon.png')}
                  style={styles.logoImage}
                  
                  />
            </View>
          <View style={styles.headerContainer}>
            <Icon name="edit" size={28} color="#FFD700" />
            <Text style={styles.pageTitle}>FORMULAIRE DE CANDIDATURE</Text>
          </View>

          <Text style={styles.introText}>
            Complétez ce formulaire pour soumettre votre candidature à l'ESISA
          </Text>

          {/* Section Informations Personnelles */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Informations Personnelles</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.labelText}>Nom *</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre nom"
                placeholderTextColor="#999"
                value={formData.nom}
                onChangeText={(text) => handleInputChange("nom", text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.labelText}>Prénom *</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre prénom"
                placeholderTextColor="#999"
                value={formData.prenom}
                onChangeText={(text) => handleInputChange("prenom", text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.labelText}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre adresse email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.labelText}>Téléphone *</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre numéro de téléphone"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={formData.telephone}
                onChangeText={(text) => handleInputChange("telephone", text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.labelText}>Date de naissance *</Text>
              <TextInput
                style={styles.input}
                placeholder="JJ/MM/AAAA"
                placeholderTextColor="#999"
                value={formData.dateNaissance}
                onChangeText={(text) => handleInputChange("dateNaissance", text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.labelText}>Adresse</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre adresse complète"
                placeholderTextColor="#999"
                value={formData.adresse}
                onChangeText={(text) => handleInputChange("adresse", text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.labelText}>Ville</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre ville"
                placeholderTextColor="#999"
                value={formData.ville}
                onChangeText={(text) => handleInputChange("ville", text)}
              />
            </View>
          </View>

          {/* Section Informations Académiques */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Informations Académiques</Text>

           <View style={styles.inputGroup}>
              <Text style={styles.labelText}>Niveau d'entrée souhaité *</Text>
              <RNPickerSelect
              onValueChange={(value) => handleInputChange("niveau", value)}
              value={formData.niveau}
              placeholder={{ label: "Sélectionnez un niveau...", value: null }}
              items={[
              { label: "1ère année", value: "premiere-annee" },
              { label: "2ème année", value: "deuxieme-annee" },
              { label: "3ème année", value: "troisieme-annee" },
              { label: "Master 1 (M1)", value: "m1" },
              { label: "Master 2 (M2)", value: "m2" },
              ]}
              useNativeAndroidPickerStyle={false}
              style={{
              inputIOS: {
              backgroundColor: "#1A3F6F",
              borderRadius: 5,
              padding: 12,
              color: "#FFF",
              borderWidth: 1,
              borderColor: "#36D7B7",
              marginBottom: 10,
              },
              inputAndroid: {
              backgroundColor: "#1A3F6F",
              borderRadius: 5,
              padding: 12,
              color: "#FFF",
              borderWidth: 1,
              borderColor: "#36D7B7",
              marginBottom: 10,
              },
              placeholder: {
              color: "#999",
              },
              }}
              Icon={() => {
              return <Icon name="arrow-drop-down" color="#FFD700" size={24} />;
              }}
              />
              </View>
              <Text style={styles.labelText}>Filière (si applicable)</Text>
              <TextInput
                style={styles.input}
                placeholder="Filière souhaitée"
                placeholderTextColor="#999"
                value={formData.filiere}
                onChangeText={(text) => handleInputChange("filiere", text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.labelText}>
                Note en Mathématiques au Bac *
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Votre note en mathématiques"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={formData.notesBac.mathematiques}
                onChangeText={(text) =>
                  handleInputChange("notesBac.mathematiques", text)
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.labelText}>Note en Français au Bac *</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre note en français"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={formData.notesBac.francais}
                onChangeText={(text) =>
                  handleInputChange("notesBac.francais", text)
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.labelText}>Moyenne générale au Bac</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre moyenne générale"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={formData.notesBac.moyenneGenerale}
                onChangeText={(text) =>
                  handleInputChange("notesBac.moyenneGenerale", text)
                }
              />
            </View>
          

          {/* Section Documents */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Documents Requis</Text>

            <View style={styles.documentItem}>
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>
                  Copie de la CIN (recto/verso) *
                </Text>
                <Text style={styles.documentDescription}>
                  Format PDF ou image (max 5 Mo)
                </Text>
              </View>
              <TouchableOpacity
                style={styles.documentButton}
                onPress={() => pickDocument("cin")}
              >
                <Text style={styles.documentButtonText}>
                  {documents.cin ? "Modifer" : "Choisir"}
                </Text>
              </TouchableOpacity>
            </View>
            {documents.cin && (
              <Text style={styles.fileSelected}>
                Fichier sélectionné: {documents.cin.name}
              </Text>
            )}

            <View style={styles.documentItem}>
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>
                  Relevés de notes du Bac *
                </Text>
                <Text style={styles.documentDescription}>
                  Format PDF ou image (max 5 Mo)
                </Text>
              </View>
              <TouchableOpacity
                style={styles.documentButton}
                onPress={() => pickDocument("relevesBac")}
              >
                <Text style={styles.documentButtonText}>
                  {documents.relevesBac ? "Modifer" : "Choisir"}
                </Text>
              </TouchableOpacity>
            </View>
            {documents.relevesBac && (
              <Text style={styles.fileSelected}>
                Fichier sélectionné: {documents.relevesBac.name}
              </Text>
            )}

            <View style={styles.documentItem}>
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>
                  Photo d'identité récente *
                </Text>
                <Text style={styles.documentDescription}>
                  Format JPEG ou PNG (max 2 Mo)
                </Text>
              </View>
              <TouchableOpacity
                style={styles.documentButton}
                onPress={() => pickDocument("photo")}
              >
                <Text style={styles.documentButtonText}>
                  {documents.photo ? "Modifer" : "Choisir"}
                </Text>
              </TouchableOpacity>
            </View>
            {documents.photo && (
              <Text style={styles.fileSelected}>
                Fichier sélectionné: {documents.photo.name}
              </Text>
            )}
          </View>

          {/* Section Motivation */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Lettre de Motivation</Text>
            <TextInput
              style={styles.motivationInput}
              placeholder="Expliquez brièvement votre motivation à rejoindre l'ESISA (min. 100 caractères)"
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={8}
              textAlignVertical="top"
              value={formData.motivation}
              onChangeText={(text) => handleInputChange("motivation", text)}
            />
          </View>

          {/* Bouton d'envoi */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={submitForm}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                ENVOYER MA CANDIDATURE
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.mandatoryFieldsText}>
            * Champs obligatoires
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de succès */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={successModalVisible}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Icon name="check-circle" size={60} color="#36D7B7" />
            <Text style={styles.modalTitle}>Candidature Envoyée !</Text>
            <Text style={styles.modalText}>
              Votre candidature a été envoyée avec succès. Nous vous contacterons prochainement.
            </Text>
          </View>
        </View>
      </Modal>
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
    alignItems: "center",
    marginTop: -50,
    marginBottom: 10,
  },
  logoImage: {
    width: 80,
    height: 80,
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
  sectionContainer: {
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#36D7B7",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  labelText: {
    color: "#DDD",
    marginBottom: 5,
    fontSize: 15,
  },
  input: {
    backgroundColor: "#1A3F6F",
    borderRadius: 5,
    padding: 12,
    color: "#FFF",
    borderWidth: 1,
    borderColor: "#36D7B7",
  },
  pickerContainer: {
    backgroundColor: "#1A3F6F",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#36D7B7",
    overflow: "hidden",
  },
  picker: {
    color: "black",
    height: 50,
  },
  documentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#1A3F6F",
    padding: 15,
    borderRadius: 8,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 5,
  },
  documentDescription: {
    color: "#BBB",
    fontSize: 12,
  },
  documentButton: {
    backgroundColor: "#48A4E5",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  documentButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  fileSelected: {
    color: "#36D7B7",
    fontSize: 12,
    marginBottom: 15,
    marginLeft: 5,
  },
  motivationInput: {
    backgroundColor: "#1A3F6F",
    borderRadius: 5,
    padding: 12,
    color: "#FFF",
    height: 150,
    borderWidth: 1,
    borderColor: "#36D7B7",
  },
  submitButton: {
    backgroundColor: "#36D7B7",
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  mandatoryFieldsText: {
    color: "#BBB",
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: "#1A3F6F",
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
    width: "80%",
    borderWidth: 2,
    borderColor: "#36D7B7",
  },
modalTitle: {
  fontSize: 22,
  fontWeight: "bold",
  color: "#FFD700",
  marginTop: 15,
  marginBottom: 10,
},
modalText: {
  fontSize: 16,
  color: "#FFF",
  textAlign: "center",
  marginBottom: 10,
},

});
