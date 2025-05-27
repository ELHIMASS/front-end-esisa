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
    Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { Audio } from "expo-av";

// Définissez votre adresse IP ici - il suffira de la changer à un seul endroit
const SERVER_IP = "192.168.1.146"; // Remplacez par votre adresse IP réelle
const API_URL = `http://${SERVER_IP}:5000`;

export default function AdminHomePage() {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMenuVisible, setMenuVisible] = useState(false);
    const [selectedSection, setSelectedSection] = useState("home");
    const router = useRouter();
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
                    router.replace("/(tabs)");
                    return;
                }

                setAdmin(parsed);
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

    const navigateToGestionProf = () => {
        playSound(require("../../assets/audio/tap.mp3"));
        router.push("/admin/GestionProf");
    };

    const navigateToGestionEtudiant = () => {
        playSound(require("../../assets/audio/tap.mp3"));
        router.push("/admin/gestionEtudiant");
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

            {/* Main Content */}
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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

                    <View style={styles.featuresContainer}>
                        <View style={styles.featureCard}>
                            <Icon name="people" size={40} color="#FFD700" />
                            <Text style={styles.featureTitle}>GESTION DES ÉTUDIANTS</Text>
                            <Text style={styles.featureDescription}>
                                Ajoutez, modifiez ou supprimez des profils d'étudiants. Suivez les inscriptions et gérez les groupes.
                            </Text>
                        </View>

                        <View style={styles.featureCard}>
                            <Icon name="school" size={40} color="#FFD700" />
                            <Text style={styles.featureTitle}>GESTION DES PROFESSEURS</Text>
                            <Text style={styles.featureDescription}>
                                Administrez les comptes enseignants, assignez des cours et gérez les disponibilités.
                            </Text>
                        </View>

                        <View style={styles.featureCard}>
                            <Icon name="date-range" size={40} color="#FFD700" />
                            <Text style={styles.featureTitle}>CALENDRIER ACADÉMIQUE</Text>
                            <Text style={styles.featureDescription}>
                                Planifiez les événements importants, examens et périodes de vacances.
                            </Text>
                        </View>

                        <View style={styles.featureCard}>
                            <Icon name="bar-chart" size={40} color="#FFD700" />
                            <Text style={styles.featureTitle}>STATISTIQUES</Text>
                            <Text style={styles.featureDescription}>
                                Consultez les données analytiques sur les performances et la fréquentation.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Navigation Buttons */}
            <View style={styles.bottomNavigation}>
                <TouchableOpacity 
                    style={styles.navButton}
                    onPress={navigateToGestionProf}
                >
                    <Icon name="school" size={24} color="#FFF" />
                    <Text style={styles.navButtonText}>GESTION PROFS</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.navButton}
                    onPress={navigateToGestionEtudiant}
                >
                    <Icon name="people" size={24} color="#FFF" />
                    <Text style={styles.navButtonText}>GESTION ÉTUDIANTS</Text>
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
        paddingBottom: 100, // Pour laisser de la place aux boutons de navigation en bas
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
    featuresContainer: {
        width: "100%",
    },
    featureCard: {
        backgroundColor: "#1A3F6F",
        borderRadius: 15,
        padding: 25,
        width: "100%",
        alignItems: "center",
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFD700",
        marginVertical: 12,
        textAlign: "center",
    },
    featureDescription: {
        fontSize: 14,
        color: "#FFF",
        textAlign: "center",
        lineHeight: 20,
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