import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Icon } from 'react-native-elements';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
const IP = "192.168.1.180";
const API_URL = `http://${IP}:5000/api`;

type Evaluation = {
  type: string;
  score: number;
  weight: number;
  date: string;
  comment?: string;
};

type Grade = {
  subject: string;
  academicYear: string;
  semester: string;
  evaluations: Evaluation[];
};

type Absence = {
  date: string;
  subject: string;
  justified: boolean;
  comment: string;
};

type Student = {
  _id: string;
  email: string;
  name: string;
  anne_scolaire: string;
  group: string;
  grades?: Grade[];
  absences?: Absence[];
};

type User = {
  name: string;
  matiere: string[];
};

export default function ProfessorDashboard() {
  // États
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [searchText, setSearchText] = useState('');
  const [currentTab, setCurrentTab] = useState('notes');
  const [loading, setLoading] = useState(true);
  
  // États pour les modals
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [ccGrade, setCcGrade] = useState('');
  const [partielGrade, setPartielGrade] = useState('');
  const [projetGrade, setProjetGrade] = useState('');
  const [absenceDate, setAbsenceDate] = useState(new Date().toISOString().split('T')[0]);
  const [absenceComment, setAbsenceComment] = useState('');
  const [absenceJustified, setAbsenceJustified] = useState(false);
  const [isMenuVisible, setMenuVisible] = useState(false);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const slideAnim = useState(new Animated.Value(300))[0];

  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      try {
        const profData = await AsyncStorage.getItem('prof');
        if (!profData) {
          router.replace('/login');
          return;
        }
        
        const parsedUser = JSON.parse(profData);
        setUser(parsedUser);
        
        const response = await fetch(`${API_URL}/students`);
        const data = await response.json();
        setStudents(data);
        setFilteredStudents(data);
        setLoading(false);
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de charger les données');
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtrage des étudiants
  useEffect(() => {
    let filtered = [...students];
    
    if (selectedYear) {
      filtered = filtered.filter(student => 
        student.anne_scolaire === selectedYear
      );
    }
    
    if (selectedGroup) {
      filtered = filtered.filter(student => 
        student.group === selectedGroup
      );
    }
    
    if (searchText) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (student.email && student.email.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
    
    setFilteredStudents(filtered);
  }, [students, selectedYear, selectedGroup, searchText]);

  // Menu animation
  const toggleMenu = () => {
    if (isMenuVisible) {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("prof");
      router.replace("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      Alert.alert("Erreur", "Un problème est survenu lors de la déconnexion.");
    }
  };

  // Mise à jour d'un étudiant
  const updateStudent = async (email: string, updateData: Partial<Student>) => {
    try {
      const response = await fetch(`${API_URL}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...updateData })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la mise à jour');
      }
      
      const updatedData = await response.json();
      
      setStudents(students.map(student => 
        student.email === updatedData.email ? updatedData : student
      ));
      
      return updatedData;
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', error.message || 'Échec de la mise à jour');
      throw error;
    }
  };

  // Gestion des notes
  const handleAddGrade = (student: Student) => {
    setCurrentStudent(student);
    setSelectedSubject(user?.matiere[0] || '');
    setShowGradeModal(true);
  };

  const saveGrade = async () => {
    if (!currentStudent || !selectedSubject) return;

    try {
      const currentDate = new Date().toISOString();
      const academicYear = getAcademicYear();
      const semester = getCurrentSemester();

      const newGrade: Grade = {
        subject: selectedSubject,
        academicYear,
        semester,
        evaluations: [
          {
            type: "CC",
            score: parseFloat(ccGrade) || 0,
            weight: 0.3,
            date: currentDate
          },
          {
            type: "Partiel",
            score: parseFloat(partielGrade) || 0,
            weight: 0.4,
            date: currentDate
          },
          {
            type: "Projet",
            score: parseFloat(projetGrade) || 0,
            weight: 0.3,
            date: currentDate
          }
        ]
      };

      await updateStudent(currentStudent.email, {
        grades: [...(currentStudent.grades || []), newGrade]
      });

      setShowGradeModal(false);
      setCcGrade('');
      setPartielGrade('');
      setProjetGrade('');
      Alert.alert('Succès', 'Notes enregistrées avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
    }
  };

  // Gestion des absences
  const handleAddAbsence = (student: Student) => {
    setCurrentStudent(student);
    setSelectedSubject(user?.matiere[0] || '');
    setShowAbsenceModal(true);
  };

  const saveAbsence = async () => {
    if (!currentStudent || !selectedSubject) return;

    try {
      const newAbsence: Absence = {
        date: absenceDate,
        subject: selectedSubject,
        justified: absenceJustified,
        comment: absenceComment || ''
      };

      await updateStudent(currentStudent.email, {
        absences: [...(currentStudent.absences || []), newAbsence]
      });

      setShowAbsenceModal(false);
      setAbsenceComment('');
      setAbsenceJustified(false);
      Alert.alert('Succès', 'Absence enregistrée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
    }
  };

  // Helpers
  const getAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    return `${year}-${year + 1}`;
  };

  const getCurrentSemester = () => {
    const month = new Date().getMonth();
    return month >= 8 ? "S1" : "S2";
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: "#0A1F3A" }]}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  if (!user?.matiere?.length) {
    return (
      <View style={[styles.center, { backgroundColor: "#0A1F3A" }]}>
        <Text style={styles.errorText}>
          Aucune matière n'est assignée à votre compte.
          Veuillez contacter l'administration.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A1F3A" }}>
      {/* Menu Button */}
      <TouchableOpacity
        onPress={toggleMenu}
        style={{
          position: "absolute",
          top: insets.top + 10,
          right: 20,
          zIndex: 1,
          backgroundColor: "#1A3F6F",
          borderRadius: 20,
          padding: 10,
          elevation: 5,
          shadowColor: "#FFD700",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.8,
          shadowRadius: 3,
        }}
      >
        <Icon name="menu" size={30} color="#FFD700" />
      </TouchableOpacity>

      {/* Drawer Menu */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="none"
        onRequestClose={toggleMenu}
      >
        <Pressable
          style={styles.modalBackgroundRight}
          onPress={toggleMenu}
        >
          <Animated.View
            style={[
              styles.menuDrawerRight,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            <View style={styles.menuHeader}>
              <Text style={styles.menuHeaderText}>MENU PROFESSEUR</Text>
            </View>

            {[
              { label: "🏠 Accueil", route: "/(tabs)/index" },
              { label: "📊 Tableau de bord", route: "#" },
              { label: "📝 Mon profil", route: "#" },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => {
                  toggleMenu();
                  if (item.route !== "#") {
                    router.push(item.route);
                  }
                }}
              >
                <Text style={styles.menuText}>{item.label}</Text>
                <Icon name="chevron-right" size={20} color="#FFD700" />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: "#1A3F6F" }]}
              onPress={handleLogout}
            >
              <Text style={[styles.menuText, { color: "#FF5555" }]}>
                🚪 Se déconnecter
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Main Content */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.split(' ')
                .filter((item) => item.length > 1)
                .map((item) => item[0].toUpperCase())
                .join('')}
            </Text>
          </View>
          <View style={styles.glowEffect} />
        </View>

        <Text style={styles.title}>ESPACE PROFESSEUR</Text>
        <Text style={styles.subtitle}>{user?.name}</Text>
        <Text style={styles.subjectList}>
          {user?.matiere?.join(' • ') || "Aucune matière assignée"}
        </Text>

        {/* Filter Section */}
        <View style={styles.filterContainer}>
          <View style={styles.filterRow}>
            <View style={styles.filterPicker}>
              <Text style={styles.filterLabel}>Année:</Text>
              <Picker
                selectedValue={selectedYear}
                style={styles.picker}
                dropdownIconColor="#FFD700"
                onValueChange={setSelectedYear}
              >
                <Picker.Item label="Toutes années" value="" color="#FFF" />
                <Picker.Item label="1ère année" value="1ère année" color="#FFF" />
                <Picker.Item label="2ème année" value="2ème année" color="#FFF" />
                <Picker.Item label="3ème année" value="3ème année" color="#FFF" />
                <Picker.Item label="4ème année" value="4ème année" color="#FFF" />
                <Picker.Item label="5ème année" value="5ème année" color="#FFF" />
              </Picker>
            </View>

            <View style={styles.filterPicker}>
              <Text style={styles.filterLabel}>Groupe:</Text>
              <Picker
                selectedValue={selectedGroup}
                style={styles.picker}
                dropdownIconColor="#FFD700"
                onValueChange={setSelectedGroup}
              >
                <Picker.Item label="Tous groupes" value="" color="#FFF" />
                <Picker.Item label="Groupe A" value="A" color="#FFF" />
                <Picker.Item label="Groupe B" value="B" color="#FFF" />
                <Picker.Item label="Groupe C" value="C" color="#FFF" />
              </Picker>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#FFD700" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un étudiant..."
              placeholderTextColor="#6D8EB4"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'notes' && styles.activeTab]}
            onPress={() => setCurrentTab('notes')}
          >
            <Text style={[styles.tabText, currentTab === 'notes' && styles.activeTabText]}>
              Notes
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, currentTab === 'absences' && styles.activeTab]}
            onPress={() => setCurrentTab('absences')}
          >
            <Text style={[styles.tabText, currentTab === 'absences' && styles.activeTabText]}>
              Absences
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Students List */}
      <ScrollView style={styles.content}>
        {filteredStudents.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="school" size={50} color="#1A3F6F" />
            <Text style={styles.emptyStateText}>
              {selectedYear || selectedGroup || searchText
                ? "Aucun étudiant ne correspond aux critères de recherche"
                : "Aucun étudiant disponible"}
            </Text>
          </View>
        ) : (
          filteredStudents.map((student) => (
            <View key={student._id} style={styles.studentCard}>
              <View style={styles.studentHeader}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentInfo}>
                  {student.anne_scolaire} - Groupe {student.group}
                </Text>
              </View>

              {currentTab === 'notes' ? (
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => handleAddGrade(student)}
                >
                  <Text style={styles.addButtonText}>+ Ajouter notes</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => handleAddAbsence(student)}
                >
                  <Text style={styles.addButtonText}>+ Ajouter absence</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Grade Modal */}
      <Modal
        visible={showGradeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGradeModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {currentStudent?.name || "Étudiant"}
            </Text>

            <Text style={styles.modalSubtitle}>
              Groupe {currentStudent?.group || "-"} - {currentStudent?.anne_scolaire || "-"}
            </Text>

            <Text style={styles.modalLabel}>Matière:</Text>
            <View style={styles.absencePickerContainer}>
              <Picker
                selectedValue={selectedSubject}
                style={styles.absencePicker}
                dropdownIconColor="#FFD700"
                onValueChange={setSelectedSubject}
              >
                {user?.matiere?.map((subject, index) => (
                  <Picker.Item key={index} label={subject} value={subject} color="#FFF" />
                ))}
              </Picker>
            </View>

            <View style={styles.gradeInputContainer}>
              <Text style={styles.gradeLabel}>Contrôle Continu:</Text>
              <TextInput
                style={styles.gradeInput}
                value={ccGrade}
                onChangeText={setCcGrade}
                placeholder="Note /20"
                keyboardType="numeric"
                placeholderTextColor="#6D8EB4"
              />
            </View>

            <View style={styles.gradeInputContainer}>
              <Text style={styles.gradeLabel}>Partiel:</Text>
              <TextInput
                style={styles.gradeInput}
                value={partielGrade}
                onChangeText={setPartielGrade}
                placeholder="Note /20"
                keyboardType="numeric"
                placeholderTextColor="#6D8EB4"
              />
            </View>

            <View style={styles.gradeInputContainer}>
              <Text style={styles.gradeLabel}>Projet:</Text>
              <TextInput
                style={styles.gradeInput}
                value={projetGrade}
                onChangeText={setProjetGrade}
                placeholder="Note /20"
                keyboardType="numeric"
                placeholderTextColor="#6D8EB4"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#D32F2F" }]}
                onPress={() => setShowGradeModal(false)}
              >
                <Text style={styles.buttonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#2E7D32" }]}
                onPress={saveGrade}
              >
                <Text style={styles.buttonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Absence Modal */}
      <Modal
        visible={showAbsenceModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAbsenceModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Ajouter une absence
            </Text>

            <Text style={styles.modalSubtitle}>
              {currentStudent?.name || "Étudiant"} - Groupe {currentStudent?.group || "-"}
            </Text>

            <Text style={styles.modalLabel}>Matière:</Text>
            <View style={styles.absencePickerContainer}>
              <Picker
                selectedValue={selectedSubject}
                style={styles.absencePicker}
                dropdownIconColor="#FFD700"
                onValueChange={setSelectedSubject}
              >
                {user?.matiere?.map((subject, index) => (
                  <Picker.Item key={index} label={subject} value={subject} color="#FFF" />
                ))}
              </Picker>
            </View>

            <Text style={styles.modalLabel}>Date (AAAA-MM-JJ):</Text>
            <TextInput
              style={styles.dateInput}
              value={absenceDate}
              onChangeText={setAbsenceDate}
              placeholder="2023-01-01"
              placeholderTextColor="#6D8EB4"
            />

            <View style={styles.checkboxContainer}>
              <Text style={styles.modalLabel}>Justifiée:</Text>
              <TouchableOpacity
                style={[styles.checkbox, absenceJustified && styles.checkboxChecked]}
                onPress={() => setAbsenceJustified(!absenceJustified)}
              >
                {absenceJustified && <Text style={styles.checkboxIcon}>✓</Text>}
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Commentaire:</Text>
            <TextInput
              style={styles.commentInput}
              value={absenceComment}
              onChangeText={setAbsenceComment}
              placeholder="Commentaire (optionnel)"
              placeholderTextColor="#6D8EB4"
              multiline={true}
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#D32F2F" }]}
                onPress={() => setShowAbsenceModal(false)}
              >
                <Text style={styles.buttonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#2E7D32" }]}
                onPress={saveAbsence}
              >
                <Text style={styles.buttonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#0A1F3A",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1A3F6F",
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 10,
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1A3F6F",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFD700",
    elevation: 5,
  },
  glowEffect: {
    position: "absolute",
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "rgba(255, 215, 0, 0.2)",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFD700",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFD700",
    textAlign: "center",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 5,
  },
  subjectList: {
    fontSize: 14,
    color: "#6D8EB4",
    textAlign: "center",
    marginTop: 5,
  },
  filterContainer: {
    marginTop: 15,
    paddingHorizontal: 10,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterPicker: {
    flex: 1,
    marginHorizontal: 5,
  },
  filterLabel: {
    color: "#FFD700",
    fontSize: 12,
    marginBottom: 2,
  },
  picker: {
    backgroundColor: "#1A3F6F",
    color: "#FFFFFF",
    height: 40,
    borderRadius: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A3F6F",
    borderRadius: 10,
    marginTop: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    height: 40,
  },
  tabContainer: {
    flexDirection: "row",
    marginTop: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1A3F6F",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#FFD700",
  },
  tabText: {
    color: "#6D8EB4",
    fontSize: 16,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFD700",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    backgroundColor: "#0A1F3A",
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(26, 63, 111, 0.3)",
    borderRadius: 10,
    paddingVertical: 40,
    marginTop: 20,
  },
  emptyStateText: {
    color: "#6D8EB4",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  studentCard: {
    backgroundColor: "#1A3F6F",
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  studentHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#0A1F3A",
    paddingBottom: 10,
    marginBottom: 10,
  },
  studentName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  studentInfo: {
    color: "#6D8EB4",
    fontSize: 14,
    marginTop: 3,
  },
  addButton: {
    backgroundColor: "#32507B",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 16,
    color: "#e74c3c",
    textAlign: "center",
    margin: 20,
  },
  modalBackgroundRight: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuDrawerRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 270,
    backgroundColor: "#0A1F3A",
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  menuHeader: {
    borderBottomWidth: 2,
    borderBottomColor: "#FFD700",
    paddingBottom: 15,
    marginBottom: 20,
  },
  menuHeaderText: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "bold",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  menuText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1A3F6F",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxWidth: 450,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalTitle: {
    color: "#FFD700",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalSubtitle: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 15,
  },
  modalLabel: {
    color: "#FFD700",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  gradeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  gradeLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    flex: 1,
  },
  gradeInput: {
    backgroundColor: "#32507B",
    borderRadius: 5,
    padding: 10,
    color: "#FFFFFF",
    width: 100,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 100,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  absencePickerContainer: {
    backgroundColor: "#32507B",
    borderRadius: 5,
    marginBottom: 15,
  },
  absencePicker: {
    height: 40,
    color: "#FFFFFF",
  },
  dateInput: {
    backgroundColor: "#32507B",
    borderRadius: 5,
    padding: 10,
    color: "#FFFFFF",
    marginBottom: 15,
  },
  commentInput: {
    backgroundColor: "#32507B",
    borderRadius: 5,
    padding: 10,
    color: "#FFFFFF",
    marginBottom: 15,
    height: 80,
    textAlignVertical: "top",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  checkboxChecked: {
    backgroundColor: "#3498db",
  },
  checkboxIcon: {
    color: "#fff",
    fontWeight: "bold",
  },
});