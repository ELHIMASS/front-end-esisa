import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Icon } from 'react-native-elements';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Audio } from "expo-av";
import * as DocumentPicker from 'expo-document-picker';
import config from '../../config';

// Contextes
import { DarkModeContext } from "../context/DarkModeContext";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../utils/transactions";

// Types
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

type Attachment = {
  uri: string;
  name: string;
  mimeType: string;
};

export default function ProfessorDashboard() {
  // Contextes
  const { darkMode } = useContext(DarkModeContext);
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  // États
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [searchText, setSearchText] = useState('');
  const [currentTab, setCurrentTab] = useState('notes');
  const [loading, setLoading] = useState(true);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [ccGrade, setCcGrade] = useState('');
  const [partielGrade, setPartielGrade] = useState('');
  const [projetGrade, setProjetGrade] = useState('');
  const [absenceDate, setAbsenceDate] = useState(new Date().toISOString().split('T')[0]);
  const [absenceComment, setAbsenceComment] = useState('');
  const [absenceJustified, setAbsenceJustified] = useState(false);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const slideAnim = useState(new Animated.Value(300))[0];

  // Styles dynamiques
  const dynamicStyles = {
    container: darkMode ? styles.darkContainer : styles.lightContainer,
    text: darkMode ? styles.darkText : styles.lightText,
    card: darkMode ? styles.darkCard : styles.lightCard,
    input: darkMode ? styles.darkInput : styles.lightInput,
    button: darkMode ? styles.darkButton : styles.lightButton,
  };

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

        const response = await fetch(`${config.API_URL}/api/students`);
        const data = await response.json();
        setStudents(data);
        setFilteredStudents(data);
        setLoading(false);
      } catch (error) {
        Alert.alert(t.error, t.dataLoadError);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtrage des étudiants
  useEffect(() => {
    let filtered = [...students];

    if (selectedYear) {
      filtered = filtered.filter(student => student.anne_scolaire === selectedYear);
    }

    if (selectedGroup) {
      filtered = filtered.filter(student => student.group === selectedGroup);
    }

    if (searchText) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (student.email && student.email.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    setFilteredStudents(filtered);
  }, [students, selectedYear, selectedGroup, searchText]);

  // Fonctions utilitaires
  const playSound = async (file: any) => {
    try {
      const { sound } = await Audio.Sound.createAsync(file);
      await sound.playAsync();
    } catch (error) {
      console.error("Erreur lors de la lecture du son :", error);
    }
  };

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
      await playSound(require("../../assets/audio/done.mp3"));
      await AsyncStorage.clear();
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      Alert.alert(t.error, t.logoutError);
    }
  };

  const updateStudent = async (email: string, updateData: Partial<Student>) => {
    try {
      const response = await fetch(`${config.API_URL}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...updateData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t.updateFailed);
      }

      const updatedData = await response.json();
      setStudents(students.map(student => student.email === updatedData.email ? updatedData : student));
      return updatedData;
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert(t.error, error.message || t.updateFailed);
      throw error;
    }
  };

  // Gestion des notes
  const handleAddGrade = (student: Student) => {
    setCurrentStudent(student);
    const defaultSubject = user?.matiere?.[0] || '';
    setSelectedSubject(defaultSubject);
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
          { type: "CC", score: parseFloat(ccGrade) || 0, weight: 0.3, date: currentDate },
          { type: "Partiel", score: parseFloat(partielGrade) || 0, weight: 0.4, date: currentDate },
          { type: "Projet", score: parseFloat(projetGrade) || 0, weight: 0.3, date: currentDate }
        ]
      };

      await updateStudent(currentStudent.email, {
        grades: [...(currentStudent.grades || []), newGrade]
      });

      setShowGradeModal(false);
      setCcGrade('');
      setPartielGrade('');
      setProjetGrade('');
      Alert.alert(t.success, t.gradesSaved);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      Alert.alert(t.error, t.gradesSaveFailed);
    }
  };

  // Gestion des absences
  const handleAddAbsence = (student: Student) => {
    setCurrentStudent(student);
    const defaultSubject = user?.matiere?.[0] || '';
    setSelectedSubject(defaultSubject);
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
      Alert.alert(t.success, t.absenceSaved);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      Alert.alert(t.error, t.absenceSaveFailed);
    }
  };

  // Gestion des emails
  const sendEmailToGroupOrYear = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      Alert.alert(t.missingData, t.fillSubjectMessage);
      return;
    }

    if (filteredStudents.length === 0) {
      Alert.alert(t.noRecipients, t.noStudentsFound);
      return;
    }

    if (!user?.matiere) {
      Alert.alert(t.error, t.professorDataError);
      return;
    }

    try {
      setSendingEmail(true);
      await playSound(require("../../assets/audio/done.mp3"));

      const recipients = filteredStudents.map((s) => s.email).filter(Boolean);
      
      if (recipients.length === 0) {
        Alert.alert(t.error, t.noValidEmails);
        return;
      }

      const formData = new FormData();
      formData.append("subject", emailSubject);
      formData.append("message", emailMessage);
      formData.append("recipients", JSON.stringify(recipients));

      attachments.forEach(file => {
        formData.append("attachments", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType
        } as any);
      });

      const response = await fetch(`${config.API_URL}/send-email`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error(await response.text());

      await playSound(require("../../assets/audio/done.mp3"));
      Alert.alert(t.success, `${t.emailSentTo} ${recipients.length} ${t.students}`);

      setShowEmailModal(false);
      setEmailSubject('');
      setEmailMessage('');
      setAttachments([]);
    } catch (err) {
      Alert.alert(t.error, err.message || t.sendingFailed);
    } finally {
      setSendingEmail(false);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets) {
        const files = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType || 'application/octet-stream'
        }));
        setAttachments(prev => [...prev, ...files]);
      }
    } catch (error) {
      console.error("Erreur lors de la sélection du document:", error);
    }
  };

  // Utilitaires
  const getAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    return `${year}-${year + 1}`;
  };

  const getCurrentSemester = () => {
    const month = new Date().getMonth();
    return month >= 8 ? "S1" : "S2";
  };

  const getFilterDescription = () => {
    if (selectedYear && selectedGroup) return `${selectedYear} - ${t.group} ${selectedGroup}`;
    if (selectedYear) return selectedYear;
    if (selectedGroup) return `${t.group} ${selectedGroup}`;
    return t.allStudents;
  };

  // Rendu conditionnel
  if (loading) {
    return (
      <View style={[styles.center, dynamicStyles.container]}>
        <ActivityIndicator size="large" color={darkMode ? "#FFD700" : "#0A1F3A"} />
      </View>
    );
  }

  if (!user?.matiere?.length) {
    return (
      <View style={[styles.center, dynamicStyles.container]}>
        <Text style={[styles.errorText, { color: darkMode ? "#FFD700" : "#D32F2F" }]}>
          {t.noSubjectAssigned}
        </Text>
      </View>
    );
  }

  // Composants réutilisables
  const renderPickers = () => (
    <View style={styles.filterRow}>
      <View style={styles.filterPicker}>
        <Text style={[styles.filterLabel, dynamicStyles.text]}>
          {t.year}:
        </Text>
        <TouchableOpacity
          style={[styles.iosPickerButton, dynamicStyles.card]}
          onPress={() => setShowYearModal(true)}
        >
          <Text style={[styles.iosPickerText, dynamicStyles.text]}>
            {selectedYear || t.allYears}
          </Text>
          <Icon name="arrow-drop-down" size={20} color={darkMode ? "#FFD700" : "#0A1F3A"} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterPicker}>
        <Text style={[styles.filterLabel, dynamicStyles.text]}>
          {t.group}:
        </Text>
        <TouchableOpacity
          style={[styles.iosPickerButton, dynamicStyles.card]}
          onPress={() => setShowGroupModal(true)}
        >
          <Text style={[styles.iosPickerText, dynamicStyles.text]}>
            {selectedGroup ? `${t.group} ${selectedGroup}` : t.allGroups}
          </Text>
          <Icon name="arrow-drop-down" size={20} color={darkMode ? "#FFD700" : "#0A1F3A"} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Rendu principal
  return (
    <SafeAreaView style={[styles.flex1, dynamicStyles.container]}>
      {/* Menu Button */}
      <TouchableOpacity
        onPress={toggleMenu}
        style={[styles.menuButton, { 
          top: insets.top + 10,
          backgroundColor: darkMode ? "#1A3F6F" : "#E3F2FD",
          shadowColor: darkMode ? "#FFD700" : "#000"
        }]}
      >
        <Icon name="menu" size={30} color={darkMode ? "#FFD700" : "#0A1F3A"} />
      </TouchableOpacity>

      {/* Drawer Menu */}
      <Modal visible={isMenuVisible} transparent animationType="none" onRequestClose={toggleMenu}>
        <Pressable style={styles.modalBackgroundRight} onPress={toggleMenu}>
          <Animated.View style={[
            styles.menuDrawerRight, 
            { 
              transform: [{ translateX: slideAnim }],
              backgroundColor: darkMode ? "#0A1F3A" : "#FFFFFF"
            }
          ]}>
            <View style={[styles.menuHeader, { borderBottomColor: darkMode ? "#FFD700" : "#0A1F3A" }]}>
              <Text style={[styles.menuHeaderText, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
                {t.professorMenu}
              </Text>
            </View>

            {[
              { label: `🏠 ${t.home}`, route: "/(tabs)/index" },
              { label: `📊 ${t.dashboard}`, route: "#" },
              { label: `📝 ${t.profile}`, route: "#" },
              { label: `⚙️ ${t.settings}`, route: "/Settings" },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => {
                  toggleMenu();
                  if (item.route !== "#") router.push(item.route);
                }}
              >
                <Text style={[styles.menuText, dynamicStyles.text]}>{item.label}</Text>
                <Icon name="chevron-right" size={20} color={darkMode ? "#FFD700" : "#0A1F3A"} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: darkMode ? "#1A3F6F" : "#E0E0E0" }]}
              onPress={handleLogout}
            >
              <Text style={[styles.menuText, { color: "#FF5555" }]}>
                🚪 {t.logout}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Main Content */}
      <View style={[styles.header, dynamicStyles.container]}>
        <View style={styles.avatarContainer}>
          <View style={[
            styles.avatar, 
            { 
              backgroundColor: darkMode ? "#1A3F6F" : "#E3F2FD",
              borderColor: darkMode ? "#FFD700" : "#0A1F3A"
            }
          ]}>
            <Text style={[styles.avatarText, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
              {user?.name?.split(' ')
                .filter((item) => item.length > 1)
                .map((item) => item[0].toUpperCase())
                .join('')}
            </Text>
          </View>
          <View style={[styles.glowEffect, { backgroundColor: darkMode ? "rgba(255, 215, 0, 0.2)" : "rgba(10, 31, 58, 0.2)" }]} />
        </View>

        <Text style={[styles.title, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
          {t.professorSpace}
        </Text>
        <Text style={[styles.subtitle, dynamicStyles.text]}>
          {user?.name}
        </Text>
        <Text style={[styles.subjectList, { color: darkMode ? "#6D8EB4" : "#666666" }]}>
          {user?.matiere?.join(' • ') || t.noSubjectAssigned}
        </Text>

        {renderPickers()}

        <View style={[styles.searchContainer, dynamicStyles.card]}>
          <Icon name="search" size={20} color={darkMode ? "#FFD700" : "#0A1F3A"} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, dynamicStyles.text]}
            placeholder={t.searchStudent}
            placeholderTextColor={darkMode ? "#6D8EB4" : "#999999"}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.emailButton, dynamicStyles.card]}
          onPress={() => setShowEmailModal(true)}
        >
          <Icon name="email" size={18} color={darkMode ? "#FFD700" : "#0A1F3A"} style={styles.emailIcon} />
          <Text style={[styles.emailButtonText, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
            {t.sendEmailToFiltered}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { borderBottomColor: darkMode ? "#1A3F6F" : "#E0E0E0" }]}>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'notes' && styles.activeTab]}
          onPress={() => setCurrentTab('notes')}
        >
          <Text style={[
            styles.tabText, 
            { color: darkMode ? "#6D8EB4" : "#666666" },
            currentTab === 'notes' && { color: darkMode ? "#FFD700" : "#0A1F3A", fontWeight: "bold" }
          ]}>
            {t.grades}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, currentTab === 'absences' && styles.activeTab]}
          onPress={() => setCurrentTab('absences')}
        >
          <Text style={[
            styles.tabText,
            { color: darkMode ? "#6D8EB4" : "#666666" },
            currentTab === 'absences' && { color: darkMode ? "#FFD700" : "#0A1F3A", fontWeight: "bold" }
          ]}>
            {t.absences}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Students List */}
      <ScrollView style={[styles.content, dynamicStyles.container]}>
        {filteredStudents.length === 0 ? (
          <View style={[
            styles.emptyState, 
            { backgroundColor: darkMode ? "rgba(26, 63, 111, 0.3)" : "rgba(227, 242, 253, 0.5)" }
          ]}>
            <Icon name="school" size={50} color={darkMode ? "#1A3F6F" : "#0A1F3A"} />
            <Text style={[styles.emptyStateText, { color: darkMode ? "#6D8EB4" : "#666666" }]}>
              {selectedYear || selectedGroup || searchText
                ? t.noStudentsMatchCriteria
                : t.noStudentsAvailable}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Text style={[styles.resultsText, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
                {filteredStudents.length} {t.student}{filteredStudents.length > 1 ? 's' : ''} {t.found}{filteredStudents.length > 1 ? 's' : ''}
              </Text>
            </View>
            
            {filteredStudents.map((student) => (
              <View key={student._id} style={[styles.studentRow, dynamicStyles.card]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.studentRowName, dynamicStyles.text]}>
                    {student.name}
                  </Text>
                  <Text style={[styles.studentRowInfo, { color: darkMode ? "#6D8EB4" : "#666666" }]}>
                    {student.anne_scolaire} - {t.group} {student.group}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => currentTab === 'notes' ? handleAddGrade(student) : handleAddAbsence(student)}
                  style={[styles.iconActionButton, { backgroundColor: darkMode ? "#0A1F3A" : "#E3F2FD" }]}
                >
                  <Icon
                    name={currentTab === 'notes' ? 'edit' : 'event-busy'}
                    type="material"
                    color={darkMode ? "#FFD700" : "#0A1F3A"}
                    size={26}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Grade Modal */}
      <Modal visible={showGradeModal} transparent animationType="fade" onRequestClose={() => setShowGradeModal(false)}>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, dynamicStyles.card]}>
            <Text style={[styles.modalTitle, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
              {currentStudent?.name || t.student}
            </Text>

            <Text style={[styles.modalSubtitle, dynamicStyles.text]}>
              {t.group} {currentStudent?.group || "-"} - {currentStudent?.anne_scolaire || "-"}
            </Text>

            <Text style={[styles.modalLabel, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
              {t.subject}:
            </Text>
            <View style={[styles.absencePickerContainer, dynamicStyles.input]}>
              <Picker
                selectedValue={selectedSubject}
                style={[styles.absencePicker, dynamicStyles.text]}
                dropdownIconColor={darkMode ? "#FFD700" : "#0A1F3A"}
                onValueChange={setSelectedSubject}
              >
                {user?.matiere?.map((subject, index) => (
                  <Picker.Item key={index} label={subject} value={subject} color={darkMode ? "#FFF" : "#000"} />
                ))}
              </Picker>
            </View>

            <View style={styles.gradeInputContainer}>
              <Text style={[styles.gradeLabel, dynamicStyles.text]}>
                {t.continuousAssessment}:
              </Text>
              <TextInput
                style={[styles.gradeInput, dynamicStyles.input]}
                value={ccGrade}
                onChangeText={setCcGrade}
                placeholder={`${t.grade}/20`}
                keyboardType="numeric"
                placeholderTextColor={darkMode ? "#6D8EB4" : "#999999"}
              />
            </View>

            <View style={styles.gradeInputContainer}>
              <Text style={[styles.gradeLabel, dynamicStyles.text]}>
                {t.exam}:
              </Text>
              <TextInput
                style={[styles.gradeInput, dynamicStyles.input]}
                value={partielGrade}
                onChangeText={setPartielGrade}
                placeholder={`${t.grade}/20`}
                keyboardType="numeric"
                placeholderTextColor={darkMode ? "#6D8EB4" : "#999999"}
              />
            </View>

            <View style={styles.gradeInputContainer}>
              <Text style={[styles.gradeLabel, dynamicStyles.text]}>
                {t.project}:
              </Text>
              <TextInput
                style={[styles.gradeInput, dynamicStyles.input]}
                value={projetGrade}
                onChangeText={setProjetGrade}
                placeholder={`${t.grade}/20`}
                keyboardType="numeric"
                placeholderTextColor={darkMode ? "#6D8EB4" : "#999999"}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#D32F2F" }]}
                onPress={() => setShowGradeModal(false)}
              >
                <Text style={styles.buttonText}>{t.cancel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#2E7D32" }]}
                onPress={saveGrade}
              >
                <Text style={styles.buttonText}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Absence Modal */}
      <Modal visible={showAbsenceModal} transparent animationType="fade" onRequestClose={() => setShowAbsenceModal(false)}>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, dynamicStyles.card]}>
            <Text style={[styles.modalTitle, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
              {t.addAbsence}
            </Text>

            <Text style={[styles.modalSubtitle, dynamicStyles.text]}>
              {currentStudent?.name || t.student} - {t.group} {currentStudent?.group || "-"}
            </Text>

            <Text style={[styles.modalLabel, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
              {t.subject}:
            </Text>
            <View style={[styles.absencePickerContainer, dynamicStyles.input]}>
              <Picker
                selectedValue={selectedSubject}
                style={[styles.absencePicker, dynamicStyles.text]}
                dropdownIconColor={darkMode ? "#FFD700" : "#0A1F3A"}
                onValueChange={setSelectedSubject}
              >
                {user?.matiere?.map((subject, index) => (
                  <Picker.Item key={index} label={subject} value={subject} color={darkMode ? "#FFF" : "#000"} />
                ))}
              </Picker>
            </View>

            <Text style={[styles.modalLabel, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
              {t.date} (AAAA-MM-JJ):
            </Text>
            <TextInput
              style={[styles.dateInput, dynamicStyles.input]}
              value={absenceDate}
              onChangeText={setAbsenceDate}
              placeholder="2023-01-01"
              placeholderTextColor={darkMode ? "#6D8EB4" : "#999999"}
            />

            <View style={styles.checkboxContainer}>
              <Text style={[styles.modalLabel, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
                {t.justified}:
              </Text>
              <TouchableOpacity
                style={[
                  styles.checkbox, 
                  absenceJustified && styles.checkboxChecked,
                  { borderColor: darkMode ? "#FFD700" : "#0A1F3A" }
                ]}
                onPress={() => setAbsenceJustified(!absenceJustified)}
              >
                {absenceJustified && <Text style={styles.checkboxIcon}>✓</Text>}
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalLabel, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
              {t.comment}:
            </Text>
            <TextInput
              style={[styles.commentInput, dynamicStyles.input]}
              value={absenceComment}
              onChangeText={setAbsenceComment}
              placeholder={`${t.comment} (${t.optional})`}
              placeholderTextColor={darkMode ? "#6D8EB4" : "#999999"}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#D32F2F" }]}
                onPress={() => setShowAbsenceModal(false)}
              >
                <Text style={styles.buttonText}>{t.cancel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#2E7D32" }]}
                onPress={saveAbsence}
              >
                <Text style={styles.buttonText}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Email Modal */}
      <Modal visible={showEmailModal} transparent animationType="fade" onRequestClose={() => !sendingEmail && setShowEmailModal(false)}>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, dynamicStyles.card]}>
            <Text style={[styles.modalTitle, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
              {t.sendEmail}
            </Text>

            <Text style={[styles.modalSubtitle, dynamicStyles.text]}>
              {t.recipients}: {getFilterDescription()} ({filteredStudents.length} {t.student}{filteredStudents.length > 1 ? 's' : ''})
            </Text>

            <Text style={[styles.modalLabel, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
              {t.subject}:
            </Text>
            <TextInput
              style={[styles.dateInput, dynamicStyles.input]}
              value={emailSubject}
              onChangeText={setEmailSubject}
              placeholder={t.emailSubjectPlaceholder}
              placeholderTextColor={darkMode ? "#6D8EB4" : "#999999"}
              editable={!sendingEmail}
            />

            <Text style={[styles.modalLabel, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
              {t.message}:
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={[styles.commentInput, dynamicStyles.input, { height: 120 }]}
                value={emailMessage}
                onChangeText={setEmailMessage}
                placeholder={t.emailMessagePlaceholder}
                placeholderTextColor={darkMode ? "#6D8EB4" : "#999999"}
                multiline
                numberOfLines={6}
                editable={!sendingEmail}
              />
              <TouchableOpacity
                onPress={pickDocument}
                style={[
                  styles.attachmentButton,
                  { backgroundColor: darkMode ? "#1A3F6F" : "#E3F2FD" }
                ]}
              >
                <Text style={{ fontSize: 18 }}>📁</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalLabel, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
              {t.attachments}:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
              {attachments.map((file, index) => (
                <View key={file.uri + index} style={{ marginRight: 8 }}>
                  <Text style={{ fontSize: 24 }}>📎 {file.name}</Text>
                </View>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  { backgroundColor: "#D32F2F", opacity: sendingEmail ? 0.5 : 1 }
                ]}
                onPress={() => !sendingEmail && setShowEmailModal(false)}
                disabled={sendingEmail}
              >
                <Text style={styles.buttonText}>{t.cancel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  { backgroundColor: "#2E7D32", opacity: sendingEmail ? 0.5 : 1 }
                ]}
                onPress={sendEmailToGroupOrYear}
                disabled={sendingEmail}
              >
                {sendingEmail ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>{t.send}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Year Selection Modal */}
      <Modal visible={showYearModal} transparent animationType="slide" onRequestClose={() => setShowYearModal(false)}>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, dynamicStyles.card]}>
            <Text style={[styles.modalTitle, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
              {t.selectYear}
            </Text>
            {["1ère année", "2ème année", "3ème année", "4ème année", "5ème année", ""].map((year, index) => (
              <TouchableOpacity
                key={year || index}
                style={[styles.modalButton, dynamicStyles.button]}
                onPress={() => {
                  setSelectedYear(year);
                  setShowYearModal(false);
                }}
              >
                <Text style={styles.buttonText}>
                  {year === "" ? t.allYears : year}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Group Selection Modal */}
      <Modal visible={showGroupModal} transparent animationType="slide" onRequestClose={() => setShowGroupModal(false)}>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, dynamicStyles.card]}>
            <Text style={[styles.modalTitle, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
              {t.selectGroup}
            </Text>
            {["A", "B", "C", ""].map((group, index) => (
              <TouchableOpacity
                key={group || index}
                style={[styles.modalButton, dynamicStyles.button]}
                onPress={() => {
                  setSelectedGroup(group);
                  setShowGroupModal(false);
                }}
              >
                <Text style={styles.buttonText}>
                  {group === "" ? t.allGroups : `${t.group} ${group}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  darkContainer: {
    backgroundColor: "#0A1F3A",
  },
  lightContainer: {
    backgroundColor: "#FFFFFF",
  },
  darkCard: {
    backgroundColor: "#1A3F6F",
  },
  lightCard: {
    backgroundColor: "#F5F5F5",
  },
  darkText: {
    color: "#FFFFFF",
  },
  lightText: {
    color: "#000000",
  },
  darkInput: {
    backgroundColor: "#32507B",
    color: "#FFFFFF",
  },
  lightInput: {
    backgroundColor: "#FFFFFF",
    color: "#000000",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  darkButton: {
    backgroundColor: "#1A3F6F",
  },
  lightButton: {
    backgroundColor: "#E3F2FD",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
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
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    elevation: 5,
  },
  glowEffect: {
    position: "absolute",
    width: 86,
    height: 86,
    borderRadius: 43,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 5,
  },
  subjectList: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginTop: 15,
  },
  filterPicker: {
    flex: 1,
  },
  filterLabel: {
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "600",
  },
  iosPickerButton: {
    borderRadius: 10,
    height: 40,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iosPickerText: {
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    fontSize: 14,
    height: 40,
  },
  emailButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
  },
  emailIcon: {
    marginRight: 8,
  },
  emailButtonText: {
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    marginTop: 15,
    borderBottomWidth: 1,
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
    fontSize: 16,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  resultsHeader: {
    marginBottom: 10,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 40,
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  studentRowName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentRowInfo: {
    fontSize: 13,
    marginTop: 4,
  },
  iconActionButton: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    position: "absolute",
    right: 20,
    zIndex: 1,
    borderRadius: 20,
    padding: 10,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 20,
  },
  modalContent: {
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxWidth: 450,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 15,
  },
  modalLabel: {
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
    fontSize: 16,
    flex: 1,
  },
  gradeInput: {
    borderRadius: 5,
    padding: 10,
    width: 100,
    textAlign: "center",
  },
  dateInput: {
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  commentInput: {
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
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
    borderRadius: 5,
    marginBottom: 15,
    overflow: 'hidden',
  },
  absencePicker: {
    height: 40,
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
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  menuHeader: {
    borderBottomWidth: 2,
    paddingBottom: 15,
    marginBottom: 20,
  },
  menuHeaderText: {
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
    fontSize: 16,
  },
  attachmentButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    borderRadius: 20,
    width: 36,
    height: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    margin: 20,
  },
});