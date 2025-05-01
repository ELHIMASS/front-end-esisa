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

export default function ProfessorDashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMenuVisible, setMenuVisible] = useState(false);
    const [currentTab, setCurrentTab] = useState('notes');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [absences, setAbsences] = useState([]);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [suggestionText, setSuggestionText] = useState('');
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [newNote, setNewNote] = useState('');
    const [searchText, setSearchText] = useState('');

    const router = useRouter();
    const insets = useSafeAreaInsets();
    const slideAnim = useState(new Animated.Value(300))[0];

    // Données mockées pour démonstration
    const yearGroups = {
        '2023-2024': ['Groupe A', 'Groupe B', 'Groupe C'],
        '2022-2023': ['Groupe X', 'Groupe Y', 'Groupe Z'],
        '2021-2022': ['Groupe 1', 'Groupe 2', 'Groupe 3'],
    };

    // Adaptation des données mockées selon les informations de la base de données
    const mockStudents = [
        { id: '1', name: 'Ahmed Djouri', year: '2023-2024', group: 'B', notes: [{ subject: 'Mathématiques', value: 15 }, { subject: 'Physique', value: 14 }], absences: 2, major: '3 eme année genie logiciele', email: 'ahmedD', tel: '0674049336', sex: 'M', date: '28/12/2003' },
        { id: '2', name: 'Sophia Lahlou', year: '2023-2024', group: 'A', notes: [{ subject: 'Mathématiques', value: 18 }, { subject: 'Physique', value: 16 }], absences: 0, major: '3 eme année genie logiciele', email: 'sophiaL', tel: '0611223344', sex: 'F', date: '15/05/2002' },
        { id: '3', name: 'Karim El Mansouri', year: '2023-2024', group: 'B', notes: [{ subject: 'Mathématiques', value: 12 }, { subject: 'Physique', value: 13 }], absences: 3, major: '3 eme année genie logiciele', email: 'karimEM', tel: '0655667788', sex: 'M', date: '10/09/2002' },
        { id: '4', name: 'Leila Tazi', year: '2022-2023', group: 'X', notes: [{ subject: 'Mathématiques', value: 16 }, { subject: 'Physique', value: 17 }], absences: 1, major: '2 eme année genie logiciele', email: 'leilaT', tel: '0699887766', sex: 'F', date: '22/03/2003' },
        { id: '5', name: 'Omar Alaoui', year: '2021-2022', group: '1', notes: [{ subject: 'Mathématiques', value: 14 }, { subject: 'Physique', value: 15 }], absences: 4, major: '1 ere année genie logiciele', email: 'omarA', tel: '0633445566', sex: 'M', date: '05/11/2004' },
    ];

    useEffect(() => {
        const checkSession = async () => {

            const stored = await AsyncStorage.getItem("prof");

            if (!stored) {
                console.log("❌ Pas d'utilisateur connecté, redirection...");
                router.replace("/login");
                return;
            }

            const parsed = JSON.parse(stored);
            setUser(parsed);
            // Charger les données mockées
            setStudents(mockStudents);
            setLoading(false);

        };

        checkSession();
    }, []);

    // Filtrer les étudiants en fonction de l'année, du groupe et de la recherche
    useEffect(() => {
        let filtered = [...students];

        if (selectedYear) {
            filtered = filtered.filter(student => student.year === selectedYear);
        }

        if (selectedGroup) {
            filtered = filtered.filter(student => student.group === selectedGroup);
        }

        if (searchText) {
            filtered = filtered.filter(student =>
                student.name.toLowerCase().includes(searchText.toLowerCase())
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

    const handleAddNote = (studentId) => {
        const student = students.find(s => s.id === studentId);
        setCurrentStudent(student);
        setShowStudentModal(true);
    };

    const saveNote = () => {
        if (!newNote || isNaN(parseFloat(newNote)) || parseFloat(newNote) < 0 || parseFloat(newNote) > 20) {
            Alert.alert("Erreur", "Veuillez entrer une note valide entre 0 et 20");
            return;
        }

        const updatedStudents = students.map(student => {
            if (student.id === currentStudent.id) {
                // Ajouter la nouvelle note pour la matière du professeur connecté
                const updatedNotes = [...student.notes];
                // En supposant que l'utilisateur connecté est un professeur de mathématiques
                // selon l'image, le module n'est pas clairement défini
                const mathIndex = updatedNotes.findIndex(note => note.subject === 'Mathématiques');

                if (mathIndex !== -1) {
                    updatedNotes[mathIndex] = { ...updatedNotes[mathIndex], value: parseFloat(newNote) };
                } else {
                    updatedNotes.push({ subject: 'Mathématiques', value: parseFloat(newNote) });
                }

                return { ...student, notes: updatedNotes };
            }
            return student;
        });

        setStudents(updatedStudents);
        setShowStudentModal(false);
        setNewNote('');
        Alert.alert("Succès", "La note a été enregistrée");
    };

    const handleAddAbsence = (studentId) => {
        const updatedStudents = students.map(student => {
            if (student.id === studentId) {
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

            {/* Student Details Modal */}
            <Modal
                visible={showStudentModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowStudentModal(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {currentStudent?.name || "Étudiant"}
                        </Text>

                        <Text style={styles.modalSubtitle}>
                            Groupe {currentStudent?.group} - {currentStudent?.year}
                        </Text>

                        <Text style={styles.modalLabel}>Notes actuelles:</Text>
                        {currentStudent?.notes.map((note, index) => (
                            <Text key={index} style={styles.modalText}>
                                {note.subject}: {note.value}/20
                            </Text>
                        ))}

                        <Text style={styles.modalLabel}>Ajouter une note:</Text>
                        <TextInput
                            style={styles.noteInput}
                            value={newNote}
                            onChangeText={setNewNote}
                            placeholder="Note sur 20"
                            keyboardType="numeric"
                            placeholderTextColor="#6D8EB4"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: "#D32F2F" }]}
                                onPress={() => setShowStudentModal(false)}
                            >
                                <Text style={styles.buttonText}>Annuler</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: "#2E7D32" }]}
                                onPress={saveNote}
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
                <Text style={styles.subtitle}>Gestion des Étudiants & Communications</Text>
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
                            filteredStudents.map((student) => (
                                <View key={student.id} style={styles.studentCard}>
                                    <View style={styles.studentInfo}>
                                        <Text style={styles.studentName}>{student.name}</Text>
                                        <Text style={styles.studentDetails}>Groupe {student.group} • {student.year}</Text>

                                        <View style={styles.notesContainer}>
                                            {student.notes.map((note, index) => (
                                                <View key={index} style={styles.noteItem}>
                                                    <Text style={styles.noteSubject}>{note.subject}</Text>
                                                    <Text style={[styles.noteValue,
                                                        note.value >= 10 ? styles.goodNote : styles.badNote
                                                    ]}>
                                                        {note.value}/20
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleAddNote(student.id)}
                                    >
                                        <Icon name="edit" size={20} color="#FFD700" />
                                        <Text style={styles.actionButtonText}>Modifier</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
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
                            filteredStudents.map((student) => (
                                <View key={student.id} style={styles.studentCard}>
                                    <View style={styles.studentInfo}>
                                        <Text style={styles.studentName}>{student.name}</Text>
                                        <Text style={styles.studentDetails}>Groupe {student.group} • {student.year}</Text>

                                        <View style={styles.absenceContainer}>
                                            <Text style={styles.absenceLabel}>Nombre d'absences:</Text>
                                            <Text style={[styles.absenceCount,
                                                student.absences > 2 ? styles.highAbsences : styles.lowAbsences
                                            ]}>
                                                {student.absences}
                                            </Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleAddAbsence(student.id)}
                                    >
                                        <Icon name="add-circle" size={20} color="#FFD700" />
                                        <Text style={styles.actionButtonText}>Ajouter</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
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
                        <Text style={styles.contentTitle}>ENVOYER UNE ANNONCE PAR EMAIL</Text>

                        <View style={styles.formContainer}>
                            <Text style={styles.formLabel}>Groupe destinataire:</Text>
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

                            <Text style={styles.formLabel}>Sujet:</Text>
                            <TextInput
                                style={styles.formInput}
                                value={emailSubject}
                                onChangeText={setEmailSubject}
                                placeholder="Entrez le sujet de l'email"
                                placeholderTextColor="#6D8EB4"
                            />

                            <Text style={styles.formLabel}>Message:</Text>
                            <TextInput
                                style={[styles.formInput, styles.textArea]}
                                value={emailBody}
                                onChangeText={setEmailBody}
                                placeholder="Rédigez votre message..."
                                placeholderTextColor="#6D8EB4"
                                multiline
                                numberOfLines={5}
                                textAlignVertical="top"
                            />

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={sendEmail}
                            >
                                <Icon name="send" size={20} color="#FFF" />
                                <Text style={styles.submitButtonText}>ENVOYER L'ANNONCE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {currentTab === 'suggestions' && (
                    <View>
                        <Text style={styles.contentTitle}>SUGGÉRER UNE AMÉLIORATION (ANONYME)</Text>

                        <View style={styles.formContainer}>
                            <Text style={styles.formLabel}>Votre suggestion:</Text>
                            <TextInput
                                style={[styles.formInput, styles.textArea]}
                                value={suggestionText}
                                onChangeText={setSuggestionText}
                                placeholder="Partagez vos idées pour améliorer l'établissement..."
                                placeholderTextColor="#6D8EB4"
                                multiline
                                numberOfLines={8}
                                textAlignVertical="top"
                            />

                            <Text style={styles.anonymousNote}>
                                Note: Votre suggestion sera transmise de façon anonyme à l'administration.
                            </Text>

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={sendSuggestion}
                            >
                                <Icon name="feedback" size={20} color="#FFF" />
                                <Text style={styles.submitButtonText}>ENVOYER LA SUGGESTION</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: { alignItems: "center", paddingTop: 10, paddingBottom: 10 },
    avatarContainer: { position: 'relative', marginBottom: 15 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#1A3F6F", justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFD700', zIndex: 2 },
    avatarText: { fontSize: 30, fontWeight: 'bold', color: '#FFD700' },
    glowEffect: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFD700', opacity: 0.3, top: -10, left: -10, zIndex: 1 },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 5, textAlign: "center", color: "#FFD700", letterSpacing: 1 },
    subtitle: { fontSize: 14, textAlign: "center", color: "#6D8EB4", letterSpacing: 1 },
    tabContainer: { flexDirection: 'row', backgroundColor: "#1A3F6F", marginHorizontal: 10, borderRadius: 15, marginTop: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 5 },
    tab: { flex: 1, alignItems: 'center', paddingVertical: 12, flexDirection: 'column', justifyContent: 'center' },
    activeTab: { backgroundColor: "#0A1F3A", borderRadius: 15, borderWidth: 1, borderColor: "#FFD700" },
    tabText: { color: "#6D8EB4", fontSize: 12, marginTop: 5 },
    activeTabText: { color: "#FFD700", fontWeight: "bold" },
    filterContainer: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 10, marginTop: 15 },
    pickerContainer: { flex: 1, marginHorizontal: 5, backgroundColor: "#1A3F6F", borderRadius: 10, overflow: 'hidden' },
    picker: { height: 50, width: '100%', color: "#FFF", backgroundColor: "#1A3F6F" },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#1A3F6F", borderRadius: 25, marginHorizontal: 10, marginTop: 15, paddingHorizontal: 15, paddingVertical: 5 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, color: "#FFF", height: 40 },
    contentContainer: { flex: 1, marginTop: 15, paddingHorizontal: 10 },
    contentTitle: { fontSize: 18, fontWeight: "bold", color: "#FFD700", marginBottom: 15, textAlign: "center", letterSpacing: 1 },

    // Student Card Styles
    studentCard: {
        backgroundColor: "#1A3F6F",
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5
    },
    studentInfo: {
        flex: 1
    },
    studentName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: "#FFD700",
        marginBottom: 5
    },
    studentDetails: {
        fontSize: 14,
        color: "#6D8EB4",
        marginBottom: 10
    },

    // Notes Tab Styles
    notesContainer: {
        marginTop: 10
    },
    noteItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5
    },
    noteSubject: {
        fontSize: 14,
        color: "#FFF"
    },
    noteValue: {
        fontSize: 14,
        fontWeight: 'bold'
    },
    goodNote: {
        color: "#4CAF50"
    },
    badNote: {
        color: "#F44336"
    },

    // Absences Tab Styles
    absenceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10
    },
    absenceLabel: {
        fontSize: 14,
        color: "#FFF",
        marginRight: 10
    },
    absenceCount: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    highAbsences: {
        color: "#F44336"
    },
    lowAbsences: {
        color: "#4CAF50"
    },

    // Empty State Styles
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40
    },
    emptyStateText: {
        fontSize: 18,
        color: "#6D8EB4",
        marginTop: 15,
        fontWeight: 'bold'
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: "#6D8EB4",
        marginTop: 5,
        textAlign: 'center'
    },

    // Form Styles
    formContainer: {
        backgroundColor: "#1A3F6F",
        borderRadius: 15,
        padding: 15,
        marginBottom: 20
    },
    formLabel: {
        fontSize: 14,
        color: "#6D8EB4",
        marginBottom: 5,
        marginTop: 10
    },
    formInput: {
        backgroundColor: "#0A1F3A",
        borderRadius: 10,
        padding: 12,
        color: "#FFF",
        borderWidth: 1,
        borderColor: "#2C5282"
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top'
    },
    anonymousNote: {
        fontSize: 12,
        color: "#6D8EB4",
        fontStyle: 'italic',
        marginTop: 10,
        marginBottom: 15
    },
    submitButton: {
        backgroundColor: "#FFD700",
        borderRadius: 25,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15
    },
    submitButtonText: {
        color: "#0A1F3A",
        fontWeight: 'bold',
        marginLeft: 10
    },

    // Action Buttons
    actionButton: {
        backgroundColor: "#0A1F3A",
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        alignSelf: 'flex-end',
        borderWidth: 1,
        borderColor: "#FFD700"
    },
    actionButtonText: {
        color: "#FFD700",
        fontWeight: 'bold',
        marginLeft: 5,
        fontSize: 14
    },

    // Modal Styles
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalBackgroundRight: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    menuDrawerRight: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 280,
        backgroundColor: "#0A1F3A",
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 0,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 5
    },
    menuHeader: {
        borderBottomWidth: 1,
        borderBottomColor: "#1A3F6F",
        paddingBottom: 15,
        marginBottom: 15,
        paddingHorizontal: 20
    },
    menuHeaderText: {
        color: "#FFD700",
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#1A3F6F"
    },
    menuText: {
        color: "#FFF",
        fontSize: 16
    },
    modalContent: {
        backgroundColor: "#0A1F3A",
        borderRadius: 15,
        padding: 20,
        width: '100%',
        borderWidth: 2,
        borderColor: "#FFD700"
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: "#FFD700",
        marginBottom: 5,
        textAlign: 'center'
    },
    modalSubtitle: {
        fontSize: 14,
        color: "#6D8EB4",
        marginBottom: 20,
        textAlign: 'center'
    },
    modalLabel: {
        fontSize: 16,
        color: "#6D8EB4",
        marginBottom: 10,
        marginTop: 15
    },
    modalText: {
        fontSize: 14,
        color: "#FFF",
        marginBottom: 5
    },
    noteInput: {
        backgroundColor: "#1A3F6F",
        borderRadius: 10,
        padding: 12,
        color: "#FFF",
        borderWidth: 1,
        borderColor: "#2C5282"
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 25
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5
    },
    buttonText: {
        color: "#FFF",
        fontWeight: 'bold',
        fontSize: 16
    }
});