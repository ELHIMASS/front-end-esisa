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
import { Audio } from "expo-av";
import { Ionicons } from '@expo/vector-icons';

const SERVER_IP = "192.168.1.146";
const API_URL = `http://${SERVER_IP}:5000`;

export default function ProfScreen() {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMenuVisible, setMenuVisible] = useState(false);
    const [selectedSection, setSelectedSection] = useState("home");
    const [professors, setProfessors] = useState([]);
    const [isAddModalVisible, setAddModalVisible] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [selectedProf, setSelectedProf] = useState(null);
    const [matiere, setMatiere] = useState('');
    const [matieresList, setMatieresList] = useState([]);
    const [newProf, setNewProf] = useState({
        name: '',
        email: '',
        password: '',
        age: '',
        phone: '',
        matiere: []
    });

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
                if (parsed.role !== "admin") {
                    console.log("❌ L'utilisateur n'a pas les droits d'administration");
                    Alert.alert("Erreur", "Vous n'avez pas les droits d'administration");
                    router.replace("/(tabs)");
                    return;
                }

                setAdmin(parsed);
                const storedProfessors = await AsyncStorage.getItem("professors");
                if (storedProfessors) {
                    setProfessors(JSON.parse(storedProfessors));
                }

                await loadProfessorsFromServer();
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

    const playSound = async (file) => {
        try {
            const { sound } = await Audio.Sound.createAsync(file);
            await sound.playAsync();
        } catch (error) {
            console.error("Erreur de lecture audio :", error);
        }
    };
      
    const loadProfessorsFromServer = async () => {
        try {
            const response = await fetch(`${API_URL}/api/prof`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Erreur lors du chargement des professeurs");
            }

            const data = await response.json();
            setProfessors(data);
            await AsyncStorage.setItem("professors", JSON.stringify(data));
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
    
    const addMatiere = (data, setData) => {
        if (matiere.trim()) {
            const updatedList = [...matieresList, matiere.trim()];
            setMatieresList(updatedList);
            setData({
                ...data,
                matiere: updatedList
            });
            setMatiere('');
        }
    };

    const removeMatiere = (index, data, setData) => {
        const updatedList = [...matieresList];
        updatedList.splice(index, 1);
        setMatieresList(updatedList);
        setData({
            ...data,
            matiere: updatedList
        });
    };

    const handleChange = (field, value, data, setData) => {
        setData({
            ...data,
            [field]: field === 'age' ? value.replace(/[^0-9]/g, '') : value,
        });
    };
      
    const handleAddProf = async () => {
        if (!newProf.name || !newProf.email || !newProf.password || 
            !newProf.age || !newProf.phone || newProf.matiere.length === 0) {
            Alert.alert("Erreur", "Tous les champs sont obligatoires");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/addProf`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newProf)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Erreur lors de l'ajout du professeur");
            }

            const updatedProfessors = [...professors, result.professor];
            setProfessors(updatedProfessors);
            await AsyncStorage.setItem("professors", JSON.stringify(updatedProfessors));

            setAddModalVisible(false);
            await playSound(require("../../assets/audio/done.mp3"));
            Alert.alert("Succès", "Professeur ajouté avec succès");

            setNewProf({
                name: '',
                email: '',
                password: '',
                age: '',
                phone: '',
                matiere: []
            });
            setMatieresList([]);
        } catch (error) {
            console.error("Erreur lors de l'ajout:", error);
            await playSound(require("../../assets/audio/error.mp3"));
            
            if (error.message.includes("Email déjà utilisé")) {
                Alert.alert("Erreur", "Cet email est déjà utilisé par un autre professeur");
            } else {
                Alert.alert("Erreur", error.message || "Erreur lors de l'ajout du professeur");
            }
        }
    };

    const handleEditProf = async () => {
        if (!selectedProf || !selectedProf.name || !selectedProf.email || !selectedProf.password || 
            !selectedProf.age || !selectedProf.phone || selectedProf.matiere.length === 0) {
            Alert.alert("Erreur", "Tous les champs sont obligatoires");
            return;
        }
    
        try {
            const response = await fetch(`${API_URL}/api/updateProf`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: selectedProf.email,
                    ...selectedProf
                })
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erreur lors de la modification");
            }
    
            const updatedProfessors = professors.map(prof =>
                prof._id === selectedProf._id || prof.email === selectedProf.email 
                    ? selectedProf 
                    : prof
            );
            
            setProfessors(updatedProfessors);
            await AsyncStorage.setItem("professors", JSON.stringify(updatedProfessors));
    
            setEditModalVisible(false);
            setSelectedProf(null);
            setMatieresList([]);
            await playSound(require("../../assets/audio/done.mp3"));
            Alert.alert("Succès", "Professeur modifié avec succès");
    
        } catch (error) {
            console.error("Erreur lors de la modification:", error);
            await playSound(require("../../assets/audio/error.mp3"));
            Alert.alert("Erreur", error.message || "Erreur lors de la modification du professeur");
        }
    };

    const handleDeleteProf = async (id) => {
        try {
            const updatedProfessors = professors.filter(prof => {
                return prof._id !== id;
            });
            setProfessors(updatedProfessors);
            await AsyncStorage.setItem("professors", JSON.stringify(updatedProfessors));

            const response = await fetch(`${API_URL}/api/prof/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erreur lors de la suppression");
            }

            await playSound(require("../../assets/audio/supprimer.mp3"));
            Alert.alert("Succès", "Professeur supprimé avec succès");

        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
            await playSound(require("../../assets/audio/error.mp3"));
            Alert.alert("Erreur", error.message || "Impossible de supprimer le professeur");
        }
    };

    const openEditModal = (prof) => {
        setSelectedProf({...prof});
        setMatieresList(prof.matiere || []);
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

    const renderProfForm = (data, setData, isEdit = false) => (
        <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom complet*</Text>
                <TextInput
                    style={styles.input}
                    value={data.name}
                    onChangeText={(text) => handleChange('name', text, data, setData)}
                    placeholder="Entrez le nom complet"
                    placeholderTextColor="#6D8EB4"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email*</Text>
                <TextInput
                    style={styles.input}
                    value={data.email}
                    onChangeText={(text) => handleChange('email', text, data, setData)}
                    placeholder="Entrez l'email"
                    placeholderTextColor="#6D8EB4"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mot de passe*</Text>
                <TextInput
                    style={styles.input}
                    value={data.password}
                    onChangeText={(text) => handleChange('password', text, data, setData)}
                    placeholder="Entrez le mot de passe"
                    placeholderTextColor="#6D8EB4"
                    secureTextEntry
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Âge*</Text>
                <TextInput
                    style={styles.input}
                    value={data.age}
                    onChangeText={(text) => handleChange('age', text, data, setData)}
                    placeholder="Entrez l'âge"
                    placeholderTextColor="#6D8EB4"
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Téléphone*</Text>
                <TextInput
                    style={styles.input}
                    value={data.phone}
                    onChangeText={(text) => handleChange('phone', text, data, setData)}
                    placeholder="Entrez le numéro de téléphone"
                    placeholderTextColor="#6D8EB4"
                    keyboardType="phone-pad"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Matières enseignées*</Text>
                <View style={styles.matiereInputContainer}>
                    <TextInput
                        style={styles.matiereInput}
                        placeholder="Ajouter une matière"
                        placeholderTextColor="#6D8EB4"
                        value={matiere}
                        onChangeText={setMatiere}
                    />
                    <TouchableOpacity 
                        style={styles.addMatiereButton} 
                        onPress={() => addMatiere(data, setData)}
                    >
                        <Text style={styles.addMatiereButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {matieresList.length > 0 && (
                <View style={styles.matieresList}>
                    <Text style={styles.subLabel}>Matières ajoutées :</Text>
                    {matieresList.map((item, index) => (
                        <View key={index} style={styles.matiereItem}>
                            <Text style={styles.matiereText}>{item}</Text>
                            <TouchableOpacity onPress={() => removeMatiere(index, data, setData)}>
                                <Ionicons name="close-circle" size={20} color="#FF6B6B" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            <TouchableOpacity
                style={styles.submitButton}
                onPress={isEdit ? handleEditProf : handleAddProf}
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
                <TouchableOpacity 
                    onPress={navigateToAdminHome}
                    style={styles.backButton}
                >
                    <Icon name="arrow-back" size={24} color="#FFD700" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>GESTION DES PROFESSEURS</Text>
                <TouchableOpacity
                    onPress={toggleMenu}
                    style={styles.menuButton}
                >
                    <Icon name="menu" size={30} color="#FFD700" />
                </TouchableOpacity>
            </View>

            {/* Drawer Menu - Conservé du deuxième code */}
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
                            { label: "🏠 Accueil", section: "home", icon: "home", route: "/admin" },
                            { label: "👥 Gestion des étudiants", section: "students", icon: "people", route: "/admin/gestionEtudiant" },
                            { label: "👨‍🏫 Gestion des professeurs", section: "profs", icon: "school", route: "/admin/gestionProf" },
                        ].map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.menuItem,
                                    selectedSection === item.section && styles.selectedMenuItem
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
                                    color={selectedSection === item.section ? "#FFD700" : "#6D8EB4"}
                                />
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

            {/* Add Professor Modal */}
            <Modal
                visible={isAddModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setAddModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>AJOUTER UN PROFESSEUR</Text>
                            <TouchableOpacity
                                onPress={async () => {
                                    await playSound(require("../../assets/audio/error.mp3"));
                                    setAddModalVisible(false);
                                    setNewProf({
                                        name: '',
                                        email: '',
                                        password: '',
                                        age: '',
                                        phone: '',
                                        matiere: []
                                    });
                                    setMatieresList([]);
                                }}
                            >
                                <Icon name="close" size={24} color="#FF5555" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {renderProfForm(newProf, setNewProf)}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Edit Professor Modal */}
            <Modal
                visible={isEditModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>MODIFIER UN PROFESSEUR</Text>
                            <TouchableOpacity onPress={() => {
                                setEditModalVisible(false);
                                setSelectedProf(null);
                                setMatieresList([]);
                            }}>
                                <Icon name="close" size={24} color="#FF5555" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {selectedProf && renderProfForm(selectedProf, setSelectedProf, true)}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Main Content */}
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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
                        <Text style={styles.welcomeTitle}>GESTION PROFESSEURS</Text>
                        <Text style={styles.adminInfoText}>{admin.email}</Text>
                        <Text style={styles.subtitle}>PANNEAU D'ADMINISTRATION</Text>

                        <View style={styles.statsContainer}>
                            <View style={styles.statCard}>
                                <Icon name="school" size={30} color="#FFD700" />
                                <Text style={styles.statNumber}>{professors.length}</Text>
                                <Text style={styles.statLabel}>PROFESSEURS</Text>
                            </View>

                            <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
                                <Icon name="person-add" size={30} color="#FFF" />
                                <Text style={styles.addButtonText}>AJOUTER</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.quickActionsContainer}>
                            <Text style={styles.quickActionsTitle}>ACTIONS RAPIDES</Text>
                            <View style={styles.actionButtonsRow}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => setSelectedSection("professors")}
                                >
                                    <Icon name="list" size={25} color="#FFD700" />
                                    <Text style={styles.actionButtonText}>VOIR LA LISTE</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => {
                                        setAddModalVisible(true);
                                        setNewProf({
                                            name: '',
                                            email: '',
                                            password: '',
                                            age: '',
                                            phone: '',
                                            matiere: []
                                        });
                                        setMatieresList([]);
                                    }}
                                >
                                    <Icon name="add-circle" size={25} color="#FFD700" />
                                    <Text style={styles.actionButtonText}>NOUVEAU PROFESSEUR</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {selectedSection === "professors" && (
                    <View style={styles.professorsContainer}>
                        <Text style={styles.sectionTitle}>LISTE DES PROFESSEURS</Text>
                        <Text style={styles.subtitle}>GESTION DU CORPS PROFESSORAL</Text>

                        <TouchableOpacity style={styles.floatingAddButton} onPress={() => {
                            setAddModalVisible(true);
                            setNewProf({
                                name: '',
                                email: '',
                                password: '',
                                age: '',
                                phone: '',
                                matiere: []
                            });
                            setMatieresList([]);
                        }}>
                            <Icon name="add" size={30} color="#FFF" />
                        </TouchableOpacity>

                        {professors.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Icon name="school" size={40} color="#6D8EB4" />
                                <Text style={styles.emptyText}>Aucun professeur trouvé</Text>
                                <TouchableOpacity style={styles.addEmptyButton} onPress={() => {
                                    setAddModalVisible(true);
                                    setNewProf({
                                        name: '',
                                        email: '',
                                        password: '',
                                        age: '',
                                        phone: '',
                                        matiere: []
                                    });
                                    setMatieresList([]);
                                }}>
                                    <Text style={styles.addEmptyButtonText}>AJOUTER UN PROFESSEUR</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <FlatList
                                data={professors}
                                keyExtractor={(item) => item._id || String(Math.random())}
                                renderItem={({ item }) => (
                                    <View style={styles.professorCard}>
                                        <View style={styles.professorInfo}>
                                            <Text style={styles.professorName}>{item.name}</Text>
                                            <Text style={styles.professorEmail}>{item.email}</Text>
                                            <View style={styles.professorDetails}>
                                                <Text style={styles.detailItem}>
                                                    <Text style={styles.detailLabel}>Âge:</Text> {item.age || "Non spécifié"}
                                                </Text>
                                                <Text style={styles.detailItem}>
                                                    <Text style={styles.detailLabel}>Téléphone:</Text> {item.phone || "Non spécifié"}
                                                </Text>
                                                <Text style={styles.detailItem}>
                                                    <Text style={styles.detailLabel}>Matières:</Text> {item.matiere && item.matiere.length > 0 ? item.matiere.join(", ") : "Aucune matière spécifiée"}
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
                                                                onPress: () => handleDeleteProf(item._id),
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
            <View style={styles.bottomNavigation}>
                <TouchableOpacity 
                    style={styles.navButton}
                    onPress={() => setSelectedSection("home")}
                >
                    <Icon name="home" size={24} color="#FFF" />
                    <Text style={styles.navButtonText}>ACCUEIL</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.navButton}
                    onPress={() => setSelectedSection("professors")}
                >
                    <Icon name="list" size={24} color="#FFF" />
                    <Text style={styles.navButtonText}>LISTE</Text>
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
});