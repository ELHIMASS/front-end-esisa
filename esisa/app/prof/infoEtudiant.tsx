import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  Animated,
  Pressable,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
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

export default function StudentsOverview() {
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
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  
  // États pour les modales
  const [showYearModal, setShowYearModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  const router = useRouter();

  // Définition des années académiques
  const academicYears = [
    { value: '1ère année', label: '1ère année' },
    { value: '2ème année', label: '2ème année' },
    { value: '3ème année', label: '3ème année' },
    { value: '4ème année', label: '4ème année' },
    { value: '5ème année', label: '5ème année' }
  ];

  // Styles dynamiques
  const dynamicStyles = {
    container: darkMode ? styles.darkContainer : styles.lightContainer,
    text: darkMode ? styles.darkText : styles.lightText,
    card: darkMode ? styles.darkCard : styles.lightCard,
    input: darkMode ? styles.darkInput : styles.lightInput,
    accent: darkMode ? "#FFD700" : "#0A1F3A",
    secondary: darkMode ? "#6D8EB4" : "#666666",
    modalBackground: darkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)',
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
        setSelectedSubject(parsedUser.matiere?.[0] || '');

        const response = await fetch(`${config.API_URL}/api/students`);
        const data = await response.json();
        setStudents(data);
        setFilteredStudents(data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur de chargement:', error);
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
        student.email.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  }, [students, selectedYear, selectedGroup, searchText]);

  // Calcul de la moyenne
  const calculateAverage = (grades: Grade[], subject: string) => {
    const subjectGrades = grades.filter(grade => grade.subject === subject);
    if (subjectGrades.length === 0) return null;

    let total = 0;
    let totalWeight = 0;

    subjectGrades.forEach(grade => {
      grade.evaluations.forEach(evaluation => {
        total += evaluation.score * evaluation.weight;
        totalWeight += evaluation.weight;
      });
    });

    return totalWeight > 0 ? (total / totalWeight).toFixed(2) : null;
  };

  // Obtenir les années uniques depuis les données (pour filtrer selon les vraies années)
  const getUniqueYears = () => {
    return [...new Set(students.map(student => student.anne_scolaire))].sort();
  };

  // Obtenir les groupes uniques
  const getUniqueGroups = () => {
    return [...new Set(students.map(student => student.group))].sort();
  };

  // Obtenir le label de l'année
  const getYearLabel = (year: string) => {
    const academicYear = academicYears.find(ay => ay.value === year);
    return academicYear ? academicYear.label : year;
  };

  // Obtenir les absences pour une matière
  const getAbsencesForSubject = (absences: Absence[], subject: string) => {
    return absences?.filter(absence => absence.subject === subject) || [];
  };

  // Compter les absences injustifiées
  const getUnjustifiedAbsences = (absences: Absence[], subject: string) => {
    return getAbsencesForSubject(absences, subject).filter(absence => !absence.justified).length;
  };

  // Toggle expansion des cartes
  const toggleCardExpansion = (studentId: string) => {
    setExpandedCard(expandedCard === studentId ? null : studentId);
  };

  // Sélectionner une année
  const selectYear = (year: string) => {
    setSelectedYear(year);
    setShowYearModal(false);
  };

  // Sélectionner un groupe
  const selectGroup = (group: string) => {
    setSelectedGroup(group);
    setShowGroupModal(false);
  };

  // Sélectionner une matière
  const selectSubject = (subject: string) => {
    setSelectedSubject(subject);
    setShowSubjectModal(false);
  };

  // Rendu de la modale de sélection d'année
  const renderYearModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showYearModal}
      onRequestClose={() => setShowYearModal(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: dynamicStyles.modalBackground }]}>
        <View style={[styles.modalContainer, dynamicStyles.card]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: dynamicStyles.accent }]}>
              Sélectionner l'année
            </Text>
            <TouchableOpacity
              onPress={() => setShowYearModal(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color={dynamicStyles.accent} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <TouchableOpacity
              style={[
                styles.modalOption,
                selectedYear === '' && styles.selectedOption,
                { borderColor: dynamicStyles.accent }
              ]}
              onPress={() => selectYear('')}
            >
              <Text style={[
                styles.modalOptionText,
                dynamicStyles.text,
                selectedYear === '' && { color: dynamicStyles.accent }
              ]}>
                Toutes les années
              </Text>
              {selectedYear === '' && (
                <Icon name="check" size={20} color={dynamicStyles.accent} />
              )}
            </TouchableOpacity>
            
            {academicYears.map((year) => (
              <TouchableOpacity
                key={year.value}
                style={[
                  styles.modalOption,
                  selectedYear === year.value && styles.selectedOption,
                  { borderColor: dynamicStyles.accent }
                ]}
                onPress={() => selectYear(year.value)}
              >
                <Text style={[
                  styles.modalOptionText,
                  dynamicStyles.text,
                  selectedYear === year.value && { color: dynamicStyles.accent }
                ]}>
                  {year.label}
                </Text>
                {selectedYear === year.value && (
                  <Icon name="check" size={20} color={dynamicStyles.accent} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Rendu de la modale de sélection de groupe
  const renderGroupModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showGroupModal}
      onRequestClose={() => setShowGroupModal(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: dynamicStyles.modalBackground }]}>
        <View style={[styles.modalContainer, dynamicStyles.card]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: dynamicStyles.accent }]}>
              Sélectionner le groupe
            </Text>
            <TouchableOpacity
              onPress={() => setShowGroupModal(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color={dynamicStyles.accent} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <TouchableOpacity
              style={[
                styles.modalOption,
                selectedGroup === '' && styles.selectedOption,
                { borderColor: dynamicStyles.accent }
              ]}
              onPress={() => selectGroup('')}
            >
              <Text style={[
                styles.modalOptionText,
                dynamicStyles.text,
                selectedGroup === '' && { color: dynamicStyles.accent }
              ]}>
                Tous les groupes
              </Text>
              {selectedGroup === '' && (
                <Icon name="check" size={20} color={dynamicStyles.accent} />
              )}
            </TouchableOpacity>
            
            {getUniqueGroups().map((group) => (
              <TouchableOpacity
                key={group}
                style={[
                  styles.modalOption,
                  selectedGroup === group && styles.selectedOption,
                  { borderColor: dynamicStyles.accent }
                ]}
                onPress={() => selectGroup(group)}
              >
                <Text style={[
                  styles.modalOptionText,
                  dynamicStyles.text,
                  selectedGroup === group && { color: dynamicStyles.accent }
                ]}>
                  Groupe {group}
                </Text>
                {selectedGroup === group && (
                  <Icon name="check" size={20} color={dynamicStyles.accent} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Rendu de la modale de sélection de matière
  const renderSubjectModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showSubjectModal}
      onRequestClose={() => setShowSubjectModal(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: dynamicStyles.modalBackground }]}>
        <View style={[styles.modalContainer, dynamicStyles.card]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: dynamicStyles.accent }]}>
              Sélectionner la matière
            </Text>
            <TouchableOpacity
              onPress={() => setShowSubjectModal(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color={dynamicStyles.accent} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {user?.matiere?.map((subject) => (
              <TouchableOpacity
                key={subject}
                style={[
                  styles.modalOption,
                  selectedSubject === subject && styles.selectedOption,
                  { borderColor: dynamicStyles.accent }
                ]}
                onPress={() => selectSubject(subject)}
              >
                <Text style={[
                  styles.modalOptionText,
                  dynamicStyles.text,
                  selectedSubject === subject && { color: dynamicStyles.accent }
                ]}>
                  {subject}
                </Text>
                {selectedSubject === subject && (
                  <Icon name="check" size={20} color={dynamicStyles.accent} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Rendu des filtres
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filterRow}>
        {/* Sélecteur d'année */}
        <View style={styles.filterItem}>
          <Text style={[styles.filterLabel, { color: dynamicStyles.accent }]}>
            Année:
          </Text>
          <TouchableOpacity
            style={[styles.filterSelector, dynamicStyles.card]}
            onPress={() => setShowYearModal(true)}
          >
            <Text style={[styles.filterSelectorText, dynamicStyles.text]}>
              {selectedYear ? getYearLabel(selectedYear) : 'Toutes les années'}
            </Text>
            <Icon name="keyboard-arrow-down" size={24} color={dynamicStyles.accent} />
          </TouchableOpacity>
        </View>

        {/* Sélecteur de groupe */}
        <View style={styles.filterItem}>
          <Text style={[styles.filterLabel, { color: dynamicStyles.accent }]}>
            Groupe:
          </Text>
          <TouchableOpacity
            style={[styles.filterSelector, dynamicStyles.card]}
            onPress={() => setShowGroupModal(true)}
          >
            <Text style={[styles.filterSelectorText, dynamicStyles.text]}>
              {selectedGroup ? `Groupe ${selectedGroup}` : 'Tous les groupes'}
            </Text>
            <Icon name="keyboard-arrow-down" size={24} color={dynamicStyles.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sélecteur de matière */}
      <View style={styles.filterItem}>
        <Text style={[styles.filterLabel, { color: dynamicStyles.accent }]}>
          {t.subject || 'Matière'}:
        </Text>
        <TouchableOpacity
          style={[styles.filterSelector, dynamicStyles.card]}
          onPress={() => setShowSubjectModal(true)}
        >
          <Text style={[styles.filterSelectorText, dynamicStyles.text]}>
            {selectedSubject || 'Sélectionner une matière'}
          </Text>
          <Icon name="keyboard-arrow-down" size={24} color={dynamicStyles.accent} />
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={[styles.searchContainer, dynamicStyles.card]}>
        <Icon name="search" size={20} color={dynamicStyles.accent} />
        <TextInput
          style={[styles.searchInput, dynamicStyles.text]}
          placeholder={t.searchStudent || 'Rechercher un étudiant...'}
          placeholderTextColor={dynamicStyles.secondary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
    </View>
  );

  // Rendu d'une carte étudiant
  const renderStudentCard = ({ item: student }) => {
    const isExpanded = expandedCard === student._id;
    const average = selectedSubject && student.grades 
      ? calculateAverage(student.grades, selectedSubject) 
      : null;
    const subjectAbsences = getAbsencesForSubject(student.absences || [], selectedSubject);
    const unjustifiedCount = getUnjustifiedAbsences(student.absences || [], selectedSubject);

    return (
      <Animated.View style={[styles.studentCard, dynamicStyles.card]}>
        {/* En-tête de la carte */}
        <TouchableOpacity 
          style={styles.cardHeader}
          onPress={() => toggleCardExpansion(student._id)}
          activeOpacity={0.7}
        >
          <View style={styles.studentInfo}>
            <View style={[styles.avatar, { backgroundColor: dynamicStyles.accent + '20' }]}>
              <Text style={[styles.avatarText, { color: dynamicStyles.accent }]}>
                {student.name.split(' ')
                  .filter(word => word.length > 1)
                  .map(word => word[0].toUpperCase())
                  .join('')}
              </Text>
            </View>
            
            <View style={styles.studentDetails}>
              <Text style={[styles.studentName, dynamicStyles.text]}>
                {student.name}
              </Text>
              <Text style={[styles.studentEmail, { color: dynamicStyles.secondary }]}>
                {student.email}
              </Text>
              <Text style={[styles.studentGroup, { color: dynamicStyles.secondary }]}>
                {getYearLabel(student.anne_scolaire)} • Groupe {student.group}
              </Text>
            </View>
          </View>

          <View style={styles.cardActions}>
            {/* Indicateurs rapides */}
            <View style={styles.indicators}>
              {average && (
                <View style={[
                  styles.gradeIndicator, 
                  { backgroundColor: parseFloat(average) >= 10 ? '#4CAF50' : '#F44336' }
                ]}>
                  <Text style={styles.indicatorText}>{average}/20</Text>
                </View>
              )}
              
              {unjustifiedCount > 0 && (
                <View style={[styles.absenceIndicator, { backgroundColor: '#FF9800' }]}>
                  <Text style={styles.indicatorText}>{unjustifiedCount} abs</Text>
                </View>
              )}
            </View>

            <Icon 
              name={isExpanded ? "expand-less" : "expand-more"} 
              size={24} 
              color={dynamicStyles.accent} 
            />
          </View>
        </TouchableOpacity>

        {/* Contenu développé */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Section Notes */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: dynamicStyles.accent }]}>
                📊 {t.grades || 'Notes'} - {selectedSubject}
              </Text>
              
              {student.grades?.filter(grade => grade.subject === selectedSubject).length > 0 ? (
                <View style={styles.gradesContainer}>
                  {student.grades
                    .filter(grade => grade.subject === selectedSubject)
                    .map((grade, gradeIndex) => (
                      <View key={gradeIndex} style={[styles.gradeCard, dynamicStyles.card]}>
                        <Text style={[styles.gradeCardTitle, dynamicStyles.text]}>
                          {grade.semester} - {grade.academicYear}
                        </Text>
                        {grade.evaluations.map((evaluation, evalIndex) => (
                          <View key={evalIndex} style={styles.evaluationRow}>
                            <View style={styles.evaluationInfo}>
                              <Text style={[styles.evaluationType, dynamicStyles.text]}>
                                {evaluation.type}
                              </Text>
                              <Text style={[styles.evaluationWeight, { color: dynamicStyles.secondary }]}>
                                ({(evaluation.weight * 100)}%)
                              </Text>
                            </View>
                            <View style={[
                              styles.scoreContainer,
                              { backgroundColor: evaluation.score >= 10 ? '#E8F5E8' : '#FFEBEE' }
                            ]}>
                              <Text style={[
                                styles.scoreText,
                                { color: evaluation.score >= 10 ? '#2E7D32' : '#C62828' }
                              ]}>
                                {evaluation.score}/20
                              </Text>
                            </View>
                          </View>
                        ))}
                        {average && (
                          <View style={styles.averageRow}>
                            <Text style={[styles.averageLabel, { color: dynamicStyles.accent }]}>
                              {t.average || 'Moyenne'}: 
                            </Text>
                            <Text style={[
                              styles.averageValue, 
                              { color: parseFloat(average) >= 10 ? '#2E7D32' : '#C62828' }
                            ]}>
                              {average}/20
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: dynamicStyles.secondary }]}>
                    {t.noGradesFound || 'Aucune note trouvée pour cette matière'}
                  </Text>
                </View>
              )}
            </View>

            {/* Section Absences */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: dynamicStyles.accent }]}>
                📅 {t.absences || 'Absences'} - {selectedSubject}
              </Text>
              
              {subjectAbsences.length > 0 ? (
                <View style={styles.absencesContainer}>
                  <View style={styles.absenceSummary}>
                    <Text style={[styles.summaryText, dynamicStyles.text]}>
                      Total: {subjectAbsences.length} absence{subjectAbsences.length > 1 ? 's' : ''}
                    </Text>
                    {unjustifiedCount > 0 && (
                      <Text style={[styles.summaryText, { color: '#F44336' }]}>
                        {unjustifiedCount} non justifiée{unjustifiedCount > 1 ? 's' : ''}
                      </Text>
                    )}
                  </View>
                  
                  {subjectAbsences.map((absence, absenceIndex) => (
                    <View key={absenceIndex} style={[styles.absenceCard, dynamicStyles.card]}>
                      <View style={styles.absenceHeader}>
                        <Text style={[styles.absenceDate, dynamicStyles.text]}>
                          {new Date(absence.date).toLocaleDateString('fr-FR')}
                        </Text>
                        <View style={[
                          styles.justifiedBadge,
                          { 
                            backgroundColor: absence.justified 
                              ? (darkMode ? '#2E7D32' : '#C8E6C9')
                              : (darkMode ? '#D32F2F' : '#FFCDD2')
                          }
                        ]}>
                          <Text style={[
                            styles.justifiedText,
                            { color: darkMode ? '#FFFFFF' : '#000000' }
                          ]}>
                            {absence.justified 
                              ? (t.justified || 'Justifiée') 
                              : (t.unjustified || 'Non justifiée')}
                          </Text>
                        </View>
                      </View>
                      {absence.comment && (
                        <Text style={[styles.absenceComment, { color: dynamicStyles.secondary }]}>
                          💬 {absence.comment}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: dynamicStyles.secondary }]}>
                    {t.noAbsencesFound || 'Aucune absence trouvée pour cette matière'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  // Rendu conditionnel
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, dynamicStyles.container]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={dynamicStyles.accent} />
          <Text style={[styles.loadingText, dynamicStyles.text]}>
            {t.loading || 'Chargement...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={dynamicStyles.accent} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: dynamicStyles.accent }]}>
            {t.studentsOverview || 'Vue d\'ensemble des étudiants'}
          </Text>
          <Text style={[styles.headerSubtitle, { color: dynamicStyles.secondary }]}>
            {user?.name} • {user?.matiere?.join(', ')}
          </Text>
        </View>
      </View>

      {/* Filtres */}
      {renderFilters()}

      {/* Modales */}
      {renderYearModal()}
      {renderGroupModal()}
      {renderSubjectModal()}

      {/* Statistiques */}
      <View style={[styles.statsContainer, dynamicStyles.card]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: dynamicStyles.accent }]}>
            {filteredStudents.length}
          </Text>
          <Text style={[styles.statLabel, { color: dynamicStyles.secondary }]}>
            {t.students || 'Étudiants'}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
            {filteredStudents.filter(student => {
              const avg = selectedSubject && student.grades 
                ? calculateAverage(student.grades, selectedSubject) 
                : null;
              return avg && parseFloat(avg) >= 10;
            }).length}
          </Text>
          <Text style={[styles.statLabel, { color: dynamicStyles.secondary }]}>
            {t.passing || 'Réussite'}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#F44336' }]}>
            {filteredStudents.filter(student => 
              getUnjustifiedAbsences(student.absences || [], selectedSubject) > 0
            ).length}
          </Text>
          <Text style={[styles.statLabel, { color: dynamicStyles.secondary }]}>
            {t.withAbsences || 'Avec absences'}
          </Text>
        </View>
      </View>

      {/* Liste des étudiants */}
      <FlatList
        data={filteredStudents}
        renderItem={renderStudentCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="school" size={64} color={dynamicStyles.secondary} />
            <Text style={[styles.emptyTitle, { color: dynamicStyles.secondary }]}>
              {t.noStudentsFound || 'Aucun étudiant trouvé'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: dynamicStyles.secondary }]}>
              {t.adjustFilters || 'Ajustez vos filtres pour voir les résultats'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: '#F5F5F5',
  },
  darkContainer: {
    backgroundColor: '#0A1F3A',
  },
  lightText: {
    color: '#000000',
  },
  darkText: {
    color: '#FFFFFF',
  },
  lightCard: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: '#1A3F6F',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  lightInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
  },
  darkInput: {
    backgroundColor: '#1A3F6F',
    borderColor: '#6D8EB4',
    color: '#FFFFFF',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },

  // Filters
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minHeight: 48,
  },
  filterSelectorText: {
    fontSize: 16,
    flex: 1,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    paddingVertical: 4,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectedOption: {
    borderLeftWidth: 4,
  },
  modalOptionText: {
    fontSize: 16,
    flex: 1,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },

  // Student Cards
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  studentCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  studentGroup: {
    fontSize: 12,
    opacity: 0.8,
  },
  cardActions: {
    alignItems: 'center',
  },
  indicators: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  gradeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  absenceIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Expanded Content
  expandedContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  // Grades
  gradesContainer: {
    gap: 12,
  },
  gradeCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  gradeCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  evaluationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  evaluationInfo: {
    flex: 1,
  },
  evaluationType: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  evaluationWeight: {
    fontSize: 12,
  },
  scoreContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  averageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 2,
    borderTopColor: 'rgba(255, 215, 0, 0.3)',
  },
  averageLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  averageValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Absences
  absencesContainer: {
    gap: 12,
  },
  absenceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  absenceCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  absenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  absenceDate: {
    fontSize: 16,
    fontWeight: '500',
  },
  justifiedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  justifiedText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  absenceComment: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },

  // Empty States
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});