import React, { useEffect, useState, useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Icon } from "react-native-elements";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// Contexte pour Dark Mode et Langue
import { DarkModeContext } from "../context/DarkModeContext";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../utils/transactions";

export default function ProfilScreen() {
    const { darkMode } = useContext(DarkModeContext);
    const { language } = useContext(LanguageContext);
    const t = translations[language];

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const checkLoginStatus = async () => {
            const student = await AsyncStorage.getItem("user");
            const prof = await AsyncStorage.getItem("prof");
            const admin = await AsyncStorage.getItem("admin");

            let userParsed = null;
            if (student) userParsed = JSON.parse(student);
            else if (prof) userParsed = JSON.parse(prof);
            else if (admin) userParsed = JSON.parse(admin);

            if (userParsed) {
                setUser(userParsed);
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
                setUser(null);
                router.replace("/login");
            }

            setLoading(false);
        };

        checkLoginStatus();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.multiRemove(["user", "prof", "admin"]);
        setIsLoggedIn(false);
        setUser(null);
        router.replace("/login");
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: darkMode ? "#0A1F3A" : "#FFF" }]}>
                <ActivityIndicator size="large" color="#FFD700" />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={[styles.center, { backgroundColor: darkMode ? "#0A1F3A" : "#FFF" }]}>
                <Text style={{ color: "#FF5555" }}>Utilisateur non trouvé</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, darkMode ? styles.darkContainer : styles.lightContainer]}>
            {/* Flèche vers (tabs) */}
            <TouchableOpacity
                onPress={() => router.replace("/(tabs)")}
                style={[styles.menuButton, { backgroundColor: darkMode ? "#1A3F6F" : "#ddd" }]}
            >
                <Icon name="arrow-back" size={30} color={darkMode ? "#FFD700" : "#000"} />
            </TouchableOpacity>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                         {user.name.split(' ').map((item: string) => (item[0].toUpperCase()))}
                        </Text>
                    </View>
                    <View style={styles.glowEffect} />
                </View>

                <Text style={[styles.title, { color: darkMode ? "#FFD700" : "white" }]}>
                    {t.welcome}, {user.name.toUpperCase()} ??
                </Text>
                <Text style={[styles.subtitle, { color: darkMode ? "#DDD" : "#444" }]}>
                    {t.profileInfo}
                </Text>

                <View style={styles.infoContainer}>
                    <View style={styles.infoBox}>
                        <Icon name="email" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>{t.email} :</Text>
                            <Text style={styles.value}>{user.email}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Icon name="person" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>{t.age} :</Text>
                            <Text style={styles.value}>{user.age}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Icon name="school" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>{t.major} :</Text>
                            <Text style={styles.value}>{user.major}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Icon name="calendar-today" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>{t.schoolYear} :</Text>
                            <Text style={styles.value}>{user.anne_scolaire}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Icon name="cake" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>{t.birthDate} :</Text>
                            <Text style={styles.value}>{user.date}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Icon name="group" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>{t.group} :</Text>
                            <Text style={styles.value}>{user.group}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Icon name="wc" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>{t.gender} :</Text>
                            <Text style={styles.value}>{user.sex}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Icon name="phone" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>{t.phone} :</Text>
                            <Text style={styles.value}>{user.tel}</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutText}>{t.logout}</Text>
                    <Icon name="logout" size={20} color="#FFF" />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    menuButton: {
        position: 'absolute',
        top: 60,
        left: 20, // Flèche à gauche
        padding: 10,
        borderRadius: 50,
        zIndex: 1000,
    },
    container: {
        flex: 1,
    },
    darkContainer: {
        backgroundColor: "#0A1F3A",
    },
    lightContainer: {
        backgroundColor: "#FFF",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scroll: {
        padding: 20,
        alignItems: "center",
        backgroundColor: "#0A1F3A",
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
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 5,
        textAlign: "center",
        color: "#FFD700",
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 30,
        textAlign: "center",
        color: "#6D8EB4",
        letterSpacing: 1,
    },
    infoContainer: {
        width: '100%',
        marginBottom: 20,
    },
    infoBox: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        padding: 15,
        marginBottom: 10,
        backgroundColor: "#1A3F6F",
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: "#FFD700",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    infoContent: {
        flex: 1,
        marginLeft: 15,
    },
    label: {
        fontWeight: "bold",
        color: "#6D8EB4",
        fontSize: 12,
        marginBottom: 3,
    },
    value: {
        color: "#FFF",
        fontSize: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: "#D32F2F",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#FF5555",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 3,
        elevation: 5,
        width: '80%',
    },import React, { useEffect, useState, useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Icon } from "react-native-elements";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// Contexte pour Dark Mode et Langue
import { DarkModeContext } from "../context/DarkModeContext";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../utils/transactions";

export default function ProfilScreen() {
    const { darkMode } = useContext(DarkModeContext);
    const { language } = useContext(LanguageContext);
    const t = translations[language];

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const checkLoginStatus = async () => {
            const student = await AsyncStorage.getItem("user");
            const prof = await AsyncStorage.getItem("prof");
            const admin = await AsyncStorage.getItem("admin");

            let userParsed = null;
            if (student) userParsed = JSON.parse(student);
            else if (prof) userParsed = JSON.parse(prof);
            else if (admin) userParsed = JSON.parse(admin);

            if (userParsed) {
                setUser(userParsed);
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
                setUser(null);
                router.replace("/login");
            }

            setLoading(false);
        };

        checkLoginStatus();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.multiRemove(["user", "prof", "admin"]);
        setIsLoggedIn(false);
        setUser(null);
        router.replace("/login");
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: darkMode ? "#0A1F3A" : "#FFF" }]}>
                <ActivityIndicator size="large" color="#FFD700" />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={[styles.center, { backgroundColor: darkMode ? "#0A1F3A" : "#FFF" }]}>
                <Text style={{ color: "#FF5555" }}>Utilisateur non trouvé</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, darkMode ? styles.darkContainer : styles.lightContainer]}>
            {/* Flèche vers (tabs) */}
            <TouchableOpacity
                onPress={() => router.replace("/(tabs)")}
                style={[styles.menuButton, { backgroundColor: darkMode ? "#1A3F6F" : "#ddd" }]}
            >
                <Icon name="arrow-back" size={30} color={darkMode ? "#FFD700" : "#000"} />
            </TouchableOpacity>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                         {user.name.split(' ').map((item: string) => (item[0].toUpperCase()))}
                        </Text>
                    </View>
                    <View style={styles.glowEffect} />
                </View>

                <Text style={[styles.title, { color: darkMode ? "#FFD700" : "white" }]}>
                    {t.welcome}, {user.name.toUpperCase()} 👋
                </Text>
                <Text style={[styles.subtitle, { color: darkMode ? "#DDD" : "#444" }]}>
                    {t.profileInfo}
                </Text>

                <View style={styles.infoContainer}>
                    <View style={styles.infoBox}>
                        <Icon name="email" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>{t.email} :</Text>
                            <Text style={styles.value}>{user.email}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Icon name="person" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>{t.age} :</Text>
                            <Text style={styles.value}>{user.age}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Icon name="school" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>{t.major} :</Text>
                            <Text style={styles.value}>{user.major}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Icon name="calendar-today" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>{t.schoolYear} :</Text>
                            <Text style={styles.value}>{user.anne_scolaire}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Icon name="cake" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>{t.birthDate} :</Text>
                            <Text style={styles.value}>{user.date}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Icon name="group" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>{t.group} :</Text>
                            <Text style={styles.value}>{user.group}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Icon name="wc" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>{t.gender} :</Text>
                            <Text style={styles.value}>{user.sex}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Icon name="phone" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>{t.phone} :</Text>
                            <Text style={styles.value}>{user.tel}</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutText}>{t.logout}</Text>
                    <Icon name="logout" size={20} color="#FFF" />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    menuButton: {
        position: 'absolute',
        top: 60,
        left: 20, // Flèche à gauche
        padding: 10,
        borderRadius: 50,
        zIndex: 1000,
    },
    container: {
        flex: 1,
    },
    darkContainer: {
        backgroundColor: "#0A1F3A",
    },
    lightContainer: {
        backgroundColor: "#FFF",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scroll: {
        padding: 20,
        alignItems: "center",
        backgroundColor: "#0A1F3A",
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
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 5,
        textAlign: "center",
        color: "#FFD700",
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 30,
        textAlign: "center",
        color: "#6D8EB4",
        letterSpacing: 1,
    },
    infoContainer: {
        width: '100%',
        marginBottom: 20,
    },
    infoBox: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        padding: 15,
        marginBottom: 10,
        backgroundColor: "#1A3F6F",
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: "#FFD700",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    infoContent: {
        flex: 1,
        marginLeft: 15,
    },
    label: {
        fontWeight: "bold",
        color: "#6D8EB4",
        fontSize: 12,
        marginBottom: 3,
    },
    value: {
        color: "#FFF",
        fontSize: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: "#D32F2F",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#FF5555",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 3,
        elevation: 5,
        width: '80%',
    },
    logoutText: {
        color: "#fff",
        fontWeight: "bold",
        marginRight: 10,
        letterSpacing: 1,
    },
});