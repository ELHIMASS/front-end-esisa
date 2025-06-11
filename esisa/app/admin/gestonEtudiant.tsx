import React, { useEffect, useState, useContext } from "react";
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
    FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Icon } from "react-native-elements";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import { Ionicons } from '@expo/vector-icons';
import config from '../../config';

// Contextes
import { DarkModeContext } from "../context/DarkModeContext";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../utils/transactions";

interface Student {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    age: string;
    major: string;
    anne_scolaire: string;
    date: string;
    group: string;
    sex: string;
    tel: string;
    role: string;
    password: string;
    absences?: Array<any>;
    grades?: Array<any>;
}

export default function GestionEtudiant() {
    // Contextes
    const { darkMode } = useContext(DarkModeContext);
    const { language } = useContext(LanguageContext);
    const t = translations[language];

    // États
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMenuVisible, setMenuVisible] = useState(false);
    const [selectedSection, setSelectedSection] = useState("home");
    const [students, setStudents] = useState<Student[]>([]);
    const [isAddModalVisible, setAddModalVisible] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
   
    const [newStudent, setNewStudent] = useState<Student>({
        id: "",
        name: "",
        email: "",
        age: "",
        major: "",
        anne_scolaire: "",
        date: "",
        group: "",
        sex: "",
        tel: "",
        role: "student",
        password: "1234"
    });

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
        modal: darkMode ? styles.darkModal : styles.lightModal,
        header: darkMode ? styles.darkHeader : styles.lightHeader,
    };

    useEffect(() => {
        const checkSession = async () => {
            try {
                const storedAdmin = await AsyncStorage.getItem("admin");
                if (!storedAdmin) {
                    console.log("❌ Pas d'administrateur connecté, redirection...");
                    router.replace("/login");
                    return;
                }

                const parsed = JSON.parse(storedAdmin);
                if (parsed.role !== "admin") {
                    console.log("❌ L'utilisateur n'a pas les droits d'administration");
                    Alert.alert(t.error, t.noAdminRights || "Vous n'avez pas les droits d'administration");
                    router.replace("/(tabs)");
                    return;
                }

                setAdmin(parsed);
                const storedStudents = await AsyncStorage.getItem("students");
                if (storedStudents) {
                    setStudents(JSON.parse(storedStudents));
                }

                await loadStudentsFromServer();
            } catch (error) {
                console.error("Erreur lors de la vérification de session :", error);
                Alert.alert(t.error || "Erreur", t.dataLoadError || "Impossible de charger les données");
                router.replace("/login");
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    const playSound = async (file) => {
        try {
            const { sound } = await Audio.Sound.createAsync(file);
            await sound.playAsync();
        } catch (error) {
            console.error("Erreur de lecture audio :", error);
        }
    };
      
    const loadStudentsFromServer = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/students`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(t.studentLoadError || "Erreur lors du chargement des étudiants");
            }

            const data = await response.json();
            setStudents(data);
            await AsyncStorage.setItem("students", JSON.stringify(data));
        } catch (error) {
            console.error("Erreur lors du chargement depuis le serveur:", error);
        }
    };

    const toggleMenu = async () => {
        await playSound(require("../../assets/audio/tap.mp3")); 
      
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
        await playSound(require("../../assets/audio/done.mp3"));
        await AsyncStorage.clear();
        setAdmin(null);
        router.replace("/(tabs)");
    };

    const navigateToAdminHome = () => {
        playSound(require("../../assets/audio/tap.mp3"));
        router.push("/admin");
    };

    const handleChange = (field: string, value: string, data: Student, setData: React.Dispatch<React.SetStateAction<Student>>) => {
        setData({
            ...data,
            [field]: field === 'age' ? value.replace(/[^0-9]/g, '') : value,
        });
    };
      
    const handleAddStudent = async () => {
        if (!newStudent.name || !newStudent.email) {
            Alert.alert(t.error || "Erreur", t.nameEmailRequired || "Le nom et l'email sont obligatoires");
            return;
        }

        try {
            const response = await fetch(`${config.API_URL}/api/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newStudent)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || t.addError || "Erreur lors de l'ajout");
            }

            const updatedStudents = [...students, result.student];
            setStudents(updatedStudents);
            await AsyncStorage.setItem("students", JSON.stringify(updatedStudents));

            setAddModalVisible(false);
            await playSound(require("../../assets/audio/done.mp3"));
            Alert.alert(t.success || "Succès", t.studentAddedSuccess || "Étudiant ajouté avec succès");

            setNewStudent({
                id: "",
                name: "",
                email: "",
                age: "",
                major: "",
                anne_scolaire: "",
                date: "",
                group: "",
                sex: "",
                tel: "",
                role: "student",
                password: "1234"
            });
        } catch (error) {
            console.error("Erreur lors de l'ajout:", error);
            await playSound(require("../../assets/audio/error.mp3"));
            
            if (error.message.includes("Email déjà utilisé")) {
                Alert.alert(t.error || "Erreur", t.emailAlreadyUsed || "Cet email est déjà utilisé par un autre étudiant");
            } else {
                Alert.alert(t.error || "Erreur", error.message || t.addError || "Erreur lors de l'ajout de l'étudiant");
            }
        }
    };

    const handleEditStudent = async () => {
        if (!selectedStudent || !selectedStudent.name || !selectedStudent.email) {
            Alert.alert(t.error || "Erreur", t.nameEmailRequired || "Le nom et l'email sont obligatoires");
            return;
        }
    
        try {
            const response = await fetch(`${config.API_URL}/api/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: selectedStudent.email,
                    ...selectedStudent
                })
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || t.updateError || "Erreur lors de la modification");
            }
    
            const updatedStudents = students.map(student =>
                student.id === selectedStudent.id || student._id === selectedStudent._id || student.email === selectedStudent.email 
                    ? selectedStudent 
                    : student
            );
            
            setStudents(updatedStudents);
            await AsyncStorage.setItem("students", JSON.stringify(updatedStudents));
    
            setEditModalVisible(false);
            setSelectedStudent(null);
            await playSound(require("../../assets/audio/done.mp3"));
            Alert.alert(t.success || "Succès", t.studentUpdatedSuccess || "Étudiant modifié avec succès");
    
        } catch (error) {
            console.error("Erreur lors de la modification:", error);
            await playSound(require("../../assets/audio/error.mp3"));
            Alert.alert(t.error || "Erreur", error.message || t.updateError || "Erreur lors de la modification de l'étudiant");
        }
    };

    const handleDeleteStudent = async (id: string) => {
        try {
            const updatedStudents = students.filter(student => {
                return student.id !== id && student._id !== id;
            });
            setStudents(updatedStudents);
            await AsyncStorage.setItem("students", JSON.stringify(updatedStudents));

            const response = await fetch(`${config.API_URL}/api/students/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || t.deleteError || "Erreur lors de la suppression");
            }

            await playSound(require("../../assets/audio/supprimer.mp3"));
            Alert.alert(t.success || "Succès", t.studentDeletedSuccess || "Étudiant supprimé avec succès");

        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
            await playSound(require("../../assets/audio/error.mp3"));
            Alert.alert(t.error || "Erreur", error.message || t.deleteError || "Impossible de supprimer l'étudiant");
        }
    };

    const openEditModal = (student: Student) => {
        setSelectedStudent({...student});
        setEditModalVisible(true);
    };

    if (loading) {
        return (
            <View style={[styles.center, dynamicStyles.container]}>
                <ActivityIndicator size="large" color={darkMode ? "#FFD700" : "#3A8DFF"} />
            </View>
        );
    }

    if (!admin) {
        return (
            <View style={[styles.center, dynamicStyles.container]}>
                <Text style={[dynamicStyles.text, {color: "#FF5555"}]}>
                    {t.adminNotFound || "Administrateur non trouvé"}
                </Text>
            </View>
        );
    }

    const renderStudentForm = (data: Student, setData: React.Dispatch<React.SetStateAction<Student>>, isEdit = false) => (
        <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamicStyles.text]}>{t.fullName || "Nom complet"}*</Text>
                <TextInput
                    style={[styles.input, dynamicStyles.input]}
                    value={data.name}
                    onChangeText={(text) => handleChange('name', text, data, setData)}
                    placeholder={t.enterFullName || "Entrez le nom complet"}
                    placeholderTextColor={darkMode ? "#6D8EB4" : "#999"}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamicStyles.text]}>{t.email || "Email"}*</Text>
                <TextInput
                    style={[styles.input, dynamicStyles.input]}
                    value={data.email}
                    onChangeText={(text) => handleChange('email', text, data, setData)}
                    placeholder={t.enterEmail || "Entrez l'email"}
                    placeholderTextColor={darkMode ? "#6D8EB4" : "#999"}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamicStyles.text]}>{t.age || "Âge"}</Text>
                <TextInput
                    style={[styles.input, dynamicStyles.input]}
                    value={data.age}
                    onChangeText={(text) => handleChange('age', text, data, setData)}
                    placeholder={t.enterAge || "Entrez l'âge"}
                    placeholderTextColor={darkMode ? "#6D8EB4" : "#999"}
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamicStyles.text]}>{t.major || "Filière"}</Text>
                <TextInput
                    style={[styles.input, dynamicStyles.input]}
                    value={data.major}
                    onChangeText={(text) => handleChange('major', text, data, setData)}
                    placeholder={t.enterMajor || "Entrez la filière"}
                    placeholderTextColor={darkMode ? "#6D8EB4" : "#999"}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamicStyles.text]}>{t.schoolYear || "Année scolaire"}</Text>
                <TextInput
                    style={[styles.input, dynamicStyles.input]}
                    value={data.anne_scolaire}
                    onChangeText={(text) => handleChange('anne_scolaire', text, data, setData)}
                    placeholder={t.enterSchoolYear || "Entrez l'année scolaire"}
                    placeholderTextColor={darkMode ? "#6D8EB4" : "#999"}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamicStyles.text]}>{t.birthDate || "Date de naissance"}</Text>
                <TextInput
                    style={[styles.input, dynamicStyles.input]}
                    value={data.date}
                    onChangeText={(text) => handleChange('date', text, data, setData)}
                    placeholder="JJ/MM/AAAA"
                    placeholderTextColor={darkMode ? "#6D8EB4" : "#999"}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamicStyles.text]}>{t.group || "Groupe"}</Text>
                <TextInput
                    style={[styles.input, dynamicStyles.input]}
                    value={data.group}
                    onChangeText={(text) => handleChange('group', text, data, setData)}
                    placeholder={t.enterGroup || "Entrez le groupe"}
                    placeholderTextColor={darkMode ? "#6D8EB4" : "#999"}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamicStyles.text]}>{t.gender || "Sexe"}</Text>
                <TextInput
                    style={[styles.input, dynamicStyles.input]}
                    value={data.sex}
                    onChangeText={(text) => handleChange('sex', text, data, setData)}
                    placeholder={t.enterGender || "Entrez le sexe"}
                    placeholderTextColor={darkMode ? "#6D8EB4" : "#999"}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamicStyles.text]}>{t.phone || "Téléphone"}</Text>
                <TextInput
                    style={[styles.input, dynamicStyles.input]}
                    value={data.tel}
                    onChangeText={(text) => handleChange('tel', text, data, setData)}
                    placeholder={t.enterPhone || "Entrez le téléphone"}
                    placeholderTextColor={darkMode ? "#6D8EB4" : "#999"}
                    keyboardType="phone-pad"
                />
            </View>

            <TouchableOpacity
                style={styles.submitButton}
                onPress={isEdit ? handleEditStudent : handleAddStudent}
            >
                <Text style={styles.submitButtonText}>
                    {isEdit ? (t.modify || "MODIFIER") : (t.add || "AJOUTER")}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[{ flex: 1 }, dynamicStyles.container]}>
            {/* Header avec titre et menu */}
            <View style={[styles.header, dynamicStyles.header]}>
                <TouchableOpacity 
                    onPress={navigateToAdminHome}
                    style={styles.backButton}
                >
                    <Icon name="arrow-back" size={24} color={darkMode ? "#FFD700" : "#3A8DFF"} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, {color: darkMode ? "#FFD700" : "#3A8DFF"}]}>
                    {t.studentManagement || "GESTION DES ÉTUDIANTS"}
                </Text>
                <TouchableOpacity
                    onPress={toggleMenu}
                    style={[styles.menuButton, dynamicStyles.button]}
                >
                    <Icon name="menu" size={30} color={darkMode ? "#FFD700" : "#3A8DFF"} />
                </TouchableOpacity>
            </View>

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
                            dynamicStyles.modal,
                            { transform: [{ translateX: slideAnim }] }
                        ]}
                    >
                        <View style={styles.adminInfoContainer}>
                            <View style={[styles.adminAvatar, dynamicStyles.card]}>
                                <Text style={[styles.adminAvatarText, {color: darkMode ? "#FFD700" : "#3A8DFF"}]}>
                                    {admin.name && admin.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.adminInfo}>
                                <Text style={[styles.adminName, dynamicStyles.text]}>{admin.name}</Text>
                                <Text style={[styles.adminEmail, dynamicStyles.text]}>{admin.email}</Text>
                                <View style={styles.adminRoleBadge}>
                                    <Text style={styles.adminRole}>{admin.role}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.menuDivider, {backgroundColor: darkMode ? "#1A3F6F" : "#E0E0E0"}]} />

                        {[
                            { label: `🏠 ${t.home}`, section: "home", icon: "home", route: "/admin" },
                            { label: `👥 ${t.studentManagement}`, section: "students", icon: "people", route: "/admin/gestonEtudiant" },
                            { label: `👨‍🏫 ${t.professorManagement}`, section: "profs", icon: "school", route: "/admin/gestionProf" },
                            { label: `📅 Calendrier`, section: "calendar", icon: "event", route: "/other/calendrier" },
                            { label: `⚙️ ${t.settings}`, section: "settings", icon: "settings", route: "/Settings" }

                        ].map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.menuItem,
                                    selectedSection === item.section && styles.selectedMenuItem,
                                    selectedSection === item.section && dynamicStyles.card
                                ]}
                                onPress={async () => {
                                    await playSound(require("../../assets/audio/tap.mp3"));
                                    setSelectedSection(item.section);
                                    toggleMenu();
                                    router.push(item.route);
                                }}
                            >
                                <Icon
                                    name={item.icon}
                                    size={22}
                                    color={selectedSection === item.section ? (darkMode ? "#FFD700" : "#3A8DFF") : (darkMode ? "#6D8EB4" : "#999")}
                                />
                                <Text
                                    style={[
                                        styles.menuText,
                                        dynamicStyles.text,
                                        selectedSection === item.section && {color: darkMode ? "#FFD700" : "#3A8DFF", fontWeight: "bold"}
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        <View style={[styles.menuDivider, {backgroundColor: darkMode ? "#1A3F6F" : "#E0E0E0"}]} />

                        <TouchableOpacity
                            style={styles.logoutMenuItem}
                            onPress={handleLogout}
                        >
                            <Icon name="logout" size={22} color="#FF5555" />
                            <Text style={styles.logoutMenuText}>
                                {t.logout || "Se déconnecter"}
                            </Text>
                        </TouchableOpacity>

                        <Text style={[styles.versionText, dynamicStyles.text]}>v1.0.0</Text>
                    </Animated.View>
                </Pressable>
            </Modal>

            {/* Add Student Modal */}
            <Modal
                visible={isAddModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setAddModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={[styles.modalContainer, dynamicStyles.modal]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, {color: darkMode ? "#FFD700" : "#3A8DFF"}]}>
                                {t.addStudent || "AJOUTER UN ÉTUDIANT"}
                            </Text>
                            <TouchableOpacity
                                onPress={async () => {
                                    await playSound(require("../../assets/audio/error.mp3"));
                                    setAddModalVisible(false);
                                    setNewStudent({
                                        id: "",
                                        name: "",
                                        email: "",
                                        age: "",
                                        major: "",
                                        anne_scolaire: "",
                                        date: "",
                                        group: "",
                                        sex: "",
                                        tel: "",
                                        role: "student",
                                        password: "1234"
                                    });
                                }}
                            >
                                <Icon name="close" size={24} color="#FF5555" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {renderStudentForm(newStudent, setNewStudent)}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Edit Student Modal */}
            <Modal
                visible={isEditModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={[styles.modalContainer, dynamicStyles.modal]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, {color: darkMode ? "#FFD700" : "#3A8DFF"}]}>
                                {t.editStudent || "MODIFIER UN ÉTUDIANT"}
                            </Text>
                            <TouchableOpacity onPress={() => {
                                setEditModalVisible(false);
                                setSelectedStudent(null);
                            }}>
                                <Icon name="close" size={24} color="#FF5555" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {selectedStudent && renderStudentForm(selectedStudent, setSelectedStudent, true)}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Main Content */}
            <ScrollView contentContainerStyle={[styles.scroll, dynamicStyles.container]} showsVerticalScrollIndicator={false}>
                {selectedSection === "home" && (
                    <View style={styles.homeContainer}>
                        <View style={styles.avatarContainer}>
                            <View style={[styles.avatar, dynamicStyles.card]}>
                                <Text style={[styles.avatarText, {color: darkMode ? "#FFD700" : "#3A8DFF"}]}>
                                    {admin.name && admin.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View style={[styles.glowEffect, {backgroundColor: darkMode ? "#FFD700" : "#3A8DFF"}]} />
                        </View>
                        <Text style={[styles.welcomeTitle, {color: darkMode ? "#FFD700" : "#3A8DFF"}]}>
                            {t.studentManagement || "GESTION ÉTUDIANTS"}
                        </Text>
                        <Text style={[styles.adminInfoText, dynamicStyles.text]}>{admin.email}</Text>
                        <Text style={[styles.subtitle, dynamicStyles.text]}>
                            {t.adminPanel || "PANNEAU D'ADMINISTRATION"}
                        </Text>

                        <View style={styles.statsContainer}>
                            <View style={[styles.statCard, dynamicStyles.card]}>
                                <Icon name="people" size={30} color={darkMode ? "#FFD700" : "#3A8DFF"} />
                                <Text style={[styles.statNumber, dynamicStyles.text]}>{students.length}</Text>
                                <Text style={[styles.statLabel, dynamicStyles.text]}>
                                    {t.students || "ÉTUDIANTS"}
                                </Text>
                            </View>

                            <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
                                <Icon name="person-add" size={30} color="#FFF" />
                                <Text style={styles.addButtonText}>{t.add || "AJOUTER"}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.quickActionsContainer, dynamicStyles.card]}>
                            <Text style={[styles.quickActionsTitle, {color: darkMode ? "#FFD700" : "#3A8DFF"}]}>
                                {t.quickActions || "ACTIONS RAPIDES"}
                            </Text>
                            <View style={styles.actionButtonsRow}>
                                <TouchableOpacity
                                    style={[styles.actionButton, dynamicStyles.container]}
                                    onPress={() => setSelectedSection("students")}
                                >
                                    <Icon name="list" size={25} color={darkMode ? "#FFD700" : "#3A8DFF"} />
                                    <Text style={[styles.actionButtonText, dynamicStyles.text]}>
                                        {t.viewList || "VOIR LA LISTE"}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, dynamicStyles.container]}
                                    onPress={() => {
                                        setAddModalVisible(true);
                                        setNewStudent({
                                            id: "",
                                            name: "",
                                            email: "",
                                            age: "",
                                            major: "",
                                            anne_scolaire: "",
                                            date: "",
                                            group: "",
                                            sex: "",
                                            tel: "",
                                            role: "student",
                                            password: "1234"
                                        });
                                    }}
                                >
                                    <Icon name="add-circle" size={25} color={darkMode ? "#FFD700" : "#3A8DFF"} />
                                    <Text style={[styles.actionButtonText, dynamicStyles.text]}>
                                        {t.newStudent || "NOUVEL ÉTUDIANT"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {selectedSection === "students" && (
                    <View style={styles.studentsContainer}>
                        <Text style={[styles.sectionTitle, {color: darkMode ? "#FFD700" : "#3A8DFF"}]}>
                            {t.studentsList || "LISTE DES ÉTUDIANTS"}
                        </Text>
                        <Text style={[styles.subtitle, dynamicStyles.text]}>
                            {t.studentManagement || "GESTION DES ÉTUDIANTS"}
                        </Text>

                        <TouchableOpacity style={styles.floatingAddButton} onPress={() => {
                            setAddModalVisible(true);
                            setNewStudent({
                                id: "",
                                name: "",
                                email: "",
                                age: "",
                                major: "",
                                anne_scolaire: "",
                                date: "",
                                group: "",
                                sex: "",
                                tel: "",
                                role: "student",
                                password: "1234"
                            });
                        }}>
                            <Icon name="add" size={30} color="#FFF" />
                        </TouchableOpacity>

                        {students.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Icon name="people" size={40} color="#6D8EB4" />
                                <Text style={[styles.emptyText, dynamicStyles.text]}>{t.noStudentsFound || "Aucun étudiant trouvé"}</Text>
                                <TouchableOpacity style={styles.addEmptyButton} onPress={() => {
                                    setAddModalVisible(true);
                                    setNewStudent({
                                        id: "",
                                        name: "",
                                        email: "",
                                        age: "",
                                        major: "",
                                        anne_scolaire: "",
                                        date: "",
                                        group: "",
                                        sex: "",
                                        tel: "",
                                        role: "student",
                                        password: "1234"
                                    });
                                }}>
                                    <Text style={styles.addEmptyButtonText}>{t.addStudent || "AJOUTER UN ÉTUDIANT"}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <FlatList
                                data={students}
                                keyExtractor={(item) => item.id || item._id || String(Math.random())}
                                renderItem={({ item }) => (
                                    <View style={[styles.studentCard, dynamicStyles.card]}>
                                        <View style={styles.studentInfo}>
                                            <Text style={[styles.studentName, dynamicStyles.text]}>{item.name}</Text>
                                            <Text style={[styles.studentEmail, dynamicStyles.text]}>{item.email}</Text>
                                            <View style={[styles.studentDetails, dynamicStyles.input]}>
                                                <Text style={[styles.detailItem, dynamicStyles.text]}>
                                                    <Text style={[styles.detailLabel, dynamicStyles.text]}>{t.major || "Filière"}:</Text> {item.major || t.notSpecified || "Non spécifié"}
                                                </Text>
                                                <Text style={[styles.detailItem, dynamicStyles.text]}>
                                                    <Text style={[styles.detailLabel, dynamicStyles.text]}>{t.group || "Groupe"}:</Text> {item.group || t.notSpecified || "Non spécifié"}
                                                </Text>
                                                <Text style={[styles.detailItem, dynamicStyles.text]}>
                                                    <Text style={[styles.detailLabel, dynamicStyles.text]}>{t.phone || "Téléphone"}:</Text> {item.tel || t.notSpecified || "Non spécifié"}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.actionButtons}>
                                            <TouchableOpacity
                                                style={styles.editButton}
                                                onPress={() => openEditModal(item)}
                                            >
                                                <Icon name="edit" size={20} color="#FFD700" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => {
                                                    Alert.alert(
                                                        t.confirmation || "Confirmation",
                                                        `${t.deleteConfirm || "Voulez-vous vraiment supprimer"} ${item.name} ?`,
                                                        [
                                                            { text: t.cancel || "Annuler", style: "cancel" },
                                                            {
                                                                text: t.confirm || "Confirmer",
                                                                onPress: () => handleDeleteStudent(item.id || item._id || ""),
                                                                style: "destructive"
                                                            }
                                                        ]
                                                    );
                                                }}
                                            >
                                                <Icon name="delete" size={20} color="#FF5555" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            />
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={[styles.bottomNavigation, dynamicStyles.header]}>
                <TouchableOpacity 
                    style={[
                        styles.navButton,
                        selectedSection === "home" && styles.selectedNavButton
                    ]}
                    onPress={() => setSelectedSection("home")}
                >
                    <Icon 
                        name="home" 
                        size={24} 
                        color={selectedSection === "home" ? "#FFD700" : (darkMode ? "#6D8EB4" : "#999")} 
                    />
                    <Text style={[
                        styles.navButtonText,
                        selectedSection === "home" ? {color: "#FFD700"} : dynamicStyles.text
                    ]}>
                        {t.home || "ACCUEIL"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[
                        styles.navButton,
                        selectedSection === "students" && styles.selectedNavButton
                    ]}
                    onPress={() => setSelectedSection("students")}
                >
                    <Icon 
                        name="list" 
                        size={24} 
                        color={selectedSection === "students" ? "#FFD700" : (darkMode ? "#6D8EB4" : "#999")} 
                    />
                    <Text style={[
                        styles.navButtonText,
                        selectedSection === "students" ? {color: "#FFD700"} : dynamicStyles.text
                    ]}>
                        {t.list || "LISTE"}
                    </Text>
                </TouchableOpacity>
            </View>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: "#0A1F3A",
        borderBottomWidth: 1,
        borderBottomColor: "#1A3F6F",
        elevation: 3,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: "#FFD700",
        letterSpacing: 1,
    },
    menuButton: {
        backgroundColor: "#1A3F6F",
        borderRadius: 20,
        padding: 8,
        elevation: 5,
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 3,
    },
    scroll: {
        padding: 20,
        minHeight: "100%",
        backgroundColor: "#0A1F3A",
        paddingBottom: 80, // Pour laisser de la place à la navigation en bas
    },
    homeContainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 30,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#1A3F6F",
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFD700',
        zIndex: 2,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    glowEffect: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#FFD700',
        opacity: 0.3,
        top: -10,
        left: -10,
        zIndex: 1,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        color: "#FFD700",
        letterSpacing: 2,
    },
    adminInfoText: {
        fontSize: 16,
        color: "#FFF",
        marginBottom: 5,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 30,
        textAlign: "center",
        color: "#6D8EB4",
        letterSpacing: 1,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 30,
    },
    statCard: {
        backgroundColor: "#1A3F6F",
        borderRadius: 15,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        width: "48%",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFF",
        marginVertical: 10,
    },
    statLabel: {
        fontSize: 10,
        color: "#6D8EB4",
        fontWeight: "bold",
    },
    addButton: {
        backgroundColor: "#2E7D32",
        borderRadius: 15,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        width: "48%",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    addButtonText: {
        fontSize: 12,
        color: "#FFF",
        fontWeight: "bold",
        marginTop: 10,
    },
    quickActionsContainer: {
        width: "100%",
        backgroundColor: "#1A3F6F",
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    quickActionsTitle: {
        fontSize: 14,
        color: "#FFD700",
        fontWeight: "bold",
        marginBottom: 15,
    },
    actionButtonsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    actionButton: {
        backgroundColor: "#0A1F3A",
        borderRadius: 10,
        padding: 15,     
        alignItems: "center",
        width: "48%",
    },
    actionButtonText: {
        fontSize: 10,
        color: "#B4C6E2",
        fontWeight: "bold",
        marginTop: 10,
        textAlign: "center",
    },
    professorsContainer: {
        padding: 20,
        position: "relative",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFD700",
        marginBottom: 5,
    },
    floatingAddButton: {
        position: "absolute",
        right: 20,
        top: 20,
        backgroundColor: "#3A8DFF",
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 16,
        color: "#6D8EB4",
        marginVertical: 15,
    },
    addEmptyButton: {
        backgroundColor: "#3A8DFF",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 10,
    },
    addEmptyButtonText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },
    professorCard: {
        backgroundColor: "#1A3F6F",
        borderRadius: 15,
        padding: 15,
        marginVertical: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    professorInfo: {
        flex: 1,
        paddingRight: 10,
    },
    professorName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 4,
    },
    professorEmail: {
        fontSize: 12,
        color: "#B4C6E2",
        marginBottom: 8,
    },
    professorDetails: {
        backgroundColor: "#0A1F3A",
        borderRadius: 8,
        padding: 10,
    },
    detailItem: {
        fontSize: 12,
        color: "#B4C6E2",
        marginBottom: 3,
    },
    detailLabel: {
        fontWeight: "bold",
        color: "#6D8EB4",
    },
    actionButtons: {
        flexDirection: "column",
        justifyContent: "flex-start",
    },
    editButton: {
        backgroundColor: "#0A1F3A",
        padding: 8,
        borderRadius: 8,
        marginBottom: 8,
    },
    deleteButton: {
        backgroundColor: "#0A1F3A",
        padding: 8,
        borderRadius: 8,
    },
    // Modal styles
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#1A3F6F",
        borderRadius: 15,
        width: "90%",
        maxHeight: "80%",
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#2A4A73",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFD700",
    },
    formContainer: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        color: "#B4C6E2",
        marginBottom: 5,
        fontWeight: "600",
    },
    input: {
        backgroundColor: "#0A1F3A",
        borderRadius: 8,
        color: "#FFF",
        paddingVertical: 10,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    matiereInputContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
        matiereInput: {
        backgroundColor: "#0A1F3A",
        borderRadius: 8,
        color: "#FFF",
        paddingVertical: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        flex: 1,
    },
    addMatiereButton: {
        backgroundColor: "#3A8DFF",
        borderRadius: 8,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
    },
    addMatiereButtonText: {
        color: "#FFF",
        fontSize: 24,
        fontWeight: "bold",
    },
    matieresList: {
        marginTop: 10,
        marginBottom: 20,
    },
    subLabel: {
        fontSize: 12,
        color: "#6D8EB4",
        marginBottom: 8,
    },
    matiereItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#0A1F3A",
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 6,
    },
    matiereText: {
        color: "#B4C6E2",
        fontSize: 14,
    },
    submitButton: {
        backgroundColor: "#FFD700",
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 10,
    },
    submitButtonText: {
        color: "#13315C",
        fontSize: 16,
        fontWeight: "bold",
    },
    // Menu Drawer styles (conservés du deuxième code)
    modalBackgroundRight: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: 'flex-end',
        flexDirection: 'row',
    },
    menuDrawerRight: {
        width: "75%",
        height: "100%",
        backgroundColor: "#0A1F3A",
        padding: 20,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        borderLeftWidth: 2,
        borderLeftColor: "#FFD700",
        display: 'flex',
        flexDirection: 'column',
    },
    adminInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
    },
    adminAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#1A3F6F",
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    adminAvatarText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFD700',
    },
    adminInfo: {
        marginLeft: 15,
    },
    adminName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: "#FFF",
    },
    adminEmail: {
        fontSize: 14,
        color: "#6D8EB4",
        marginBottom: 5,
    },
    adminRoleBadge: {
        backgroundColor: "#FFD700",
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 10,
    },
    adminRole: {
        color: "#0A1F3A",
        fontSize: 12,
        fontWeight: 'bold',
    },
    menuDivider: {
        height: 1,
        backgroundColor: "#1A3F6F",
        marginVertical: 15,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginBottom: 5,
    },
    selectedMenuItem: {
        backgroundColor: "#1A3F6F",
    },
    menuText: {
        fontSize: 16,
        color: "#FFF",
        marginLeft: 15,
    },
    selectedMenuText: {
        color: "#FFD700",
        fontWeight: "bold",
    },
    logoutMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginTop: 'auto',
    },
    logoutMenuText: {
        fontSize: 16,
        color: "#FF5555",
        marginLeft: 15,
    },
    versionText: {
        fontSize: 12,
        color: "#6D8EB4",
        textAlign: "center",
        marginTop: 10,
        marginBottom: 5,
    },
    // Bottom Navigation styles
    bottomNavigation: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        backgroundColor: "#0A1F3A",
        borderTopWidth: 1,
        borderTopColor: "#1A3F6F",
        height: 80,
        paddingVertical: 10,
    },
    selectedNavButton: {
        backgroundColor: "#0A1F3A",
        borderWidth: 2,
        borderColor: "#FFD700",
    },
    navButton: {
        flex: 1,
        backgroundColor: "#1A3F6F",
        margin: 8,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    navButtonText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 12,
        marginTop: 5,
    },
    
    studentsContainer: {
        padding: 20,
        position: "relative",
    },
    studentCard: {
        backgroundColor: "#1A3F6F",
        borderRadius: 15,
        padding: 15,
        marginVertical: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    studentInfo: {
        flex: 1,
        paddingRight: 10,
    },
    studentName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 4,
    },
    studentEmail: {
        fontSize: 12,
        color: "#B4C6E2",
        marginBottom: 8,
    },
    studentDetails: {
        backgroundColor: "#0A1F3A",
        borderRadius: 8,
        padding: 10,
    },
    
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#1A3F6F',
        borderRadius: 15,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
        borderWidth: 2,
        borderColor: '#2A4A73',
    },
    modalCloseButton: {
        padding: 5,
    },
     
    
    // Dark/Light mode styles
    darkContainer: {
        backgroundColor: "#0A1F3A",
    },
    lightContainer: {
        backgroundColor: "#F5F5F5",
    },
    darkText: {
        color: "#FFFFFF",
    },
    lightText: {
        color: "#333333",
    },
    darkCard: {
        backgroundColor: "#1A3F6F",
    },
    lightCard: {
        backgroundColor: "#FFFFFF",
    },
    darkInput: {
        backgroundColor: "#0A1F3A",
        color: "#FFFFFF",
    },
    lightInput: {
        backgroundColor: "#FFFFFF",
        color: "#333333",
        borderWidth: 1,
        borderColor: "#DDDDDD",
    },
    darkButton: {
        backgroundColor: "#1A3F6F",
    },
    lightButton: {
        backgroundColor: "#E0E0E0",
    },
    darkModal: {
        backgroundColor: "#1A3F6F",
    },
    lightModal: {
        backgroundColor: "#FFFFFF",
    },
    darkHeader: {
        backgroundColor: "#0A1F3A",
        borderBottomColor: "#1A3F6F",
    },
    lightHeader: {
        backgroundColor: "#FFFFFF",
        borderBottomColor: "#E0E0E0",
    },

   
});
