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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Icon } from "react-native-elements";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfilScreen() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isMenuVisible, setMenuVisible] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const slideAnim = useState(new Animated.Value(300))[0];

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
        await AsyncStorage.multiRemove(["user", "prof", "admin"]);
        setIsLoggedIn(false);
        setUser(null);
        router.replace("/login");
    };

    const menuItems = isLoggedIn
        ? [
              { label: "🏠 Accueil", route: "/(tabs)/index" },
              { label: "👤 Profil", route: "/explore" },
              { label: "🎓 Formations", route: "/other/formation" },
              { label: "👨‍🏫 Corps enseignant", route: "#" },
              { label: "📚 Programmes", route: "#" },
              { label: "🔬 Laboratoires", route: "#" },
              { label: "🌐 International", route: "/other/international" },
              { label: "📅 Calendrier", route: "/other/calendrier" },
              { label: "🏢 Campus", route: "#" },
              { label: "📞 Contact", route: "#" },
              { label: "🔓 Déconnexion", route: "/", onPress: handleLogout },
          ]
        : [];

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: "#0A1F3A" }]}>
                <ActivityIndicator size="large" color="#FFD700" />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={[styles.center, { backgroundColor: "#0A1F3A" }]}>
                <Text style={{ color: "#FF5555" }}>Utilisateur non trouvé</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#0A1F3A" }}>
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
                            <Text style={styles.menuHeaderText}>MENU</Text>
                        </View>

                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.menuItem,
                                    item.label.includes("Déconnexion") && {
                                        borderTopWidth: 1,
                                        borderTopColor: "#1A3F6F",
                                    },
                                ]}
                                onPress={() => {
                                    toggleMenu();
                                    if (item.onPress) item.onPress();
                                    else router.replace(item.route);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.menuText,
                                        item.label.includes("Déconnexion") && {
                                            color: "#FF5555",
                                        },
                                    ]}
                                >
                                    {item.label}
                                </Text>
                                <Icon name="chevron-right" size={20} color="#FFD700" />
                            </TouchableOpacity>
                        ))}
                    </Animated.View>
                </Pressable>
            </Modal>

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

                <Text style={styles.title}>BIENVENUE, {user.name.toUpperCase()} 👋</Text>
                <Text style={styles.subtitle}>VOS INFORMATIONS DE PROFILE</Text>

                <View style={styles.infoContainer}>
                    <View style={styles.infoBox}>
                        <Icon name="email" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>Email :</Text>
                            <Text style={styles.value}>{user.email}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Icon name="person" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>Âge :</Text>
                            <Text style={styles.value}>{user.age}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Icon name="school" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>Filière :</Text>
                            <Text style={styles.value}>{user.major}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Icon name="calendar-today" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>Année scolaire :</Text>
                            <Text style={styles.value}>{user.anne_scolaire}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Icon name="cake" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>Date de naissance :</Text>
                            <Text style={styles.value}>{user.date}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Icon name="group" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>Groupe :</Text>
                            <Text style={styles.value}>{user.group}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Icon name="wc" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>Sexe :</Text>
                            <Text style={styles.value}>{user.sex}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Icon name="phone" size={20} color="#FFD700" />
                        <View style={styles.infoContent}>
                            <Text style={styles.label}>Téléphone :</Text>
                            <Text style={styles.value}>{user.tel}</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutText}>SE DÉCONNECTER</Text>
                    <Icon name="logout" size={20} color="#FFF" />
                </TouchableOpacity>
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
    },
    menuHeader: {
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#1A3F6F",
        marginBottom: 20,
    },
    menuHeaderText: {
        color: "#FFD700",
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 1,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderColor: "#1A3F6F",
    },
    menuText: {
        fontSize: 16,
        color: "#FFF",
    },
});
