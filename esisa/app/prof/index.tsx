import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    Modal,
    Pressable,
    Animated,
    TextInput,
    FlatList
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Icon } from "react-native-elements";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";


const SERVER_IP = "192.168.100.219";
const API_URL = `http://${SERVER_IP}:5000`;
export default function ProfessorDashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMenuVisible, setMenuVisible] = useState(false);
    const [currentTab, setCurrentTab] = useState('notes');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [suggestionText, setSuggestionText] = useState('');
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [ccGrade, setCcGrade] = useState('');
    const [partielGrade, setPartielGrade] = useState('');
    const [projetGrade, setProjetGrade] = useState('');

    const router = useRouter();
    const insets = useSafeAreaInsets();
    const slideAnim = useState(new Animated.Value(300))[0];

    // Données mockées pour démonstration
    const yearGroups = {
        '5ème année': ['A', 'B', 'C'],
        '4ème année': ['A', 'B', 'C'],
        '3ème année': ['A', 'B', 'C'],
        '2ème année': ['A', 'B', 'C'],
        '1ère année': ['A', 'B', 'C'],
    };

    useEffect(() => {
        const checkSession = async () => {
            
            const stored = await AsyncStorage.getItem("prof");

            if (!stored) {
                console.log("❌ Pas d'utilisateur connecté, redirection...");
                router.replace("/login");
                return;
            }

            const parsedUser = JSON.parse(stored);
            setUser(parsedUser);
            
            
                await loadStudentsFromServer();
            
            
            setLoading(false);

        };

        checkSession();
    }, []);

    const loadStudentsFromServer = async () => {
        
        const response = await fetch(`${API_URL}/api/students`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Erreur lors du chargement des étudiants");
        }

        const data = await response.json();
        setStudents(data);
        await AsyncStorage.setItem("students", JSON.stringify(data));
        
    };

    
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
            setUser(null);
            router.replace("/login");
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
            Alert.alert("Erreur", "Un problème est survenu lors de la déconnexion. Veuillez réessayer.");
        }
    };

    const handleEditGrade = (studentId, subject) => {
        const student = students.find(s => s._id === studentId);
        if (!student) return;

        // Trouver les notes pour la matière sélectionnée
        const gradeInfo = student.grades.find(g => g.subject === subject);
        
        setCurrentStudent(student);
        setSelectedSubject(subject);
        
        if (gradeInfo) {
            setCcGrade(gradeInfo.cc.toString());
            setPartielGrade(gradeInfo.partiel.toString());
            setProjetGrade(gradeInfo.projet.toString());
        } else {
            setCcGrade('');
            setPartielGrade('');
            setProjetGrade('');
        }
        
        setShowGradeModal(true);
    };

    const saveGrade = () => {
        // Vérifier que les notes sont des nombres valides entre 0 et 20
        const cc = parseFloat(ccGrade);
        const partiel = parseFloat(partielGrade);
        const projet = parseFloat(projetGrade);

        if (isNaN(cc) || cc < 0 || cc > 20 || 
            isNaN(partiel) || partiel < 0 || partiel > 20 || 
            isNaN(projet) || projet < 0 || projet > 20) {
            Alert.alert("Erreur", "Veuillez entrer des notes valides entre 0 et 20");
            return;
        }

        const updatedStudents = students.map(student => {
            if (student._id === currentStudent._id) {
                // Vérifier si la matière existe déjà dans les notes de l'étudiant
                const gradeIndex = student.grades.findIndex(g => g.subject === selectedSubject);
                const updatedGrades = [...student.grades];
                
                if (gradeIndex !== -1) {
                    // Mettre à jour les notes existantes
                    updatedGrades[gradeIndex] = {
                        ...updatedGrades[gradeIndex],
                        cc,
                        partiel,
                        projet
                    };
                } else {
                    // Ajouter une nouvelle matière avec ses notes
                    updatedGrades.push({
                        subject: selectedSubject,
                        cc,
                        partiel,
                        projet
                    });
                }
                
                return {
                    ...student,
                    grades: updatedGrades
                };
            }
            return student;
        });

        setStudents(updatedStudents);
        setShowGradeModal(false);
        
        // Réinitialiser les champs
        setCcGrade('');
        setPartielGrade('');
        setProjetGrade('');
        setSelectedSubject('');
        
        Alert.alert("Succès", "Les notes ont été enregistrées avec succès");
    };

    const handleAddAbsence = (studentId) => {
        const updatedStudents = students.map(student => {
            if (student._id === studentId) {
                return { ...student, absences: student.absences + 1 };
            }
            return student;
        });

        setStudents(updatedStudents);
        Alert.alert("Succès", "L'absence a été enregistrée");
    };

    const sendEmail = () => {
        if (!emailSubject || !emailBody) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs");
            return;
        }

        if (!selectedGroup) {
            Alert.alert("Erreur", "Veuillez sélectionner un groupe");
            return;
        }

        Alert.alert("Succès", `Email envoyé à tous les étudiants du groupe ${selectedGroup}`);
        setEmailSubject('');
        setEmailBody('');
    };

    const sendSuggestion = () => {
        if (!suggestionText) {
            Alert.alert("Erreur", "Veuillez rédiger votre suggestion");
            return;
        }

        Alert.alert("Succès", "Votre suggestion a été envoyée anonymement");
        setSuggestionText('');
    };

    // Calculer la moyenne pour une matière donnée
    const calculateAverage = (grades, subject) => {
        const subjectGrades = grades.find(g => g.subject === subject);
        if (!subjectGrades) return "-";
        
        const { cc, partiel, projet } = subjectGrades;
        // Pondération: CC (30%), Partiel (40%), Projet (30%)
        return ((cc * 0.3) + (partiel * 0.4) + (projet * 0.3)).toFixed(2);
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: "#0A1F3A" }]}>
                <ActivityIndicator size="large" color="#FFD700" />
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
                                    // Si c'est une vraie route, naviguer vers elle
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

            {/* Grade Edit Modal */}
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
                            Groupe {currentStudent?.group} - {currentStudent?.year}
                        </Text>

                        <Text style={styles.modalLabel}>Matière: {selectedSubject}</Text>

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

            {/* Main Content */}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.name?.split(' ').map((item) => (item[0].toUpperCase())).join('')}
                        </Text>
                    </View>
                    <View style={styles.glowEffect} />
                </View>

                <Text style={styles.title}>ESPACE PROFESSEUR</Text>
                <Text style={styles.subtitle}>{user?.name} - {user?.age} ans</Text>
            </View>

            {/* Navigation Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, currentTab === 'notes' && styles.activeTab]}
                    onPress={() => setCurrentTab('notes')}
                >
                    <Icon name="assignment" size={20} color={currentTab === 'notes' ? "#FFD700" : "#6D8EB4"} />
                    <Text style={[styles.tabText, currentTab === 'notes' && styles.activeTabText]}>Notes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, currentTab === 'absences' && styles.activeTab]}
                    onPress={() => setCurrentTab('absences')}
                >
                    <Icon name="event-busy" size={20} color={currentTab === 'absences' ? "#FFD700" : "#6D8EB4"} />
                    <Text style={[styles.tabText, currentTab === 'absences' && styles.activeTabText]}>Absences</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, currentTab === 'annonces' && styles.activeTab]}
                    onPress={() => setCurrentTab('annonces')}
                >
                    <Icon name="email" size={20} color={currentTab === 'annonces' ? "#FFD700" : "#6D8EB4"} />
                    <Text style={[styles.tabText, currentTab === 'annonces' && styles.activeTabText]}>Annonces</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, currentTab === 'suggestions' && styles.activeTab]}
                    onPress={() => setCurrentTab('suggestions')}
                >
                    <Icon name="feedback" size={20} color={currentTab === 'suggestions' ? "#FFD700" : "#6D8EB4"} />
                    <Text style={[styles.tabText, currentTab === 'suggestions' && styles.activeTabText]}>Suggestions</Text>
                </TouchableOpacity>
            </View>

            {/* Filter Section */}
            <View style={styles.filterContainer}>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedYear}
                        style={styles.picker}
                        dropdownIconColor="#FFD700"
                        onValueChange={(itemValue) => {
                            setSelectedYear(itemValue);
                            setSelectedGroup('');
                        }}
                    >
                        <Picker.Item label="Sélectionner une année" value="" color="#FFF" />
                        {Object.keys(yearGroups).map((year) => (
                            <Picker.Item key={year} label={year} value={year} color="#FFF" />
                        ))}
                    </Picker>
                </View>

                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedGroup}
                        style={styles.picker}
                        dropdownIconColor="#FFD700"
                        enabled={!!selectedYear}
                        onValueChange={(itemValue) => setSelectedGroup(itemValue)}
                    >
                        <Picker.Item label="Sélectionner un groupe" value="" color="#FFF" />
                        {selectedYear && yearGroups[selectedYear]?.map((group) => (
                            <Picker.Item key={group} label={group} value={group} color="#FFF" />
                        ))}
                    </Picker>
                </View>
            </View>

            {/* Search Bar */}
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

            {/* Content Area */}
            <ScrollView style={styles.contentContainer}>
                {currentTab === 'notes' && (
                    <View>
                        <Text style={styles.contentTitle}>GESTION DES NOTES</Text>

                        {filteredStudents.length > 0 ? (
                            <View style={styles.tableContainer}>
                                {/* Table Header */}
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.headerCell, { flex: 2.5 }]}>Étudiant</Text>
                                    {user.matiere && user.matiere.map((subject, index) => (
                                        <Text key={index} style={styles.headerCell}>{subject}</Text>
                                    ))}
                                    <Text style={styles.headerCell}>Actions</Text>
                                </View>
                                
                                {/* Table Rows */}
                                {filteredStudents.map((student) => (
                                    <View key={student._id} style={styles.tableRow}>
                                        <View style={[styles.tableCell, { flex: 2.5 }]}>
                                            <Text style={styles.studentNameInTable}>{student.name}</Text>
                                            <Text style={styles.studentEmailInTable}>{student.email}</Text>
                                        </View>
                                        
                                        {user.matiere && user.matiere.map((subject, index) => (
                                            <TouchableOpacity 
                                                key={index} 
                                                style={styles.tableCell}
                                                onPress={() => handleEditGrade(student._id, subject)}
                                            >
                                                <Text style={styles.gradeText}>
                                                    {calculateAverage(student.grades, subject)}
                                                </Text>
                                                <Icon name="edit" size={16} color="#FFD700" />
                                            </TouchableOpacity>
                                        ))}
                                        
                                        <View style={styles.tableCell}>
                                            <TouchableOpacity
                                                style={styles.actionIconButton}
                                                onPress={() => handleEditGrade(student._id, user.matiere[0])}
                                            >
                                                <Icon name="dashboard" size={20} color="#FFD700" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Icon name="search-off" size={60} color="#6D8EB4" />
                                <Text style={styles.emptyStateText}>
                                    Aucun étudiant trouvé
                                </Text>
                                <Text style={styles.emptyStateSubtext}>
                                    Veuillez modifier vos critères de recherche
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {currentTab === 'absences' && (
                    <View>
                        <Text style={styles.contentTitle}>GESTION DES ABSENCES</Text>

                        {filteredStudents.length > 0 ? (
                            <View style={styles.tableContainer}>
                                {/* Table Header */}
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.headerCell, { flex: 2 }]}>Étudiant</Text>
                                    <Text style={styles.headerCell}>Absences</Text>
                                    <Text style={styles.headerCell}>Actions</Text>
                                </View>
                                
                                {/* Table Rows */}
                                {filteredStudents.map((student) => (
                                    <View key={student._id} style={styles.tableRow}>
                                        <View style={[styles.tableCell, { flex: 2 }]}>
                                            <Text style={styles.studentNameInTable}>{student.name}</Text>
                                            <Text style={styles.studentEmailInTable}>{student.email}</Text>
                                        </View>
                                        
                                        <View style={styles.tableCell}>
                                            <Text 
                                                style={[
                                                    styles.absenceCount,
                                                    student.absences > 2 ? styles.highAbsences : styles.lowAbsences
                                                ]}
                                            >
                                                {student.absences}
                                            </Text>
                                        </View>
                                        
                                        <View style={styles.tableCell}>
                                            <TouchableOpacity
                                                style={styles.absenceActionButton}
                                                onPress={() => handleAddAbsence(student._id)}
                                            >
                                                <Icon name="add-circle" size={18} color="#FFD700" />
                                                <Text style={styles.absenceActionButtonText}>Ajouter</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Icon name="search-off" size={60} color="#6D8EB4" />
                                <Text style={styles.emptyStateText}>
                                    Aucun étudiant trouvé
                                </Text>
                                <Text style={styles.emptyStateSubtext}>
                                    Veuillez modifier vos critères de recherche
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {currentTab === 'annonces' && (
                    <View>
                        <Text style={styles.contentTitle}>ENVOI D'ANNONCES</Text>
                        
                        <View style={styles.formContainer}>
                            <Text style={styles.formLabel}>Destinataires</Text>
                            <View style={styles.recipientInfo}>
                                <Icon name="people" size={20} color="#FFD700" />
                                <Text style={styles.recipientText}>
                                    {selectedYear && selectedGroup 
                                        ? `${selectedYear}  ${selectedGroup}` 
                                        : "Veuillez sélectionner un groupe"}
                                </Text>
                            </View>

                            <Text style={styles.formLabel}>Sujet</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Entrez le sujet de l'email..."
                                placeholderTextColor="#6D8EB4"
                                value={emailSubject}
                                onChangeText={setEmailSubject}
                            />

                            <Text style={styles.formLabel}>Contenu</Text>
                            <TextInput
                                style={[styles.textInput, styles.multilineInput]}
                                placeholder="Rédigez votre message..."
                                placeholderTextColor="#6D8EB4"
                                multiline={true}
                                numberOfLines={5}
                                textAlignVertical="top"
                                value={emailBody}
                                onChangeText={setEmailBody}
                            />

                            <TouchableOpacity 
                                style={[
                                    styles.sendButton,
                                    (!selectedGroup || !emailSubject || !emailBody) && styles.disabledButton
                                ]}
                                onPress={sendEmail}
                                disabled={!selectedGroup || !emailSubject || !emailBody}
                            >
                                <Icon name="send" size={20} color="#0A1F3A" />
                                <Text style={styles.sendButtonText}>Envoyer</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.infoCard}>
                            <Text style={styles.infoCardTitle}>Note</Text>
                            <Text style={styles.infoCardText}>
                                Les emails seront envoyés à tous les étudiants du groupe sélectionné.
                                Assurez-vous de vérifier votre message avant l'envoi.
                            </Text>
                        </View>
                    </View>
                )}

                {currentTab === 'suggestions' && (
                    <View>
                        <Text style={styles.contentTitle}>SUGGESTIONS</Text>
                        
                        <View style={styles.formContainer}>
                            <Text style={styles.formLabel}>Suggérez une amélioration</Text>
                            <Text style={styles.formSubLabel}>
                                Vos suggestions seront transmises de manière anonyme à l'administration
                            </Text>

                            <TextInput
                                style={[styles.textInput, styles.multilineInput]}
                                placeholder="Partagez vos idées pour améliorer l'application ou le système éducatif..."
                                placeholderTextColor="#6D8EB4"
                                multiline={true}
                                numberOfLines={8}
                                textAlignVertical="top"
                                value={suggestionText}
                                onChangeText={setSuggestionText}
                            />

                            <TouchableOpacity 
                                style={[
                                    styles.sendButton,
                                    !suggestionText && styles.disabledButton
                                ]}
                                onPress={sendSuggestion}
                                disabled={!suggestionText}
                            >
                                <Icon name="lightbulb" size={20} color="#0A1F3A" />
                                <Text style={styles.sendButtonText}>Envoyer la suggestion</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.infoCard}>
                            <Text style={styles.infoCardTitle}>Confidentialité</Text>
                            <Text style={styles.infoCardText}>
                                Toutes les suggestions sont envoyées de manière anonyme.
                                Votre identité ne sera pas révélée à l'administration.
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Floating Action Button for quick actions */}
            <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => Alert.alert(
                    "Actions rapides",
                    "Choisissez une action",
                    [
                        {
                            text: "Exporter les notes",
                            onPress: () => Alert.alert("Export", "Les notes ont été exportées avec succès")
                        },
                        {
                            text: "Importer des données",
                            onPress: () => Alert.alert("Import", "Fonctionnalité à venir")
                        },
                        { text: "Annuler", style: "cancel" }
                    ]
                )}
            >
                <Icon name="add" size={30} color="#0A1F3A" />
            </TouchableOpacity>
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
        paddingVertical: 20,
        paddingHorizontal: 15,
        alignItems: "center",
        backgroundColor: "#0F2A4A",
        borderBottomWidth: 1,
        borderBottomColor: "#1A3F6F",
    },
    avatarContainer: {
        position: 'relative',
        width: 70,
        height: 70,
        marginBottom: 10,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#1A3F6F",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#FFD700",
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 8,
        zIndex: 2,
    },
    glowEffect: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        top: -5,
        left: -5,
        zIndex: 1,
    },
    avatarText: {
        fontSize: 24,
        color: "#FFD700",
        fontWeight: "bold",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFD700",
        textAlign: "center",
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: "#B4C6E1",
        textAlign: "center",
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: "#0F2A4A",
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#1A3F6F",
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: "#FFD700",
    },
    tabText: {
        fontSize: 14,
        color: "#6D8EB4",
    },
    activeTabText: {
        color: "#FFD700",
        fontWeight: "bold",
    },
    filterContainer: {
        flexDirection: "row",
        padding: 10,
        backgroundColor: "#0A1F3A",
    },
    pickerContainer: {
        flex: 1,
        marginHorizontal: 5,
        backgroundColor: "#1A3F6F",
        borderRadius: 8,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#2A5597",
    },
    picker: {
        height: 50,
        color: "#FFF",
        backgroundColor: "#0F2A4A",
    },
    pickerItem: {
        backgroundColor: "#0F2A4A",
        color: "#FFF",
    },
    pickerDropdown: {
        backgroundColor: "#0F2A4A",
        borderWidth: 1,
        borderColor: "#FFD700",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        backgroundColor: "#0A1F3A",
    },
    searchIcon: {
        marginHorizontal: 10,
    },
    searchInput: {
        flex: 1,
        height: 50,
        backgroundColor: "#1A3F6F",
        color: "#FFF",
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#2A5597",
    },
    contentContainer: {
        flex: 1,
        backgroundColor: "#0A1F3A",
        paddingHorizontal: 10,
        paddingVertical: 15,
    },
    contentTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFD700",
        marginBottom: 15,
        textAlign: "center",
    },
    tableContainer: {
        backgroundColor: "#0F2A4A",
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#1A3F6F",
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#1A3F6F",
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    headerCell: {
        flex: 1,
        color: "#FFD700",
        fontWeight: "bold",
        fontSize: 14,
        textAlign: "center",
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#1A3F6F",
        paddingVertical: 10,
        paddingHorizontal: 8,
    },
    tableCell: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 5,
    },
    studentNameInTable: {
        fontSize: 14,
        color: "#FFF",
        fontWeight: "bold",
        textAlign: "left",
    },
    studentEmailInTable: {
        fontSize: 12,
        color: "#6D8EB4",
        textAlign: "left",
    },
    gradeText: {
        fontSize: 16,
        color: "#FFF",
        fontWeight: "bold",
        marginBottom: 5,
    },
    actionIconButton: {
        padding: 8,
        backgroundColor: "#1A3F6F",
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    absenceCount: {
        fontSize: 18,
        fontWeight: "bold",
        borderRadius: 15,
        width: 30,
        height: 30,
        textAlign: "center",
        lineHeight: 30,
    },
    lowAbsences: {
        color: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
    },
    highAbsences: {
        color: "#F44336",
        backgroundColor: "rgba(244, 67, 54, 0.2)",
    },
    absenceActionButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A3F6F",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 15,
        gap: 5,
    },
    absenceActionButtonText: {
        color: "#FFD700",
        fontSize: 12,
        fontWeight: "bold",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 50,
    },
    emptyStateText: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 15,
    },
    emptyStateSubtext: {
        color: "#6D8EB4",
        fontSize: 14,
        marginTop: 5,
        textAlign: "center",
    },
    formContainer: {
        backgroundColor: "#0F2A4A",
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#1A3F6F",
    },
    formLabel: {
        fontSize: 16,
        color: "#FFD700",
        marginBottom: 8,
        marginTop: 15,
    },
    formDescription: {
        fontSize: 14,
        color: "#B4C6E1",
        marginBottom: 15,
        lineHeight: 20,
    },
    formInput: {
        backgroundColor: "#1A3F6F",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: "#FFF",
        borderWidth: 1,
        borderColor: "#2A5597",
    },
    multilineInput: {
        minHeight: 120,
        textAlignVertical: "top",
    },
    submitButton: {
        backgroundColor: "#2A5597",
        borderRadius: 25,
        padding: 15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
        gap: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    submitButtonText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 16,
    },
    statsContainer: {
        flexDirection: "row",
        backgroundColor: "#0F2A4A",
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderTopWidth: 1,
        borderTopColor: "#1A3F6F",
    },
    statItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    statValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFD700",
    },
    statLabel: {
        fontSize: 14,
        color: "#6D8EB4",
        marginTop: 5,
    },
    modalBackgroundRight: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    menuDrawerRight: {
        position: "absolute",
        right: 0,
        width: 300,
        height: "100%",
        backgroundColor: "#0A1F3A",
        borderLeftWidth: 1,
        borderLeftColor: "#1A3F6F",
    },
    menuHeader: {
        padding: 20,
        backgroundColor: "#0F2A4A",
        borderBottomWidth: 1,
        borderBottomColor: "#1A3F6F",
        alignItems: "center",
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
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#1A3F6F",
    },
    menuText: {
        color: "#FFF",
        fontSize: 16,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#0F2A4A",
        borderRadius: 15,
        width: "90%",
        padding: 20,
        borderWidth: 1,
        borderColor: "#1A3F6F",
    },
    modalTitle: {
        fontSize: 18,
        color: "#FFD700",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 5,
    },
    modalSubtitle: {
        fontSize: 14,
        color: "#B4C6E1",
        textAlign: "center",
        marginBottom: 15,
    },
    modalLabel: {
        fontSize: 16,
        color: "#FFD700",
        marginBottom: 20,
        textAlign: "center",
    },
    gradeInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    gradeLabel: {
        flex: 1,
        fontSize: 14,
        color: "#FFF",
    },
    gradeInput: {
        flex: 1,
        backgroundColor: "#1A3F6F",
        color: "#FFF",
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: "#2A5597",
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginHorizontal: 5,
    },
    buttonText: {
        color: "#FFF",
        fontWeight: "bold",
    },
});