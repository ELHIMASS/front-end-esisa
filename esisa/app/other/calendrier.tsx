// app/calendrier.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Icon } from "react-native-elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from '../../config';

interface Evenement {
  _id?: string;
  date: string;
  titre: string;
  description: string;
}

interface User {
  role: string;
  [key: string]: any;
}

export default function CalendrierScreen() {
  const insets = useSafeAreaInsets();
  const [selectedSemester, setSelectedSemester] = useState("S1");
  const [evenementsS1, setEvenementsS1] = useState<Evenement[]>([]);
  const [evenementsS2, setEvenementsS2] = useState<Evenement[]>([]);
  const [evenementsSpeciaux, setEvenementsSpeciaux] = useState<Evenement[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Evenement | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateString, setDateString] = useState('');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date(),
    titre: '',
    description: ''
  });

  useEffect(() => {
    checkUserRole();
    loadCalendrierData();
  }, []);

  const checkUserRole = async () => {
    try {
      const admin = await AsyncStorage.getItem("admin");
      const student = await AsyncStorage.getItem("user");
      const prof = await AsyncStorage.getItem("prof");

      if (admin) {
        const adminData: User = JSON.parse(admin);
        setIsAdmin(adminData.role === 'admin');
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle:', error);
      setIsAdmin(false);
    }
  };

  const loadCalendrierData = async () => {
    try {
      setLoading(true);
      
      const [s1Response, s2Response, evenementsResponse] = await Promise.all([
        fetch(`${config.API_URL}/api/calendrier/s1`),
        fetch(`${config.API_URL}/api/calendrier/s2`),
        fetch(`${config.API_URL}/api/calendrier/evenement`)
      ]);

      const s1Data = s1Response.ok ? await s1Response.json() : [];
      const s2Data = s2Response.ok ? await s2Response.json() : [];
      const evenementsData = evenementsResponse.ok ? await evenementsResponse.json() : [];

      setEvenementsS1(Array.isArray(s1Data) ? s1Data : []);
      setEvenementsS2(Array.isArray(s2Data) ? s2Data : []);
      setEvenementsSpeciaux(Array.isArray(evenementsData) ? evenementsData : []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      Alert.alert('Erreur', 'Impossible de charger les données du calendrier');
    } finally {
      setLoading(false);
    }
  };

  const goBack = async () => {
    try {
      const admin = await AsyncStorage.getItem("admin");
      
      if (admin) {
        const adminData: User = JSON.parse(admin);
        if (adminData.role === 'admin') {
          router.replace("/admin");
          return;
        }
      }
      
      router.replace("/(tabs)");
    } catch (error) {
      console.error('Erreur lors de la redirection:', error);
      router.replace("/(tabs)");
    }
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    setFormData({
      date: today,
      titre: '',
      description: ''
    });
    setDateString(todayString);
    setModalVisible(true);
  };

  const handleEditEvent = (event: Evenement) => {
    setEditingEvent(event);
    const eventDate = new Date(event.date);
    const dateStr = eventDate.toISOString().split('T')[0];
    setFormData({
      date: eventDate,
      titre: event.titre,
      description: event.description
    });
    setDateString(dateStr);
    setModalVisible(true);
  };

  const handleDeletePress = (eventId: string) => {
    setEventToDelete(eventId);
    setConfirmModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    
    try {
      let endpoint;
      switch(selectedSemester) {
        case 'S1':
          endpoint = `${config.API_URL}/api/calendrier/s1/${eventToDelete}`;
          break;
        case 'S2':
          endpoint = `${config.API_URL}/api/calendrier/s2/${eventToDelete}`;
          break;
        case 'Spécial':
          endpoint = `${config.API_URL}/api/calendrier/evenement/${eventToDelete}`;
          break;
        default:
          throw new Error('Semestre invalide');
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        loadCalendrierData();
        Alert.alert('Succès', 'Événement supprimé avec succès');
      } else {
        throw new Error('Échec de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      Alert.alert('Erreur', 'Impossible de supprimer l\'événement');
    } finally {
      setConfirmModalVisible(false);
      setEventToDelete(null);
    }
  };

  const saveEvent = async () => {
    if (!formData.titre.trim() || !formData.description.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      let endpoint;
      switch(selectedSemester) {
        case 'S1': endpoint = `${config.API_URL}/api/calendrier/s1`; break;
        case 'S2': endpoint = `${config.API_URL}/api/calendrier/s2`; break;
        case 'Spécial': endpoint = `${config.API_URL}/api/calendrier/evenement`; break;
        default: endpoint = `${config.API_URL}/api/calendrier/evenement`;
      }

      const method = editingEvent ? 'PUT' : 'POST';
      const url = editingEvent ? `${endpoint}/${editingEvent._id}` : endpoint;

      const selectedDate = new Date(dateString + 'T00:00:00.000Z');

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          titre: formData.titre,
          description: formData.description
        })
      });

      if (response.ok) {
        setModalVisible(false);
        setTimeout(() => {
          loadCalendrierData();
        }, 100);
        Alert.alert('Succès', editingEvent ? 'Événement modifié' : 'Événement ajouté');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder l\'événement');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEPT', 'OCT', 'NOV', 'DÉC'];
    const month = months[date.getMonth()];
    return { day, month };
  };

  const getCurrentEvents = () => {
    switch(selectedSemester) {
      case 'S1': return evenementsS1;
      case 'S2': return evenementsS2;
      case 'Spécial': return evenementsSpeciaux;
      default: return [];
    }
  };

  const renderSchedule = () => {
    const events = getCurrentEvents();
    
    if (loading) {
      return (
        <View style={styles.scheduleContainer}>
          <Text style={styles.scheduleTitle}>Chargement...</Text>
        </View>
      );
    }

    const getSemesterTitle = () => {
      switch(selectedSemester) {
        case 'S1': return 'Semestre 1 (Sept - Jan)';
        case 'S2': return 'Semestre 2 (Fév - Juin)';
        case 'Spécial': return 'Événements Spéciaux';
        default: return '';
      }
    };

    return (
      <View style={styles.scheduleContainer}>
        <View style={styles.scheduleHeader}>
          <Text style={styles.scheduleTitle}>{getSemesterTitle()}</Text>
          {isAdmin && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddEvent}
            >
              <Icon name="add" size={20} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
        
        {events.length === 0 ? (
          <Text style={styles.noEventsText}>Aucun événement programmé</Text>
        ) : (
          events.map((event, index) => {
            const { day, month } = formatDate(event.date);
            
            return (
              <View key={event._id || `event-${index}`} style={styles.eventItem}>
                <View style={styles.eventDate}>
                  <Text style={styles.dateText}>{day}</Text>
                  <Text style={styles.monthText}>{month}</Text>
                </View>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventTitle}>{event.titre}</Text>
                  <Text style={styles.eventDesc}>{event.description}</Text>
                </View>
                {isAdmin && event._id && (
                  <View style={styles.eventActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => handleEditEvent(event)}
                    >
                      <Icon name="edit" size={16} color="#FFD700" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeletePress(event._id!)}
                    >
                      <Icon name="delete" size={16} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    );
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
            source={require('../../assets/icons/icon.png')}
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
        <TouchableOpacity style={styles.actionButtonMain}>
          <Text style={styles.buttonText}>Télécharger le calendrier complet (PDF)</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal pour ajouter/modifier un événement */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingEvent ? 'Modifier l\'événement' : 'Ajouter un événement'}
            </Text>
            
            <Text style={styles.fieldLabel}>Date</Text>
            <TextInput
              style={styles.textInput}
              value={dateString}
              onChangeText={(text) => {
                setDateString(text);
                const newDate = new Date(text);
                if (!isNaN(newDate.getTime())) {
                  setFormData({...formData, date: newDate});
                }
              }}
              placeholder="YYYY-MM-DD (ex: 2024-12-25)"
              placeholderTextColor="#999"
            />

            <Text style={styles.fieldLabel}>Titre</Text>
            <TextInput
              style={styles.textInput}
              value={formData.titre}
              onChangeText={(text) => setFormData({...formData, titre: text})}
              placeholder="Titre de l'événement"
              placeholderTextColor="#999"
            />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({...formData, description: text})}
              placeholder="Description de l'événement"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveEvent}
              >
                <Text style={styles.saveButtonText}>
                  {editingEvent ? 'Modifier' : 'Ajouter'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.confirmModalContainer}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>Confirmer la suppression</Text>
            <Text style={styles.confirmModalText}>
              Êtes-vous sûr de vouloir supprimer cet événement ?
            </Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.cancelConfirmButton]}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.cancelConfirmButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.deleteConfirmButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteConfirmButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
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
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
  },
  addButton: {
    backgroundColor: "#36D7B7",
    borderRadius: 20,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noEventsText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginVertical: 20,
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
  eventActions: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 5,
    marginVertical: 2,
  },
  editButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
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
  actionButtonMain: {
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#0A1F3A',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#36D7B7',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 5,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: 'rgba(26, 63, 111, 0.3)',
    borderWidth: 1,
    borderColor: '#36D7B7',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  saveButton: {
    backgroundColor: '#36D7B7',
  },
  cancelButtonText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  // Confirmation Modal Styles
  confirmModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalContent: {
    backgroundColor: '#0A1F3A',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    borderWidth: 1,
    borderColor: '#36D7B7',
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 15,
  },
  confirmModalText: {
    fontSize: 16,
    color: '#DDD',
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelConfirmButton: {
    backgroundColor: 'rgba(26, 63, 111, 0.5)',
    borderWidth: 1,
    borderColor: '#36D7B7',
  },
  deleteConfirmButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.5)',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  cancelConfirmButtonText: {
    color: '#36D7B7',
    fontWeight: 'bold',
  },
  deleteConfirmButtonText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
});