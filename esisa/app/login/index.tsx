import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        try {
            setLoading(true);

            const response = await fetch(`http://192.168.1.180:5000/api/login?email=${email}&password=${password}`);
            const userData = await response.json();

            if (!response.ok || !userData.role) {
                Alert.alert("Erreur", "Identifiants incorrects.");
                return;
            }

            // Sauvegarde du rôle
            if (userData.role === "admin") {
                await AsyncStorage.setItem("admin", JSON.stringify(userData));
                router.replace("/admin");
            } else if (userData.role === "student") {
                await AsyncStorage.setItem("user", JSON.stringify(userData));
                router.replace("/(tabs)");
            } else if (userData.role === "prof") {
                await AsyncStorage.setItem("prof", JSON.stringify(userData));
                router.replace("/prof");
            } else {
                Alert.alert("Erreur", "Rôle utilisateur inconnu.");
            }

        } catch (err) {
            console.error("Erreur de connexion :", err);
            Alert.alert("Erreur", "Connexion impossible au serveur.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFD700" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Icon name="arrow-back" size={28} color="#FFD700" />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.welcomeText}>BIENVENUE À</Text>
                    <Text style={styles.esisaText}>ESISA</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <Icon name="email" size={20} color="#FFD700" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#6D8EB4"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Icon name="lock" size={20} color="#FFD700" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Mot de passe"
                            placeholderTextColor="#6D8EB4"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.loginButtonText}>CONNEXION</Text>
                        <Icon name="arrow-forward" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>ESISA © 2023 - Tous droits réservés</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        top: 70,
        left: 20,
        zIndex: 1,
    },
    safeArea: {
        flex: 1,
        backgroundColor: "#0A1F3A",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0A1F3A",
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 50,
    },
    welcomeText: {
        fontSize: 18,
        color: "#6D8EB4",
        letterSpacing: 2,
    },
    esisaText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: "#FFD700",
        letterSpacing: 2,
        marginTop: 5,
    },
    formContainer: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#1A3F6F",
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: "#FFD700",
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        color: "#FFF",
        fontSize: 16,
    },
    loginButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#4B72FF",
        paddingVertical: 15,
        borderRadius: 25,
        marginTop: 20,
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 3,
        elevation: 5,
    },
    loginButtonText: {
        color: "#FFF",
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 10,
        letterSpacing: 1,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    },
    footerText: {
        color: "#6D8EB4",
        fontSize: 12,
    },
});

export default LoginScreen;
