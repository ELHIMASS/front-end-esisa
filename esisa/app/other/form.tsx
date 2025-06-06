import React, { useState, useContext, useEffect } from "react";
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from "react-native-elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import RNPickerSelect from "react-native-picker-select";
import config from "../../config";
import { DarkModeContext } from "../context/DarkModeContext";
import { translations } from "../utils/transactions";  // Import du fichier de traductions


export default function ApplicationFormScreen() {
  const { darkMode } = useContext(DarkModeContext);
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  


  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    dateNaissance: "",
    adresse: "",
    ville: "",
    niveau: "premiere-annee",
    filiere: "",
    notesBac: {
      mathematiques: "",
      francais: "",
      moyenneGenerale: "",
    },
    motivation: "",
  });

  const [documents, setDocuments] = useState<{
    cin: DocumentPicker.DocumentPickerAsset | null;
    relevesBac: DocumentPicker.DocumentPickerAsset | null;
    photo: DocumentPicker.DocumentPickerAsset | null;
  }>({
    cin: null,
    relevesBac: null,
    photo: null,
  });

  // Récupération de la langue depuis le contexte ou AsyncStorage
  const [language, setLanguage] = useState("fr");
  const t = translations[language] || translations["fr"];  // Fallback vers français si langue non trouvée

  // Fonction pour charger la langue sauvegardée
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
        if (savedLanguage && translations[savedLanguage]) {
          setLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la langue:', error);
      }
    };
    loadLanguage();
  }, []);

  const goBack = () => {
    router.back();
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      if (
        parent in formData &&
        typeof formData[parent as keyof typeof formData] === "object"
      ) {
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
      Alert.alert(t.error, t.document_select_error);
    }
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+212|0)[5-7][0-9]{8}$/;

    if (!formData.nom || !formData.prenom) {
      Alert.alert(t.error, t.enter_name_prenom);
      return false;
    }
    if (!formData.email || !emailRegex.test(formData.email)) {
      Alert.alert(t.error, t.enter_valid_email);
      return false;
    }
    if (!formData.telephone || !phoneRegex.test(formData.telephone)) {
      Alert.alert(t.error, t.enter_valid_phone);
      return false;
    }
    if (!formData.dateNaissance) {
      Alert.alert(t.error, t.enter_birthdate);
      return false;
    }
    if (!formData.niveau) {
      Alert.alert(t.error, t.select_niveau);
      return false;
    }
    if (!formData.notesBac.mathematiques || !formData.notesBac.francais) {
      Alert.alert(t.error, t.enter_bac_notes);
      return false;
    }
    if (!documents.cin) {
      Alert.alert(t.error, t.attach_cin);
      return false;
    }
    if (!documents.relevesBac) {
      Alert.alert(t.error, t.attach_releves_bac);
      return false;
    }
    if (!documents.photo) {
      Alert.alert(t.error, t.attach_photo);
      return false;
    }
    return true;
  };

  const submitForm = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append("formData", JSON.stringify(formData));

      if (documents.cin && documents.cin.uri) {
        const uriParts = documents.cin.uri.split(".");
        const fileType = uriParts[uriParts.length - 1];
        formDataObj.append("cin", {
          uri: documents.cin.uri,
          name: documents.cin.name || `cin.${fileType}`,
          type: documents.cin.mimeType || `application/${fileType}`,
        } as any);
      }
      if (documents.relevesBac && documents.relevesBac.uri) {
        const uriParts = documents.relevesBac.uri.split(".");
        const fileType = uriParts[uriParts.length - 1];
        formDataObj.append("relevesBac", {
          uri: documents.relevesBac.uri,
          name: documents.relevesBac.name || `relevesBac.${fileType}`,
          type: documents.relevesBac.mimeType || `application/${fileType}`,
        } as any);
      }
      if (documents.photo && documents.photo.uri) {
        const uriParts = documents.photo.uri.split(".");
        const fileType = uriParts[uriParts.length - 1];
        formDataObj.append("photo", {
          uri: documents.photo.uri,
          name: documents.photo.name || `photo.${fileType}`,
          type: documents.photo.mimeType || `image/${fileType}`,
        } as any);
      }

      const serverUrl = `${config.API_IP}/send-email-with-attachments`;
      const response = await fetch(serverUrl, {
        method: "POST",
        body: formDataObj,
      });
      const responseData = await response.json();

      if (responseData.success) {
        setSuccessModalVisible(true);
        setTimeout(() => {
          setSuccessModalVisible(false);
          goBack();
        }, 3000);
      } else {
        Alert.alert(t.error, responseData.message || t.send_error);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Alert.alert(t.error, t.submit_form_error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: darkMode ? "#0A1F3A" : "#FFF" }}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} backgroundColor={darkMode ? "#0A1F3A" : "#FFF"} />
      
      {/* Header avec bouton retour et logo */}
      <View style={[styles.headerContainer, { 
        paddingTop: insets.top + 10,
        backgroundColor: darkMode ? "#0A1F3A" : "#FFF",
        borderBottomWidth: 1,
        borderBottomColor: darkMode ? "#1A3F6F" : "#E0E0E0"
      }]}>
        <TouchableOpacity
          onPress={goBack}
          style={{
            position: "absolute",
            left: 20,
            top: insets.top + 15,
            zIndex: 10,
            backgroundColor: darkMode ? "#1A3F6F" : "#E0E0E0",
            borderRadius: 20,
            padding: 10,
          }}
        >
          <Icon name="arrow-back" size={24} color={darkMode ? "#FFD700" : "#007AFF"} />
        </TouchableOpacity>

        {/* Logo centré */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/icons/icon.png")} // Remplacez par le chemin de votre logo
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          
          {/* Titre et description */}
          <View style={styles.titleContainer}>
            <Text style={[styles.pageTitle, { color: darkMode ? "#FFD700" : "#000" }]}>
              {t.form}
            </Text>
            <Text style={[styles.introText, { color: darkMode ? "#DDD" : "#222" }]}>
              {t.form_intro}
            </Text>
          </View>

          {/* Section Infos Perso */}
          <View style={[styles.sectionContainer, { 
            backgroundColor: darkMode ? "#1A3F6F" : "#F0F0F0",
            borderColor: darkMode ? "#36D7B7" : "#D0D0D0"
          }]}>
            <Text style={[styles.sectionTitle, { color: darkMode ? "#FFF" : "#000" }]}>
              {t.personal_information}
            </Text>

            <TextInput
              placeholder={t.enter_last_name}
              placeholderTextColor={darkMode ? "#999" : "#666"}
              value={formData.nom}
              onChangeText={(text) => handleInputChange("nom", text)}
              style={[styles.input, {
                backgroundColor: darkMode ? "#0A1F3A" : "#FFF",
                color: darkMode ? "#FFF" : "#000",
                borderColor: darkMode ? "#36D7B7" : "#999",
              }]}
            />

            <TextInput
              placeholder={t.enter_first_name}
              placeholderTextColor={darkMode ? "#999" : "#666"}
              value={formData.prenom}
              onChangeText={(text) => handleInputChange("prenom", text)}
              style={[styles.input, {
                backgroundColor: darkMode ? "#0A1F3A" : "#FFF",
                color: darkMode ? "#FFF" : "#000",
                borderColor: darkMode ? "#36D7B7" : "#999",
              }]}
            />

            <TextInput
              placeholder={t.enter_email}
              placeholderTextColor={darkMode ? "#999" : "#666"}
              value={formData.email}
              onChangeText={(text) => handleInputChange("email", text)}
              keyboardType="email-address"
              style={[styles.input, {
                backgroundColor: darkMode ? "#0A1F3A" : "#FFF",
                color: darkMode ? "#FFF" : "#000",
                borderColor: darkMode ? "#36D7B7" : "#999",
              }]}
            />

            <TextInput
              placeholder={t.enter_phone}
              placeholderTextColor={darkMode ? "#999" : "#666"}
              value={formData.telephone}
              onChangeText={(text) => handleInputChange("telephone", text)}
              keyboardType="phone-pad"
              style={[styles.input, {
                backgroundColor: darkMode ? "#0A1F3A" : "#FFF",
                color: darkMode ? "#FFF" : "#000",
                borderColor: darkMode ? "#36D7B7" : "#999",
              }]}
            />

            <TextInput
              placeholder={t.enter_birthdate}
              placeholderTextColor={darkMode ? "#999" : "#666"}
              value={formData.dateNaissance}
              onChangeText={(text) => handleInputChange("dateNaissance", text)}
              style={[styles.input, {
                backgroundColor: darkMode ? "#0A1F3A" : "#FFF",
                color: darkMode ? "#FFF" : "#000",
                borderColor: darkMode ? "#36D7B7" : "#999",
              }]}
            />

            <TextInput
              placeholder={t.enter_address}
              placeholderTextColor={darkMode ? "#999" : "#666"}
              value={formData.adresse}
              onChangeText={(text) => handleInputChange("adresse", text)}
              style={[styles.input, {
                backgroundColor: darkMode ? "#0A1F3A" : "#FFF",
                color: darkMode ? "#FFF" : "#000",
                borderColor: darkMode ? "#36D7B7" : "#999",
              }]}
            />

            <TextInput
              placeholder={t.enter_city}
              placeholderTextColor={darkMode ? "#999" : "#666"}
              value={formData.ville}
              onChangeText={(text) => handleInputChange("ville", text)}
              style={[styles.input, {
                backgroundColor: darkMode ? "#0A1F3A" : "#FFF",
                color: darkMode ? "#FFF" : "#000",
                borderColor: darkMode ? "#36D7B7" : "#999",
              }]}
            />
          </View>

          {/* Section Infos Académiques */}
          <View style={[styles.sectionContainer, { 
            backgroundColor: darkMode ? "#1A3F6F" : "#F0F0F0",
            borderColor: darkMode ? "#36D7B7" : "#D0D0D0"
          }]}>
            <Text style={[styles.sectionTitle, { color: darkMode ? "#FFF" : "#000" }]}>
              {t.academic_information}
            </Text>

            <RNPickerSelect
              onValueChange={(value) => handleInputChange("niveau", value)}
              value={formData.niveau}
              placeholder={{ label: t.select_level, value: null }}
              items={[
                { label: t.first_year, value: "premiere-annee" },
                { label: t.second_year, value: "deuxieme-annee" },
                { label: t.third_year, value: "troisieme-annee" },
                { label: t.master_1, value: "m1" },
                { label: t.master_2, value: "m2" },
              ]}
              style={{
                inputIOS: {
                  ...styles.pickerIOS,
                  backgroundColor: darkMode ? "#0A1F3A" : "#FFF",
                  color: darkMode ? "#FFF" : "#000",
                  borderColor: darkMode ? "#36D7B7" : "#999",
                  marginBottom: 10,
                },
                inputAndroid: {
                  ...styles.pickerAndroid,
                  backgroundColor: darkMode ? "#0A1F3A" : "#FFF",
                  color: darkMode ? "#FFF" : "#000",
                  borderColor: darkMode ? "#36D7B7" : "#999",
                  marginBottom: 10,
                },
                placeholder: {
                  color: darkMode ? "#999" : "#666",
                },
              }}
              Icon={() => <Icon name="arrow-drop-down" color={darkMode ? "#FFD700" : "#007AFF"} size={24} />}
            />

            <TextInput
              placeholder={t.enter_field}
              placeholderTextColor={darkMode ? "#999" : "#666"}
              value={formData.filiere}
              onChangeText={(text) => handleInputChange("filiere", text)}
              style={[styles.input, {
                backgroundColor: darkMode ? "#0A1F3A" : "#FFF",
                color: darkMode ? "#FFF" : "#000",
                borderColor: darkMode ? "#36D7B7" : "#999",
              }]}
            />

            <Text style={[styles.labelText, { color: darkMode ? "#FFF" : "#000" }]}>
              {t.bac_notes}
            </Text>

            <TextInput
              placeholder={t.math_note}
              placeholderTextColor={darkMode ? "#999" : "#666"}
              value={formData.notesBac.mathematiques}
              onChangeText={(text) => handleInputChange("notesBac.mathematiques", text)}
              keyboardType="numeric"
              style={[styles.input, {
                backgroundColor: darkMode ? "#0A1F3A" : "#FFF",
                color: darkMode ? "#FFF" : "#000",
                borderColor: darkMode ? "#36D7B7" : "#999",
              }]}
            />

            <TextInput
              placeholder={t.french_note}
              placeholderTextColor={darkMode ? "#999" : "#666"}
              value={formData.notesBac.francais}
              onChangeText={(text) => handleInputChange("notesBac.francais", text)}
              keyboardType="numeric"
              style={[styles.input, {
                backgroundColor: darkMode ? "#0A1F3A" : "#FFF",
                color: darkMode ? "#FFF" : "#000",
                borderColor: darkMode ? "#36D7B7" : "#999",
              }]}
            />

            <TextInput
              placeholder={t.average_note}
              placeholderTextColor={darkMode ? "#999" : "#666"}
              value={formData.notesBac.moyenneGenerale}
              onChangeText={(text) => handleInputChange("notesBac.moyenneGenerale", text)}
              keyboardType="numeric"
              style={[styles.input, {
                backgroundColor: darkMode ? "#0A1F3A" : "#FFF",
                color: darkMode ? "#FFF" : "#000",
                borderColor: darkMode ? "#36D7B7" : "#999",
              }]}
            />

            <TextInput
              placeholder={t.motivation_letter}
              placeholderTextColor={darkMode ? "#999" : "#666"}
              value={formData.motivation}
              onChangeText={(text) => handleInputChange("motivation", text)}
              multiline
              numberOfLines={4}
              style={[styles.motivationInput, {
                backgroundColor: darkMode ? "#0A1F3A" : "#FFF",
                color: darkMode ? "#FFF" : "#000",
                borderColor: darkMode ? "#36D7B7" : "#999",
              }]}
            />
          </View>

          {/* Section Documents */}
          <View style={[styles.sectionContainer, { 
            backgroundColor: darkMode ? "#1A3F6F" : "#F0F0F0",
            borderColor: darkMode ? "#36D7B7" : "#D0D0D0"
          }]}>
            <Text style={[styles.sectionTitle, { color: darkMode ? "#FFF" : "#000" }]}>
              {t.required_documents}
            </Text>

            <TouchableOpacity
              onPress={() => pickDocument("cin")}
              style={[styles.documentItem, {
                backgroundColor: darkMode ? "#0A1F3A" : "#FFF",
                borderColor: darkMode ? "#36D7B7" : "#999",
              }]}
            >
              <Text style={{ color: darkMode ? "#FFF" : "#000" }}>
                {t.attach_cin}
              </Text>
              <Icon name="attach-file" size={24} color={darkMode ? "#FFD700" : "#007AFF"} />
            </TouchableOpacity>
            {documents.cin && (
              <Text style={[styles.fileSelected, { color: darkMode ? "#36D7B7" : "#007AFF" }]}>
                {documents.cin.name}
              </Text>
            )}

            <TouchableOpacity
              onPress={() => pickDocument("relevesBac")}
              style={[styles.documentItem, {
                backgroundColor: darkMode ? "#0A1F3A" : "#FFF",
                borderColor: darkMode ? "#36D7B7" : "#999",
              }]}
            >
              <Text style={{ color: darkMode ? "#FFF" : "#000" }}>
                {t.attach_releves_bac}
              </Text>
              <Icon name="attach-file" size={24} color={darkMode ? "#FFD700" : "#007AFF"} />
            </TouchableOpacity>
            {documents.relevesBac && (
              <Text style={[styles.fileSelected, { color: darkMode ? "#36D7B7" : "#007AFF" }]}>
                {documents.relevesBac.name}
              </Text>
            )}

            <TouchableOpacity
              onPress={() => pickDocument("photo")}
              style={[styles.documentItem, {
                backgroundColor: darkMode ? "#0A1F3A" : "#FFF",
                borderColor: darkMode ? "#36D7B7" : "#999",
              }]}
            >
              <Text style={{ color: darkMode ? "#FFF" : "#000" }}>
                {t.attach_photo}
              </Text>
              <Icon name="attach-file" size={24} color={darkMode ? "#FFD700" : "#007AFF"} />
            </TouchableOpacity>
            {documents.photo && (
              <Text style={[styles.fileSelected, { color: darkMode ? "#36D7B7" : "#007AFF" }]}>
                {documents.photo.name}
              </Text>
            )}
          </View>

          {/* Bouton de soumission */}
          <TouchableOpacity
            onPress={submitForm}
            style={[styles.submitButton, {
              backgroundColor: darkMode ? "#36D7B7" : "#007AFF",
            }]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 16 }}>
                {t.submit_application}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de succès */}
      <Modal animationType="fade" transparent={true} visible={successModalVisible}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, {
            backgroundColor: darkMode ? "#1A3F6F" : "#FFF",
            borderColor: darkMode ? "#36D7B7" : "#999",
          }]}>
            <Icon name="check-circle" size={60} color="#36D7B7" />
            <Text style={[styles.modalTitle, { color: darkMode ? "#FFF" : "#000" }]}>
              {t.application_sent}
            </Text>
            <Text style={[styles.modalText, { color: darkMode ? "#FFF" : "#000" }]}>
              {t.application_sent_desc}
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  introText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 22,
  },
  sectionContainer: {
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  labelText: {
    marginBottom: 8,
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    marginVertical: 5,
    fontSize: 16,
  },
  pickerIOS: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  pickerAndroid: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  documentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
  },
  fileSelected: {
    fontSize: 12,
    marginLeft: 5,
    marginBottom: 10,
    fontStyle: "italic",
  },
  motivationInput: {
    borderRadius: 8,
    padding: 12,
    height: 120,
    borderWidth: 1,
    textAlignVertical: "top",
    marginVertical: 5,
    fontSize: 16,
  },
  submitButton: {
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
    width: "85%",
    borderWidth: 2,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
});