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
    Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Icon } from "react-native-elements";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Audio } from "expo-av";

// Contextes
import { DarkModeContext } from "../context/DarkModeContext";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../utils/transactions";

export default function AdminHomePage() {
    // Contextes
    const { darkMode } = useContext(DarkModeContext);
    const { language } = useContext(LanguageContext);
    const t = translations[language];

    // États
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMenuVisible, setMenuVisible] = useState(false);
    const [selectedSection, setSelectedSection] = useState("home");
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
                    Alert.alert(t.error, t.noAdminRights);
                    router.replace("/(tabs)");
                    return;
                }

                setAdmin(parsed);
            } catch (error) {
                console.error("Erreur lors de la vérification de session :", error);
                Alert.alert(t.error, t.dataLoadError);
                router.replace("/login");
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    const playSound = async (file: any) => {
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
        router.push("/admin/gestionProf");
    };

    const navigateToGestionEtudiant = () => {
        playSound(require("../../assets/audio/tap.mp3"));
        router.push("/admin/gestonEtudiant");
    };

    if (loading) {
        return (
            <View style={[styles.center, dynamicStyles.container]}>
                <ActivityIndicator size="large" color={darkMode ? "#FFD700" : "#0A1F3A"} />
            </View>
        );
    }

    if (!admin) {
        return (
            <View style={[styles.center, dynamicStyles.container]}>
                <Text style={{ color: "#FF5555" }}>{t.adminNotFound}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.flex1, dynamicStyles.container]}>
            {/* Header avec titre et menu */}
            <View style={[styles.header, { backgroundColor: darkMode ? "#0A1F3A" : "#FFFFFF" }]}>
                <Text style={[styles.headerTitle, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
                    {t.adminDashboard}
                </Text>
                <TouchableOpacity
                    onPress={toggleMenu}
                    style={[
                        styles.menuButton,
                        { 
                            backgroundColor: darkMode ? "#1A3F6F" : "#E3F2FD",
                            shadowColor: darkMode ? "#FFD700" : "#000"
                        }
                    ]}
                >
                    <Icon name="menu" size={30} color={darkMode ? "#FFD700" : "#0A1F3A"} />
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
                            { 
                                transform: [{ translateX: slideAnim }],
                                backgroundColor: darkMode ? "#0A1F3A" : "#FFFFFF",
                                borderLeftColor: darkMode ? "#FFD700" : "#0A1F3A"
                            }
                        ]}
                    >
                        <View style={styles.adminInfoContainer}>
                            <View style={[
                                styles.adminAvatar,
                                {
                                    backgroundColor: darkMode ? "#1A3F6F" : "#E3F2FD",
                                    borderColor: darkMode ? "#FFD700" : "#0A1F3A"
                                }
                            ]}>
                                <Text style={[styles.adminAvatarText, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
                                    {admin.name && admin.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.adminInfo}>
                                <Text style={[styles.adminName, dynamicStyles.text]}>{admin.name}</Text>
                                <Text style={[styles.adminEmail, { color: darkMode ? "#6D8EB4" : "#666666" }]}>
                                    {admin.email}
                                </Text>
                                <View style={[
                                    styles.adminRoleBadge,
                                    { backgroundColor: darkMode ? "#FFD700" : "#0A1F3A" }
                                ]}>
                                    <Text style={[styles.adminRole, { color: darkMode ? "#0A1F3A" : "#FFFFFF" }]}>
                                        {admin.role}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.menuDivider, { backgroundColor: darkMode ? "#1A3F6F" : "#E0E0E0" }]} />

                        {[
                            { label: `🏠 ${t.home}`, section: "home", icon: "home", route: "/admin" },
                            { label: `👥 ${t.studentManagement}`, section: "students", icon: "people", route: "/admin/gestionEtudiant" },
                            { label: `👨‍🏫 ${t.professorManagement}`, section: "profs", icon: "school", route: "/admin/gestionProf" },
                            { label: `⚙️ ${t.settings}`, route: "/Settings" },
                        ].map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.menuItem,
                                    selectedSection === item.section && {
                                        backgroundColor: darkMode ? "#1A3F6F" : "#E3F2FD"
                                    }
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
                                    color={selectedSection === item.section ? "#FFD700" : (darkMode ? "#6D8EB4" : "#666666")}
                                />
                                <Text
                                    style={[
                                        styles.menuText,
                                        dynamicStyles.text,
                                        selectedSection === item.section && { color: "#FFD700", fontWeight: "bold" }
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        <View style={[styles.menuDivider, { backgroundColor: darkMode ? "#1A3F6F" : "#E0E0E0" }]} />

                        <TouchableOpacity
                            style={styles.logoutMenuItem}
                            onPress={handleLogout}
                        >
                            <Icon name="logout" size={22} color="#FF5555" />
                            <Text style={styles.logoutMenuText}>
                                {t.logout}
                            </Text>
                        </TouchableOpacity>

                        <Text style={[styles.versionText, { color: darkMode ? "#6D8EB4" : "#666666" }]}>
                            v1.0.0
                        </Text>
                    </Animated.View>
                </Pressable>
            </Modal>

            {/* Main Content */}
            <ScrollView 
                contentContainerStyle={[
                    styles.scroll, 
                    { backgroundColor: darkMode ? "#0A1F3A" : "#FFFFFF" }
                ]} 
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.homeContainer}>
                    <View style={styles.avatarContainer}>
                        <View style={[
                            styles.avatar,
                            {
                                backgroundColor: darkMode ? "#1A3F6F" : "#E3F2FD",
                                borderColor: darkMode ? "#FFD700" : "#0A1F3A"
                            }
                        ]}>
                            <Text style={[styles.avatarText, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
                                {admin.name && admin.name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={[
                            styles.glowEffect,
                            { backgroundColor: darkMode ? "rgba(255, 215, 0, 0.3)" : "rgba(10, 31, 58, 0.2)" }
                        ]} />
                    </View>
                    <Text style={[styles.welcomeTitle, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
                        {t.welcomeAdmin}
                    </Text>
                    <Text style={[styles.adminInfoText, { color: darkMode ? "#FFFFFF" : "#000000" }]}>
                        {admin.email}
                    </Text>
                    <Text style={[styles.subtitle, { color: darkMode ? "#6D8EB4" : "#666666" }]}>
                        {t.adminPanel}
                    </Text>

                    <View style={styles.featuresContainer}>
                        <View style={[
                            styles.featureCard,
                            { backgroundColor: darkMode ? "#1A3F6F" : "#F5F5F5" }
                        ]}>
                            <Icon name="people" size={40} color={darkMode ? "#FFD700" : "#0A1F3A"} />
                            <Text style={[styles.featureTitle, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
                                {t.studentManagement}
                            </Text>
                            <Text style={[styles.featureDescription, dynamicStyles.text]}>
                                {t.studentManagementDesc}
                            </Text>
                        </View>

                        <View style={[
                            styles.featureCard,
                            { backgroundColor: darkMode ? "#1A3F6F" : "#F5F5F5" }
                        ]}>
                            <Icon name="school" size={40} color={darkMode ? "#FFD700" : "#0A1F3A"} />
                            <Text style={[styles.featureTitle, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
                                {t.professorManagement}
                            </Text>
                            <Text style={[styles.featureDescription, dynamicStyles.text]}>
                                {t.professorManagementDesc}
                            </Text>
                        </View>

                        <View style={[
                            styles.featureCard,
                            { backgroundColor: darkMode ? "#1A3F6F" : "#F5F5F5" }
                        ]}>
                            <Icon name="date-range" size={40} color={darkMode ? "#FFD700" : "#0A1F3A"} />
                            <Text style={[styles.featureTitle, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
                                {t.academicCalendar}
                            </Text>
                            <Text style={[styles.featureDescription, dynamicStyles.text]}>
                                {t.academicCalendarDesc}
                            </Text>
                        </View>

                        <View style={[
                            styles.featureCard,
                            { backgroundColor: darkMode ? "#1A3F6F" : "#F5F5F5" }
                        ]}>
                            <Icon name="bar-chart" size={40} color={darkMode ? "#FFD700" : "#0A1F3A"} />
                            <Text style={[styles.featureTitle, { color: darkMode ? "#FFD700" : "#0A1F3A" }]}>
                                {t.statistics}
                            </Text>
                            <Text style={[styles.featureDescription, dynamicStyles.text]}>
                                {t.statisticsDesc}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Navigation Buttons */}
            <View style={[
                styles.bottomNavigation,
                { 
                    backgroundColor: darkMode ? "#0A1F3A" : "#FFFFFF",
                    borderTopColor: darkMode ? "#1A3F6F" : "#E0E0E0"
                }
            ]}>
                <TouchableOpacity 
                    style={[
                        styles.navButton,
                        { backgroundColor: darkMode ? "#1A3F6F" : "#0A1F3A" }
                    ]}
                    onPress={navigateToGestionProf}
                >
                    <Icon name="school" size={24} color="#FFF" />
                    <Text style={styles.navButtonText}>{t.professorManagementShort}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[
                        styles.navButton,
                        { backgroundColor: darkMode ? "#1A3F6F" : "#0A1F3A" }
                    ]}
                    onPress={navigateToGestionEtudiant}
                >
                    <Icon name="people" size={24} color="#FFF" />
                    <Text style={styles.navButtonText}>{t.studentManagementShort}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    menuButton: {
        borderRadius: 20,
        padding: 8,
        elevation: 5,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 3,
    },
    scroll: {
        padding: 20,
        minHeight: "100%",
    },
    homeContainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 20,
        paddingBottom: 100,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 30,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        zIndex: 2,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
    },
    glowEffect: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        top: -10,
        left: -10,
        zIndex: 1,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        letterSpacing: 2,
    },
    adminInfoText: {
        fontSize: 16,
        marginBottom: 5,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 30,
        textAlign: "center",
        letterSpacing: 1,
    },
    featuresContainer: {
        width: "100%",
    },
    featureCard: {
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
        marginVertical: 12,
        textAlign: "center",
    },
    featureDescription: {
        fontSize: 14,
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
        padding: 20,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        borderLeftWidth: 2,
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
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    adminAvatarText: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    adminInfo: {
        marginLeft: 15,
    },
    adminName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    adminEmail: {
        fontSize: 14,
        marginBottom: 5,
    },
    adminRoleBadge: {
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 10,
    },
    adminRole: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    menuDivider: {
        height: 1,
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
    menuText: {
        fontSize: 16,
        marginLeft: 15,
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
        borderTopWidth: 1,
        height: 80,
        paddingVertical: 10,
    },
    navButton: {
        flex: 1,
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