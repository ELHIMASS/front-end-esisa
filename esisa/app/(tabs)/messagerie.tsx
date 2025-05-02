import React, { useEffect, useState, useRef } from "react";
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
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Icon } from "react-native-elements";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// Types pour le système de messagerie
type Message = {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    timestamp: number;
    channelId: string;
};

type Channel = {
    id: string;
    name: string;
    type: "GROUP" | "LEVEL" | "PROF" | "ADMIN";
    participants: string[];
};

export default function MessagerieScreen() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isMenuVisible, setMenuVisible] = useState(false);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState("");
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const slideAnim = useState(new Animated.Value(300))[0]; // Départ à droite
    const messagesScrollRef = useRef<ScrollView>(null);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const stored = await AsyncStorage.getItem("user");

                if (!stored) {
                    console.log("❌ Pas d'utilisateur connecté, redirection...");
                    router.replace("/login");
                    return;
                }

                const parsed = JSON.parse(stored);
                setUser(parsed);
                fetchChannels(parsed);
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

    // Mock fetch channels function
    const fetchChannels = async (userData: any) => {
        // Dans une vraie application, ceci serait un appel API au backend
        
        // Channels adaptés en fonction du type d'utilisateur (étudiant/prof/admin)
        const mockChannels: Channel[] = [];
        
        if (userData.role === "student") {
            // Canal du groupe spécifique de l'étudiant
            mockChannels.push({
                id: "group-" + userData.group,
                name: `Groupe ${userData.group}`,
                type: "GROUP",
                participants: ["all-group-" + userData.group]
            });
            
            // Canal de tous les étudiants du même niveau
            mockChannels.push({
                id: "level-" + userData.anne_scolaire,
                name: `${userData.anne_scolaire}ème Année`,
                type: "LEVEL",
                participants: ["all-level-" + userData.anne_scolaire]
            });
        } else if (userData.role === "professor") {
            // Canal pour tous les professeurs
            mockChannels.push({
                id: "professors",
                name: "Professeurs",
                type: "PROF",
                participants: ["all-professors"]
            });
            
            // Canal pour l'administration
            mockChannels.push({
                id: "admin-communication",
                name: "Administration",
                type: "ADMIN",
                participants: ["all-admins", "all-professors"]
            });

            // Un canal par groupe que le professeur enseigne
            if (userData.teaching_groups) {
                userData.teaching_groups.forEach((group: string) => {
                    mockChannels.push({
                        id: "teaching-" + group,
                        name: `Classe ${group}`,
                        type: "GROUP",
                        participants: ["teacher", "all-group-" + group]
                    });
                });
            }
        } else if (userData.role === "admin") {
            // Canal pour l'administration
            mockChannels.push({
                id: "admin-only",
                name: "Administration",
                type: "ADMIN",
                participants: ["all-admins"]
            });
            
            // Canal pour communiquer avec tous les professeurs
            mockChannels.push({
                id: "professors-admin",
                name: "Professeurs",
                type: "PROF",
                participants: ["all-professors", "all-admins"]
            });
            
            // Canal pour tous les niveaux
            const levels = ["1", "2", "3", "4", "5"];
            levels.forEach(level => {
                mockChannels.push({
                    id: "admin-level-" + level,
                    name: `${level}ème Année`,
                    type: "LEVEL",
                    participants: ["admin", "all-level-" + level]
                });
            });
        }
        
        setChannels(mockChannels);
        
        // Définir le canal actif par défaut (le premier)
        if (mockChannels.length > 0) {
            setActiveChannel(mockChannels[0]);
            fetchMessages(mockChannels[0].id);
        }
    };

    // Mock fetch messages function
    const fetchMessages = async (channelId: string) => {
        setLoadingMessages(true);
        
        // Simuler un délai de chargement
        setTimeout(() => {
            // Dans une vraie application, ceci serait un appel API
            const mockMessages: Message[] = [
                {
                    id: "1",
                    text: "Bonjour à tous! Comment allez-vous aujourd'hui?",
                    senderId: "prof1",
                    senderName: "Prof. Dupont",
                    timestamp: Date.now() - 3600000,
                    channelId
                },
                {
                    id: "2",
                    text: "Tout va bien, merci! J'avais une question concernant le cours de la semaine dernière.",
                    senderId: "student1",
                    senderName: "Emma Martin",
                    timestamp: Date.now() - 3500000,
                    channelId
                },
                {
                    id: "3",
                    text: "Les évaluations seront-elles publiées avant la fin de la semaine?",
                    senderId: "student2",
                    senderName: "Thomas Leclerc",
                    timestamp: Date.now() - 3400000,
                    channelId
                },
                {
                    id: "4",
                    text: "Oui, les notes seront disponibles vendredi au plus tard.",
                    senderId: "prof1",
                    senderName: "Prof. Dupont",
                    timestamp: Date.now() - 3300000,
                    channelId
                },
                {
                    id: "5",
                    text: "N'oubliez pas de rendre vos devoirs avant demain midi!",
                    senderId: "prof1",
                    senderName: "Prof. Dupont",
                    timestamp: Date.now() - 1800000,
                    channelId
                },
                {
                    id: "6",
                    text: "Est-ce qu'on peut envoyer par e-mail ou uniquement via la plateforme?",
                    senderId: user?.id || "current-user",
                    senderName: user?.name || "Vous",
                    timestamp: Date.now() - 900000,
                    channelId
                },
            ];
            
            setMessages(mockMessages);
            setLoadingMessages(false);
            
            // Faire défiler jusqu'au dernier message
            setTimeout(() => {
                messagesScrollRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }, 1000);
    };

    // Fonction pour envoyer un message
    const sendMessage = async () => {
        if (!messageText.trim() || !activeChannel) return;
        
        // Dans une vraie application, ceci serait un appel API pour envoyer le message
        const newMessage: Message = {
            id: Date.now().toString(),
            text: messageText,
            senderId: user?.id || "current-user",
            senderName: user?.name || "Vous",
            timestamp: Date.now(),
            channelId: activeChannel.id
        };
        
        // Ajouter le message localement
        setMessages(prevMessages => [...prevMessages, newMessage]);
        setMessageText("");
        
        // Faire défiler jusqu'au nouveau message
        setTimeout(() => {
            messagesScrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
        
        // Ici, vous appelleriez votre API pour sauvegarder le message dans la base de données
        console.log("Message envoyé:", newMessage);
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
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
        await AsyncStorage.removeItem("user");
        setUser(null);
        router.replace("/login");
    };

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
                            <Text style={styles.menuHeaderText}>MENU</Text>
                        </View>

                        {[
                            { label: "🏠 Accueil", route: "/(tabs)/index" },
                            { label: "👤 Profil", route: "/profil" },
                            { label: "📄 Documents", route: "#" },
                            { label: "📆 Réservations", route: "#" },
                        ].map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.menuItem}
                                onPress={() => {
                                    toggleMenu();
                                    router.push(item.route);
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

            {/* Main Content */}
            <View style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Icon name="chat" size={24} color="#FFD700" />
                        <Text style={styles.headerTitle}>MESSAGERIE</Text>
                    </View>
                </View>

                {/* Channels List */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.channelsContainer}
                >
                    {channels.map((channel) => (
                        <TouchableOpacity
                            key={channel.id}
                            style={[
                                styles.channelItem,
                                activeChannel?.id === channel.id && styles.activeChannelItem
                            ]}
                            onPress={() => {
                                setActiveChannel(channel);
                                fetchMessages(channel.id);
                            }}
                        >
                            <View style={styles.channelIconContainer}>
                                <Icon 
                                    name={
                                        channel.type === "GROUP" ? "group" :
                                        channel.type === "LEVEL" ? "school" :
                                        channel.type === "PROF" ? "history-edu" : "admin-panel-settings"
                                    } 
                                    size={20} 
                                    color={activeChannel?.id === channel.id ? "#FFD700" : "#6D8EB4"} 
                                />
                            </View>
                            <Text 
                                style={[
                                    styles.channelName,
                                    activeChannel?.id === channel.id && styles.activeChannelName
                                ]}
                                numberOfLines={1}
                            >
                                {channel.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Messages Section */}
                <View style={styles.messagesContainer}>
                    {loadingMessages ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#FFD700" />
                        </View>
                    ) : (
                        <KeyboardAvoidingView
                            style={{ flex: 1 }}
                            behavior={Platform.OS === "ios" ? "padding" : undefined}
                            keyboardVerticalOffset={100}
                        >
                            <ScrollView 
                                ref={messagesScrollRef}
                                style={styles.messagesList}
                                contentContainerStyle={styles.messagesListContent}
                            >
                                {messages.length === 0 ? (
                                    <View style={styles.noMessagesContainer}>
                                        <Icon name="chat-bubble-outline" size={50} color="#1A3F6F" />
                                        <Text style={styles.noMessagesText}>
                                            Aucun message dans ce canal
                                        </Text>
                                        <Text style={styles.noMessagesSubText}>
                                            Soyez le premier à envoyer un message!
                                        </Text>
                                    </View>
                                ) : (
                                    messages.map((msg) => {
                                        const isOwnMessage = msg.senderId === user?.id || msg.senderId === "current-user";
                                        
                                        return (
                                            <View 
                                                key={msg.id}
                                                style={[
                                                    styles.messageWrapper,
                                                    isOwnMessage ? styles.ownMessageWrapper : {}
                                                ]}
                                            >
                                                <View 
                                                    style={[
                                                        styles.messageBubble,
                                                        isOwnMessage ? styles.ownMessageBubble : {}
                                                    ]}
                                                >
                                                    {!isOwnMessage && (
                                                        <Text style={styles.messageSender}>
                                                            {msg.senderName}
                                                        </Text>
                                                    )}
                                                    <Text style={styles.messageText}>
                                                        {msg.text}
                                                    </Text>
                                                    <Text style={styles.messageTime}>
                                                        {formatTime(msg.timestamp)}
                                                    </Text>
                                                </View>
                                            </View>
                                        );
                                    })
                                )}
                            </ScrollView>

                            {/* Message Input */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={messageText}
                                    onChangeText={setMessageText}
                                    placeholder="Tapez votre message..."
                                    placeholderTextColor="#6D8EB4"
                                    multiline
                                />
                                <TouchableOpacity 
                                    style={styles.sendButton}
                                    onPress={sendMessage}
                                    disabled={!messageText.trim()}
                                >
                                    <Icon 
                                        name="send" 
                                        size={20} 
                                        color={messageText.trim() ? "#FFD700" : "#6D8EB4"} 
                                    />
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    )}
                </View>
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
    container: {
        flex: 1,
        backgroundColor: "#0A1F3A",
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#1A3F6F",
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFD700",
        marginLeft: 10,
        letterSpacing: 1,
    },
    channelsContainer: {
        paddingHorizontal: 10,
        paddingVertical: 15,
        backgroundColor: "#0E2443",
    },
    channelItem: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: "#1A3F6F",
        borderRadius: 20,
        marginHorizontal: 5,
        flexDirection: "row",
        alignItems: "center",
        minWidth: 120,
        maxWidth: 170,
    },
    activeChannelItem: {
        backgroundColor: "#2A4F7F",
        borderColor: "#FFD700",
        borderWidth: 1,
    },
    channelIconContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#0A1F3A",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    channelName: {
        color: "#6D8EB4",
        fontWeight: "600",
        flex: 1,
    },
    activeChannelName: {
        color: "#FFD700",
    },
    messagesContainer: {
        flex: 1,
        backgroundColor: "#0A1F3A",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    messagesList: {
        flex: 1,
    },
    messagesListContent: {
        padding: 15,
        paddingBottom: 20,
    },
    noMessagesContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 50,
    },
    noMessagesText: {
        color: "#6D8EB4",
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 10,
    },
    noMessagesSubText: {
        color: "#6D8EB4",
        fontSize: 12,
        marginTop: 5,
    },
    messageWrapper: {
        marginBottom: 15,
        maxWidth: "80%",
        alignSelf: "flex-start",
    },
    ownMessageWrapper: {
        alignSelf: "flex-end",
    },
    messageBubble: {
        backgroundColor: "#1A3F6F",
        borderRadius: 15,
        padding: 12,
        borderTopLeftRadius: 0,
    },
    ownMessageBubble: {
        backgroundColor: "#2A4F7F",
        borderTopRightRadius: 0,
        borderTopLeftRadius: 15,
    },
    messageSender: {
        color: "#FFD700",
        fontWeight: "600",
        fontSize: 12,
        marginBottom: 3,
    },
    messageText: {
        color: "#FFF",
        fontSize: 14,
    },
    messageTime: {
        color: "#6D8EB4",
        fontSize: 10,
        alignSelf: "flex-end",
        marginTop: 3,
    },
    inputContainer: {
        flexDirection: "row",
        padding: 10,
        backgroundColor: "#0E2443",
        borderTopWidth: 1,
        borderTopColor: "#1A3F6F",
        alignItems: "center",
    },
    input: {
        flex: 1,
        backgroundColor: "#1A3F6F",
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        color: "#FFF",
        maxHeight: 100,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1A3F6F",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
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