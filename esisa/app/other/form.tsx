import React, { useState, useContext } from "react";
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
import RNPickerSelect from "react-native-picker-select";
import config from "../../config";
import { DarkModeContext } from "../context/DarkModeContext";
import { useTranslation } from "react-i18next";

export default function ApplicationFormScreen() {
  const { t } = useTranslation();
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
      Alert.alert(t("error"), t("document_select_error"));
    }
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+212|0)[5-7][0-9]{8}$/;

    if (!formData.nom || !formData.prenom) {
      Alert.alert(t("error"), t("enter_name_prenom"));
      return false;
    }
    if (!formData.email || !emailRegex.test(formData.email)) {
      Alert.alert(t("error"), t("enter_valid_email"));
      return false;
    }
    if (!formData.telephone || !phoneRegex.test(formData.telephone)) {
      Alert.alert(t("error"), t("enter_valid_phone"));
      return false;
    }
    if (!formData.dateNaissance) {
      Alert.alert(t("error"), t("enter_birthdate"));
      return false;
    }
    if (!formData.niveau) {
      Alert.alert(t("error"), t("select_niveau"));
      return false;
    }
    if (!formData.notesBac.mathematiques || !formData.notesBac.francais) {
      Alert.alert(t("error"), t("enter_bac_notes"));
      return false;
    }
    if (!documents.cin) {
      Alert.alert(t("error"), t("attach_cin"));
      return false;
    }
    if (!documents.relevesBac) {
      Alert.alert(t("error"), t("attach_releves_bac"));
      return false;
    }
    if (!documents.photo) {
      Alert.alert(t("error"), t("attach_photo"));
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
        Alert.alert(t("error"), responseData.message || t("send_error"));
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Alert.alert(t("error"), t("submit_form_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const dynamicStyles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: darkMode ? "#0A1F3A" : "#FFF",
    },
    statusBar: {
      barStyle: darkMode ? "light-content" : "dark-content",
      backgroundColor: darkMode ? "#0A1F3A" : "#FFF",
    },
    textColor: {
      color: darkMode ? "#DDD" : "#222",
    },
    inputBackground: {
      backgroundColor: darkMode ? "#1A3F6F" : "#E0E0E0",
      color: darkMode ? "#FFF" : "#222",
      borderColor: darkMode ? "#36D7B7" : "#999",
    },
    sectionBackground: {
      backgroundColor: darkMode ? "rgba(26, 63, 111, 0.3)" : "#F0F0F0",
      borderColor: darkMode ? "#36D7B7" : "#CCC",
    },
    buttonBackground: {
      backgroundColor: darkMode ? "#36D7B7" : "#007AFF",
    },
    buttonText: {
      color: "#FFF",
      fontWeight: "bold",
      fontSize: 16,
    },
    labelText: {
      color: darkMode ? "#DDD" : "#222",
      marginBottom: 5,
      fontSize: 15,
    },
    documentButton: {
      backgroundColor: darkMode ? "#48A4E5" : "#0A84FF",
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 5,
    },
    documentButtonText: {
      color: "#FFF",
      fontWeight: "bold",
    },
    modalContent: {
      backgroundColor: darkMode ? "#1A3F6F" : "#FFF",
      borderColor: darkMode ? "#36D7B7" : "#CCC",
    },
    modalText: {
      color: darkMode ? "#FFF" : "#222",
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.safeArea}>
      <StatusBar {...dynamicStyles.statusBar} />
      <TouchableOpacity
        onPress={goBack}
        style={{
          position: "absolute",
          top: insets.top + 10,
          left: 20,
          zIndex: 10,
          backgroundColor: darkMode ? "#1A3F6F" : "#E0E0E0",
          borderRadius: 20,
          padding: 10,
        }}
      >
        <Icon name="arrow-back" size={24} color={darkMode ? "#FFD700" : "#007AFF"} />
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
              source={require("../../assets/icons/icon.png")}
              style={styles.logoImage}
            />
          </View>
          <View style={styles.headerContainer}>
            <Icon name="edit" size={28} color={darkMode ? "#FFD700" : "#007AFF"} />
            <Text style={[styles.pageTitle, dynamicStyles.textColor]}>
              {t("form")}
            </Text>
          </View>

          <Text style={[styles.introText, dynamicStyles.textColor]}>
            {t("form intro")}
          </Text>

          {/* Section Infos Perso */}
          <View style={[styles.sectionContainer, dynamicStyles.sectionBackground]}>
            <Text style={[styles.sectionTitle, dynamicStyles.textColor]}>
              {t("personal information")}
            </Text>

            {[
              { label: t("last name") + " *", value: formData.nom, field: "nom", placeholder: t("enter last name") },
              { label: t("first name") + " *", value: formData.prenom, field: "prenom", placeholder: t("enter first name") },
              { label: t("email") + " *", value: formData.email, field: "email", placeholder: t("enter email"), keyboardType: "email-address" },
              { label: t("phone") + " *", value: formData.telephone, field: "telephone", placeholder: t("enter phone"), keyboardType: "phone-pad" },
              { label: t("birth date") + " *", value: formData.dateNaissance, field: "dateNaissance", placeholder: "JJ/MM/AAAA" },
              { label: t("address"), value: formData.adresse, field: "adresse", placeholder: t("enter address") },
              { label: t("city"), value: formData.ville, field: "ville", placeholder: t("enter city") },
            ].map(({ label, value, field, placeholder, keyboardType }, i) => (
              <View style={styles.inputGroup} key={i}>
                <Text style={[styles.labelText, dynamicStyles.labelText]}>{label}</Text>
                <TextInput
                  style={[styles.input, dynamicStyles.inputBackground]}
                  placeholder={placeholder}
                  placeholderTextColor={darkMode ? "#999" : "#666"}
                  value={value}
                  keyboardType={keyboardType || "default"}
                  onChangeText={(text) => handleInputChange(field, text)}
                />
              </View>
            ))}
          </View>

          {/* Section Infos Académiques */}
          <View style={[styles.sectionContainer, dynamicStyles.sectionBackground]}>
            <Text style={[styles.sectionTitle, dynamicStyles.textColor]}>{t("academic information")}</Text>
            <View style={styles.inputGroup}>
              <Text style={[styles.labelText, dynamicStyles.labelText]}>{t("desired level") + " *"}</Text>
              <RNPickerSelect
                onValueChange={(value) => handleInputChange("niveau", value)}
                value={formData.niveau}
                placeholder={{ label: t("select level placeholder"), value: null }}
                items={[
                  { label: t("first year"), value: "premiere-annee" },
                  { label: t("second year"), value: "deuxieme-annee" },
                  { label: t("third year"), value: "troisieme-annee" },
                  { label: t("master 1"), value: "m1" },
                  { label: t("master 2"), value: "m2" },
                ]}
                useNativeAndroidPickerStyle={false}
                style={{
                  inputIOS: {
                    ...styles.pickerIOS,
                    backgroundColor: dynamicStyles.inputBackground.backgroundColor,
                    color: dynamicStyles.inputBackground.color,
                    borderColor: dynamicStyles.inputBackground.borderColor,
                    marginBottom: 10,
                  },
                  inputAndroid: {
                    ...styles.pickerAndroid,
                    backgroundColor: dynamicStyles.inputBackground.backgroundColor,
                    color: dynamicStyles.inputBackground.color,
                    borderColor: dynamicStyles.inputBackground.borderColor,
                    marginBottom: 10,
                  },
                  placeholder: {
                    color: darkMode ? "#999" : "#666",
                  },
                }}
                Icon={() => (
                  <Icon name="arrow-drop-down" color={darkMode ? "#FFD700" : "#007AFF"} size={24} />
                )}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.labelText, dynamicStyles.labelText]}>{t("field_of_study")}</Text>
              <TextInput
                style={[styles.input, dynamicStyles.inputBackground]}
                placeholder={t("enter_field_of_study")}
                placeholderTextColor={darkMode ? "#999" : "#666"}
                value={formData.filiere}
                onChangeText={(text) => handleInputChange("filiere", text)}
              />
            </View>

            {[
              { label: t("math_bac") + " *", field: "notesBac.mathematiques", value: formData.notesBac.mathematiques, placeholder: t("enter_math_note") },
              { label: t("french_bac") + " *", field: "notesBac.francais", value: formData.notesBac.francais, placeholder: t("enter_french_note") },
              { label: t("general_avg_bac"), field: "notesBac.moyenneGenerale", value: formData.notesBac.moyenneGenerale, placeholder: t("enter_general_avg"), keyboardType: "numeric" },
            ].map(({ label, field, value, placeholder, keyboardType }, i) => (
              <View style={styles.inputGroup} key={i}>
                <Text style={[styles.labelText, dynamicStyles.labelText]}>{label}</Text>
                <TextInput
                  style={[styles.input, dynamicStyles.inputBackground]}
                  placeholder={placeholder}
                  placeholderTextColor={darkMode ? "#999" : "#666"}
                  keyboardType={keyboardType || "default"}
                  value={value}
                  onChangeText={(text) => handleInputChange(field, text)}
                />
              </View>
            ))}
          </View>

          {/* Section Documents */}
          <View style={[styles.sectionContainer, dynamicStyles.sectionBackground]}>
            <Text style={[styles.sectionTitle, dynamicStyles.textColor]}>{t("required_documents")}</Text>

            {[
              { key: "cin", title: t("cin_copy"), desc: t("cin_desc") },
              { key: "relevesBac", title: t("bac_records"), desc: t("bac_records_desc") },
              { key: "photo", title: t("recent_photo"), desc: t("recent_photo_desc") },
            ].map(({ key, title, desc }) => (
              <View style={styles.documentItem} key={key}>
                <View style={styles.documentInfo}>
                  <Text style={[styles.documentTitle, dynamicStyles.textColor]}>{title}</Text>
                  <Text style={[styles.documentDescription, dynamicStyles.textColor]}>{desc}</Text>
                </View>
                <TouchableOpacity
                  style={dynamicStyles.documentButton}
                  onPress={() => pickDocument(key)}
                >
                  <Text style={dynamicStyles.documentButtonText}>
                    {documents[key as keyof typeof documents] ? t("modify") : t("choose")}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            {documents.cin && (
              <Text style={[styles.fileSelected, dynamicStyles.textColor]}>
                {t("file_selected")}: {documents.cin.name}
              </Text>
            )}
            {documents.relevesBac && (
              <Text style={[styles.fileSelected, dynamicStyles.textColor]}>
                {t("file_selected")}: {documents.relevesBac.name}
              </Text>
            )}
            {documents.photo && (
              <Text style={[styles.fileSelected, dynamicStyles.textColor]}>
                {t("file_selected")}: {documents.photo.name}
              </Text>
            )}
          </View>

          {/* Motivation Section */}
          <View style={[styles.sectionContainer, dynamicStyles.sectionBackground]}>
            <Text style={[styles.sectionTitle, dynamicStyles.textColor]}>{t("motivation_letter")}</Text>
            <TextInput
              style={[styles.motivationInput, dynamicStyles.inputBackground]}
              placeholder={t("motivation_placeholder")}
              placeholderTextColor={darkMode ? "#999" : "#666"}
              multiline={true}
              numberOfLines={8}
              textAlignVertical="top"
              value={formData.motivation}
              onChangeText={(text) => handleInputChange("motivation", text)}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: dynamicStyles.buttonBackground.backgroundColor }]}
            onPress={submitForm}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={dynamicStyles.buttonText}>{t("submit_application")}</Text>
            )}
          </TouchableOpacity>

          <Text style={[styles.mandatoryFieldsText, dynamicStyles.textColor]}>
            {t("mandatory_fields")}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal animationType="fade" transparent={true} visible={successModalVisible}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, dynamicStyles.modalContent]}>
            <Icon name="check-circle" size={60} color="#36D7B7" />
            <Text style={[styles.modalTitle, dynamicStyles.textColor]}>{t("application_sent")}</Text>
            <Text style={[styles.modalText, dynamicStyles.modalText]}>
              {t("application_sent_desc")}
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
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 10,
  },
  introText: {
    fontSize: 16,
    fontStyle: "italic",
    marginBottom: 20,
    textAlign: "center",
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
  inputGroup: {
    marginBottom: 15,
  },
  labelText: {
    marginBottom: 5,
    fontSize: 15,
  },
  input: {
    borderRadius: 5,
    padding: 12,
    borderWidth: 1,
  },
  pickerIOS: {
    borderRadius: 5,
    padding: 12,
    borderWidth: 1,
  },
  pickerAndroid: {
    borderRadius: 5,
    padding: 12,
    borderWidth: 1,
  },
  documentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    padding: 15,
    borderRadius: 8,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 5,
  },
  documentDescription: {
    fontSize: 12,
  },
  fileSelected: {
    fontSize: 12,
    marginBottom: 15,
    marginLeft: 5,
  },
  motivationInput: {
    borderRadius: 5,
    padding: 12,
    height: 150,
    borderWidth: 1,
    textAlignVertical: "top",
  },
  submitButton: {
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 10,
    alignItems: "center",
  },
  mandatoryFieldsText: {
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
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
    width: "80%",
    borderWidth: 2,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
});
