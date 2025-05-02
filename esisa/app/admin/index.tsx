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
    FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Icon } from "react-native-elements";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// Définissez votre adresse IP ici - il suffira de la changer à un seul endroit
const SERVER_IP = "192.168.1.9"; // Remplacez par votre adresse IP réelle
const API_URL = `http://${SERVER_IP}:5000`;

export default function AdminScreen() {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMenuVisible, setMenuVisible] = useState(false);
    const [selectedSection, setSelectedSection] = useState("home");
    const [students, setStudents] = useState([]);
    const [isAddModalVisible, setAddModalVisible] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [newStudent, setNewStudent] = useState({
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
        password: "password_par_defaut"
    } as student);

    interface student {
        id: string,
        name: string,
        email: string,
        age: string,
        major: string,
        anne_scolaire: string,
        date: string,
        group: string,
        sex: string,
        tel: string,
        role: string,
        password: string
    }

    const router = useRouter();
    const insets = useSafeAreaInsets();
    const slideAnim = useState(new Animated.Value(300))[0];

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
                // Vérifier que l'admin a le rôle correct
                if (parsed.role !== "admin") {
                    console.log("❌ L'utilisateur n'a pas les droits d'administration");
                    Alert.alert("Erreur", "Vous n'avez pas les droits d'administration");
                    router.replace("/login");
                    return;
                }

                setAdmin(parsed);

                // Charger les étudiants depuis AsyncStorage d'abord
                const storedStudents = await AsyncStorage.getItem("students");
                if (storedStudents) {
                    setStudents(JSON.parse(storedStudents));
                }

                // Puis essayer de charger depuis le serveur
                await loadStudentsFromServer();
            } catch (error) {
                console.error("Erreur lors de la vérification de session :", error);
                Alert.alert("Erreur", "Impossible de charger les données");
                router.replace("/login");
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    const loadStudentsFromServer = async () => {
        try {
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
        } catch (error) {
            console.error("Erreur lors du chargement depuis le serveur:", error);
            // En cas d'échec, on garde les données d'AsyncStorage
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
        await AsyncStorage.removeItem("admin");
        setAdmin(null);
        router.replace("/login");
    };

    const handleAddStudent = async () => {
        if (!newStudent.name || !newStudent.email) {
            Alert.alert("Erreur", "Le nom et l'email sont obligatoires");
            return;
        }

        try {
            // Appel API vers le backend Node.js en utilisant la variable API_URL
            const response = await fetch(`${API_URL}/api/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newStudent)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Erreur lors de l'ajout");
            }

            // Mise à jour locale si l'ajout est réussi
            const updatedStudents: student[] = [...students, result.student];
            setStudents(updatedStudents);
            await AsyncStorage.setItem("students", JSON.stringify(updatedStudents));

            setAddModalVisible(false);
            Alert.alert("Succès", "Étudiant ajouté avec succès");

            // Réinitialise le formulaire
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
                password: "password_par_defaut"
            });
        } catch (error) {
            console.error("Erreur lors de l'ajout:", error);
            Alert.alert("Erreur", error.message || "Erreur lors de l'ajout de l'étudiant");
        }
    };

    const handleEditStudent = async () => {
        if (!selectedStudent || !selectedStudent.name || !selectedStudent.email) {
            Alert.alert("Erreur", "Le nom et l'email sont obligatoires");
            return;
        }

        try {
            const updatedStudents = students.map(student =>
                student.id === selectedStudent.id ? selectedStudent : student
            );
            setStudents(updatedStudents);
            await AsyncStorage.setItem("students", JSON.stringify(updatedStudents));

            // Appel API
            const studentId = selectedStudent.id || selectedStudent._id;
            const response = await fetch(`${API_URL}/api/students/${studentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(selectedStudent)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erreur lors de la modification");
            }

            setEditModalVisible(false);
            setSelectedStudent(null);
            Alert.alert("Succès", "Étudiant modifié avec succès");

            await loadStudentsFromServer();
        } catch (error) {
            console.error("Erreur lors de la modification:", error);
            Alert.alert("Erreur", error.message || "Erreur lors de la modification de l'étudiant");
        }
    };

    const handleDeleteStudent = async (id) => {
        try {
            // Suppression locale
            const updatedStudents = students.filter(student => {
                return student.id !== id && student._id !== id;
            });
            setStudents(updatedStudents);
            await AsyncStorage.setItem("students", JSON.stringify(updatedStudents));

            // Appel API
            const response = await fetch(`${API_URL}/api/students/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erreur lors de la suppression");
            }

            Alert.alert("Succès", "Étudiant supprimé avec succès");

        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
            Alert.alert("Erreur", error.message || "Impossible de supprimer l'étudiant");
        }
    };

    const openEditModal = (student) => {
        setSelectedStudent({...student});
        setEditModalVisible(true);
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: "#0A1F3A" }]}>
                <ActivityIndicator size="large" color="#FFD700" />
            </View>
        );
    }

    if (!admin) {
        return (
            <View style={[styles.center, { backgroundColor: "#0A1F3A" }]}>
                <Text style={{ color: "#FF5555" }}>Administrateur non trouvé</Text>
            </View>
        );
    }

    const renderStudentForm = (data, setData, isEdit = false) => (
        <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom complet :</Text>
                <TextInput
                    style={styles.input}
                    value={data.name}
                    onChangeText={(text) => setData({ ...data, name: text })}
                    placeholder="Nom complet"
                    placeholderTextColor="#6D8EB4"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email :</Text>
                <TextInput
                    style={styles.input}
                    value={data.email}
                    onChangeText={(text) => setData({ ...data, email: text })}
                    placeholder="Email"
                    placeholderTextColor="#6D8EB4"
                    keyboardType="email-address"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Âge :</Text>
                <TextInput
                    style={styles.input}
                    value={data.age}
                    onChangeText={(text) => setData({ ...data, age: text })}
                    placeholder="Âge"
                    placeholderTextColor="#6D8EB4"
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Filière :</Text>
                <TextInput
                    style={styles.input}
                    value={data.major}
                    onChangeText={(text) => setData({ ...data, major: text })}
                    placeholder="Filière"
                    placeholderTextColor="#6D8EB4"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Année scolaire :</Text>
                <TextInput
                    style={styles.input}
                    value={data.anne_scolaire}
                    onChangeText={(text) => setData({ ...data, anne_scolaire: text })}
                    placeholder="Année scolaire"
                    placeholderTextColor="#6D8EB4"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date de naissance :</Text>
                <TextInput
                    style={styles.input}
                    value={data.date}
                    onChangeText={(text) => setData({ ...data, date: text })}
                    placeholder="JJ/MM/AAAA"
                    placeholderTextColor="#6D8EB4"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Groupe :</Text>
                <TextInput
                    style={styles.input}
                    value={data.group}
                    onChangeText={(text) => setData({ ...data, group: text })}
                    placeholder="Groupe"
                    placeholderTextColor="#6D8EB4"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Sexe :</Text>
                <TextInput
                    style={styles.input}
                    value={data.sex}
                    onChangeText={(text) => setData({ ...data, sex: text })}
                    placeholder="Sexe"
                    placeholderTextColor="#6D8EB4"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Téléphone :</Text>
                <TextInput
                    style={styles.input}
                    value={data.tel}
                    onChangeText={(text) => setData({ ...data, tel: text })}
                    placeholder="Téléphone"
                    placeholderTextColor="#6D8EB4"
                    keyboardType="phone-pad"
                />
            </View>

            <TouchableOpacity
                style={styles.submitButton}
                onPress={isEdit ? handleEditStudent : handleAddStudent}
            >
                <Text style={styles.submitButtonText}>
                    {isEdit ? "MODIFIER" : "AJOUTER"}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#0A1F3A" }}>
            {/* Header avec titre et menu */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>DASHBOARD ADMIN</Text>
                <TouchableOpacity
                    onPress={toggleMenu}
                    style={styles.menuButton}
                >
                    <Icon name="menu" size={30} color="#FFD700" />
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
                            { transform: [{ translateX: slideAnim }] }
                        ]}
                    >
                        <View style={styles.adminInfoContainer}>
                            <View style={styles.adminAvatar}>
                                <Text style={styles.adminAvatarText}>
                                    {admin.name && admin.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.adminInfo}>
                                <Text style={styles.adminName}>{admin.name}</Text>
                                <Text style={styles.adminEmail}>{admin.email}</Text>
                                <View style={styles.adminRoleBadge}>
                                    <Text style={styles.adminRole}>{admin.role}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.menuDivider} />

                        {[
                            { label: "🏠 Accueil", section: "home", icon: "home" },
                            { label: "👥 Liste des étudiants", section: "students", icon: "people" },
                            { label: "➕ Ajouter un étudiant", section: "add", icon: "person-add" },
                        ].map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.menuItem,
                                    selectedSection === item.section && styles.selectedMenuItem
                                ]}
                                onPress={() => {
                                    setSelectedSection(item.section);
                                    if (item.section === "add") {
                                        setAddModalVisible(true);
                                    }
                                    toggleMenu();
                                }}
                            >
                                <Icon name={item.icon} size={22} color={selectedSection === item.section ? "#FFD700" : "#6D8EB4"} />
                                <Text
                                    style={[
                                        styles.menuText,
                                        selectedSection === item.section && styles.selectedMenuText
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        <View style={styles.menuDivider} />

                        <TouchableOpacity
                            style={styles.logoutMenuItem}
                            onPress={handleLogout}
                        >
                            <Icon name="logout" size={22} color="#FF5555" />
                            <Text style={styles.logoutMenuText}>
                                Se déconnecter
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.versionText}>v1.0.0</Text>
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
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>AJOUTER UN ÉTUDIANT</Text>
                            <TouchableOpacity onPress={() => setAddModalVisible(false)}>
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
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>MODIFIER UN ÉTUDIANT</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
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
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {selectedSection === "home" && (
                    <View style={styles.homeContainer}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {admin.name && admin.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.glowEffect} />
                        </View>
                        <Text style={styles.welcomeTitle}>BIENVENUE ADMIN</Text>
                        <Text style={styles.adminInfoText}>{admin.email}</Text>
                        <Text style={styles.subtitle}>PANNEAU D'ADMINISTRATION</Text>

                        <View style={styles.statsContainer}>
                            <View style={styles.statCard}>
                                <Icon name="people" size={30} color="#FFD700" />
                                <Text style={styles.statNumber}>{students.length}</Text>
                                <Text style={styles.statLabel}>ÉTUDIANTS</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => setAddModalVisible(true)}
                            >
                                <Icon name="person-add" size={30} color="#FFF" />
                                <Text style={styles.addButtonText}>AJOUTER</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.quickActionsContainer}>
                            <Text style={styles.quickActionsTitle}>ACTIONS RAPIDES</Text>
                            <View style={styles.actionButtonsRow}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => setSelectedSection("students")}
                                >
                                    <Icon name="list" size={25} color="#FFD700" />
                                    <Text style={styles.actionButtonText}>VOIR LA LISTE</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => setAddModalVisible(true)}
                                >
                                    <Icon name="add-circle" size={25} color="#FFD700" />
                                    <Text style={styles.actionButtonText}>NOUVEL ÉTUDIANT</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {selectedSection === "students" && (
                    <View style={styles.studentsContainer}>
                        <Text style={styles.sectionTitle}>LISTE DES ÉTUDIANTS</Text>
                        <Text style={styles.subtitle}>GESTION DES ÉTUDIANTS</Text>

                        <TouchableOpacity
                            style={styles.floatingAddButton}
                            onPress={() => setAddModalVisible(true)}
                        >
                            <Icon name="add" size={30} color="#FFF" />
                        </TouchableOpacity>

                        {students.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Icon name="people" size={40} color="#6D8EB4" />
                                <Text style={styles.emptyText}>Aucun étudiant trouvé</Text>
                                <TouchableOpacity
                                    style={styles.addEmptyButton}
                                    onPress={() => setAddModalVisible(true)}
                                >
                                    <Text style={styles.addEmptyButtonText}>AJOUTER UN ÉTUDIANT</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <FlatList
                                data={students}
                                keyExtractor={(item) => item.id || item._id || String(Math.random())}
                                renderItem={({ item }) => (
                                    <View style={styles.studentCard}>
                                        <View style={styles.studentInfo}>
                                            <Text style={styles.studentName}>{item.name}</Text>
                                            <Text style={styles.studentEmail}>{item.email}</Text>
                                            <View style={styles.studentDetails}>
                                                <Text style={styles.detailItem}>
                                                    <Text style={styles.detailLabel}>Filière:</Text> {item.major || "Non spécifié"}
                                                </Text>
                                                <Text style={styles.detailItem}>
                                                    <Text style={styles.detailLabel}>Groupe:</Text> {item.group || "Non spécifié"}
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
                                                        "Confirmation",
                                                        `Voulez-vous vraiment supprimer ${item.name} ?`,
                                                        [
                                                            { text: "Annuler", style: "cancel" },
                                                            {
                                                                text: "Confirmer",
                                                                onPress: () => handleDeleteStudent(item.id || item._id),
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
                                style={styles.studentsList}
                            />
                        )}
                    </View>
                )}
            </ScrollView>
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
        justifyContent: "space-around",
        width: "100%",
        marginBottom: 30,
    },
    statCard: {
        backgroundColor: "#1A3F6F",
        borderRadius: 15,
        padding: 20,
        width: "45%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    statNumber: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#FFD700",
        marginVertical: 10,
    },
    statLabel: {
        color: "#6D8EB4",
        fontSize: 14,
        fontWeight: "bold",
    },
    addButton: {
        backgroundColor: "#2E7D32",
        borderRadius: 15,
        padding: 20,
        width: "45%",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    addButtonText: {
        color: "#FFF",
        fontWeight: "bold",
        marginTop: 10,
    },
    quickActionsContainer: {
        width: "100%",
        marginTop: 20,
    },
    quickActionsTitle: {
        fontSize: 16,
        color: "#6D8EB4",
        marginBottom: 15,
        fontWeight: "bold",
    },
    actionButtonsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    actionButton: {
        backgroundColor: "#1A3F6F",
        borderRadius: 15,
        padding: 15,
        width: "48%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    },
    actionButtonText: {
        color: "#FFF",
        fontWeight: "bold",
        marginTop: 10,
        fontSize: 12,
    },
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
    studentsContainer: {
        width: "100%",
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFD700",
        marginBottom: 5,
        textAlign: "center",
    },
    floatingAddButton: {
        position: "absolute",
        right: 10,
        bottom: 20,
        backgroundColor: "#2E7D32",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        zIndex: 10,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 50,
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: "#6D8EB4",
        marginTop: 10,
        marginBottom: 20,
    },
    addEmptyButton: {
        backgroundColor: "#2E7D32",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 10,
    },
    addEmptyButtonText: {
        color: "#FFF",
        fontWeight: "bold",
    },
    studentsList: {
        marginTop: 20,
    },
    studentCard: {
        backgroundColor: "#1A3F6F",
        borderRadius: 12,
        marginBottom: 15,
        padding: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 5,
    },
    studentEmail: {
        fontSize: 14,
        color: "#6D8EB4",
        marginBottom: 10,
    },
    studentDetails: {
        marginTop: 5,
    },
    detailItem: {
        fontSize: 14,
        color: "#FFF",
        marginBottom: 2,
    },
    detailLabel: {
        color: "#FFD700",
        fontWeight: "bold",
    },
    actionButtons: {
        justifyContent: "space-around",
    },
    editButton: {
        backgroundColor: "#1A3F6F",
        borderWidth: 1,
        borderColor: "#FFD700",
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    deleteButton: {
        backgroundColor: "#1A3F6F",
        borderWidth: 1,
        borderColor: "#FF5555",
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#0A1F3A",
        borderRadius: 15,
        width: "90%",
        maxHeight: "85%",
        borderWidth: 2,
        borderColor: "#1A3F6F",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#1A3F6F",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFD700",
    },
    formContainer: {
        padding: 15,
    },
    inputGroup: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        color: "#FFD700",
        marginBottom: 5,
    },
    input: {
        backgroundColor: "#1A3F6F",
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        color: "#FFF",
        borderWidth: 1,
        borderColor: "#2A4F7F",
    },
    submitButton: {
        backgroundColor: "#2E7D32",
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: "center",
        marginTop: 10,
    },
    submitButtonText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 16,
    },
});