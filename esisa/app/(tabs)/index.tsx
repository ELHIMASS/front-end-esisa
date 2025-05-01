import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Modal,
    Pressable,
    SafeAreaView,
    useWindowDimensions,
    Image
} from "react-native";
import { Icon } from "react-native-elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ESISAHomePage() {
    const [isMenuVisible, setMenuVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(300)).current;
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();

    // Configuration du laser code-trail
    const codeSegments = 15; // Nombre de segments pour représenter du "code qui se déplace"
    const [codeTrailPosition, setCodeTrailPosition] = useState([]);
    const directionRef = useRef({ x: 1, y: 0 }); // Direction initiale avec useRef
    const animationSpeed = 120; // Vitesse de déplacement en ms
    const segmentSize = 12; // Taille d'un segment

    // Symboles de code à afficher dans les segments
    const codeSymbols = ["{", "}", "(", ")", ";", "<>", "[]", "//", "=>", "&&", "||", "+=", "==", "++"];
    const [segmentSymbols, setSegmentSymbols] = useState([]);

    // Initialisation du code-trail
    useEffect(() => {
        // Position initiale au centre
        const initialX = Math.floor(width / 2);
        const initialY = Math.floor(height / 3);

        // Créer les segments initiaux
        const initialPositions = [];
        const initialSymbols = [];

        for (let i = 0; i < codeSegments; i++) {
            initialPositions.push({
                x: initialX - (i * segmentSize),
                y: initialY
            });

            // Assigner un symbole aléatoire à chaque segment
            initialSymbols.push(codeSymbols[Math.floor(Math.random() * codeSymbols.length)]);
        }

        setCodeTrailPosition(initialPositions);
        setSegmentSymbols(initialSymbols);

        // Démarrer l'animation
        const intervalId = setInterval(() => moveCodeTrail(), animationSpeed);

        return () => clearInterval(intervalId);
    }, [width, height]);

    // Logique de mouvement du code-trail
    const moveCodeTrail = () => {
        setCodeTrailPosition(prevPositions => {
            if (!prevPositions || prevPositions.length === 0) {
                return prevPositions;
            }

            const newPositions = [...prevPositions];

            if (!newPositions[0]) return prevPositions;

            const head = {
                x: newPositions[0].x,
                y: newPositions[0].y
            };

            // Changer de direction avec zones d'attraction vers le centre
            // Plus le snake s'éloigne du centre, plus il a de chances d'y retourner
            const centerX = width / 2;
            const centerY = height / 2;
            const distanceFromCenter = Math.sqrt(
                Math.pow(head.x - centerX, 2) + Math.pow(head.y - centerY, 2)
            );

            // Probabilité de changement de direction augmente avec la distance
            const changeDirectionProb = Math.min(0.15, 0.05 + (distanceFromCenter / (width + height)) * 0.2);

            if (Math.random() < changeDirectionProb) {
                // Tendance à revenir vers le centre
                let preferredX = head.x < centerX ? 1 : -1;
                let preferredY = head.y < centerY ? 1 : -1;

                // Directions possibles avec préférence pour retourner au centre
                let directions = [];

                // Ajouter des directions avec une pondération selon la préférence
                // Plus de chances d'aller vers le centre
                for (let i = 0; i < 3; i++) directions.push({ x: preferredX, y: 0 });
                for (let i = 0; i < 3; i++) directions.push({ x: 0, y: preferredY });

                // Ajouter aussi d'autres directions avec moins de probabilité
                directions.push({ x: -preferredX, y: 0 });
                directions.push({ x: 0, y: -preferredY });

                // Filtrer pour éviter un demi-tour complet
                const validDirections = directions.filter(dir =>
                    !(dir.x === -directionRef.current.x && dir.y === -directionRef.current.y)
                );

                // Choisir une direction
                const newDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
                directionRef.current = newDirection;

                // Changer le symbole de la tête quand on change de direction
                setSegmentSymbols(prevSymbols => {
                    const newSymbols = [...prevSymbols];
                    newSymbols[0] = codeSymbols[Math.floor(Math.random() * codeSymbols.length)];
                    return newSymbols;
                });
            }

            // Calculer la nouvelle position de la tête
            head.x = head.x + directionRef.current.x * segmentSize;
            head.y = head.y + directionRef.current.y * segmentSize;

            // Rebondir sur les bords de l'écran
            if (head.x < 0) {
                head.x = 0;
                directionRef.current = { x: 1, y: directionRef.current.y };
            }
            if (head.x > width - segmentSize) {
                head.x = width - segmentSize;
                directionRef.current = { x: -1, y: directionRef.current.y };
            }
            if (head.y < 0) {
                head.y = 0;
                directionRef.current = { x: directionRef.current.x, y: 1 };
            }
            if (head.y > height - segmentSize) {
                head.y = height - segmentSize;
                directionRef.current = { x: directionRef.current.x, y: -1 };
            }

            // Ajouter la nouvelle tête et supprimer la queue
            newPositions.unshift(head);
            if (newPositions.length > codeSegments) {
                newPositions.pop();
            }

            return newPositions;
        });
    };

    const toggleMenu = () => {
        if (isMenuVisible) {
            Animated.timing(slideAnim, {
                toValue: width * 0.75,
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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#0A1F3A" }}>
            {/* Code Trail */}
            {codeTrailPosition && codeTrailPosition.map((segment, index) => (
                segment && (
                    <View
                        key={`segment-${index}`}
                        style={[
                            styles.codeSegment,
                            {
                                left: segment.x,
                                top: segment.y,
                                opacity: 1 - (index / codeSegments * 0.6),
                                width: segmentSize,
                                height: segmentSize,
                            },
                        ]}
                    >
                        <Text style={styles.codeSymbol}>
                            {segmentSymbols[index] || "{}"}
                        </Text>
                    </View>
                )
            ))}

            {/* Menu Button */}
            <TouchableOpacity
                onPress={toggleMenu}
                style={{
                    position: "absolute",
                    top: insets.top + 10,
                    right: 20,
                    zIndex: 10,
                    backgroundColor: "#1A3F6F",
                    borderRadius: 20,
                    padding: 10,
                }}
            >
                <Icon name="menu" size={30} color="#FFD700" />
            </TouchableOpacity>

            {/* Logo de l'université */}
            <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                    <Text style={styles.logoText}>ESISA</Text>
                </View>
                <View style={styles.glowEffect} />
            </View>

            {/* Contenu principal */}
            <View style={styles.mainContent}>
                <Text style={styles.welcomeText}>École Supérieure d'Ingénierie en Sciences Appliquées</Text>
                <Text style={styles.subText}>Formation d'excellence en développement et sciences informatiques</Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.buttonText}>FORMATIONS</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.buttonText}>ADMISSION</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Drawer Menu */}
            <Modal
                visible={isMenuVisible}
                transparent={true}
                animationType="none"
                onRequestClose={toggleMenu}
            >
                <Pressable style={styles.modalBackgroundRight} onPress={toggleMenu}>
                    <Animated.View
                        style={[
                            styles.menuDrawerRight,
                            { transform: [{ translateX: slideAnim }] },
                        ]}
                    >
                        <View style={styles.menuHeader}>
                            <Text style={styles.menuHeaderText}>ESISA</Text>
                        </View>

                        {[
                            { label: "🏠 Accueil", route: "#" },
                            { label: "🎓 Formations", route: "#" },
                            { label: "👨‍🏫 Corps enseignant", route: "#" },
                            { label: "📚 Programmes", route: "#" },
                            { label: "🔬 Laboratoires", route: "#" },
                            { label: "🌐 International", route: "#" },
                            { label: "📅 Calendrier", route: "#" },
                            { label: "🏢 Campus", route: "#" },
                            { label: "📞 Contact", route: "#" },
                        ].map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.menuItem}
                                onPress={toggleMenu}
                            >
                                <Text style={styles.menuText}>{item.label}</Text>
                                <Icon name="chevron-right" size={20} color="#FFD700" />
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={[
                                styles.menuItem,
                                { borderTopWidth: 1, borderTopColor: "#1A3F6F", marginTop: 20 },
                            ]}
                        >
                            <Text style={[styles.menuText, { color: "#4CAF50" }]}>
                                🔑 Espace étudiant
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    codeSegment: {
        position: "absolute",
        backgroundColor: "rgba(0, 150, 255, 0.2)",
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#36D7B7",
        shadowColor: "#36D7B7",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 5,
    },
    codeSymbol: {
        color: "#36D7B7",
        fontSize: 8,
        fontWeight: "bold",
    },
    logoContainer: {
        position: "absolute",
        top: 80,
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 5,
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#1A3F6F",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#FFD700",
    },
    logoText: {
        fontSize: 34,
        fontWeight: "bold",
        color: "#FFD700",
    },
    glowEffect: {
        position: "absolute",
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: "#FFD700",
        opacity: 0.3,
        top: -10,
    },
    mainContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 150,
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFF",
        textAlign: "center",
        marginBottom: 10,
    },
    subText: {
        fontSize: 16,
        color: "#BBB",
        marginBottom: 40,
        textAlign: "center",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        marginTop: 20,
    },
    actionButton: {
        backgroundColor: "#1A3F6F",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#36D7B7",
        minWidth: 150,
        alignItems: "center",
    },
    buttonText: {
        color: "#FFF",
        fontWeight: "bold",
    },
    modalBackgroundRight: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
        flexDirection: "row",
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
        fontWeight: "bold",
        textAlign: "center",
        letterSpacing: 1,
    },
    menuItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderColor: "#1A3F6F",
    },
    menuText: {
        fontSize: 16,
        color: "#FFF",
    },
});