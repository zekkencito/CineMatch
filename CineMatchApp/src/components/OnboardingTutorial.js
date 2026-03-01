// Tutorial de onboarding guiado que navega entre las pantallas de la app.
// Muestra un overlay semi-transparente sobre cada pantalla con una card
// explicativa. Navega programaticamente entre tabs y pantallas para que
// el usuario vea la app real y entienda cada seccion.
// Se muestra una sola vez al registrarse, controlado por tutorialService.
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Platform,
    Dimensions,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faFilm,
    faXmark,
    faFaceSmile,
    faReply,
    faComment,
    faUser,
    faCamera,
    faPen,
    faMusic,
    faVideo,
    faLocationDot,
    faArrowDown,
    faArrowUp,
    faArrowLeft,
    faArrowRight,
    faCheck,
} from '@fortawesome/free-solid-svg-icons';
import colors from '../constants/colors';
import { tutorialService } from '../services/tutorialService';

const { width: SW, height: SH } = Dimensions.get('window');

// Pasos del tutorial. Cada paso tiene:
// - screen: tab de navegacion donde debe estar la app
// - navigate: pantalla adicional dentro del tab (opcional)
// - icon: icono FontAwesome para la card
// - title: titulo del paso
// - description: explicacion sin emojis
// - cardPosition: 'top' o 'bottom' - donde se muestra la card
// - arrowDirection: 'up', 'down', 'left', 'right' o null - flecha indicadora
const STEPS = [
    {
        screen: 'Amigos Palomeros',
        icon: faFilm,
        title: 'Pantalla de Palomeros',
        description:
            'Esta es la pantalla principal. Aqui aparecen las tarjetas de otros usuarios. Puedes deslizar cada tarjeta hacia la derecha para aceptar o hacia la izquierda para rechazar.',
        cardPosition: 'top',
        arrowDirection: 'down',
    },
    {
        screen: 'Amigos Palomeros',
        icon: faXmark,
        iconColor: colors.primary,
        title: 'Boton de rechazar',
        description:
            'El boton con la X sirve para rechazar un perfil. Es igual que deslizar la tarjeta hacia la izquierda. El otro usuario no sera notificado.',
        cardPosition: 'top',
        arrowDirection: 'down',
    },
    {
        screen: 'Amigos Palomeros',
        icon: faFaceSmile,
        iconColor: '#2ECC71',
        title: 'Boton de aceptar',
        description:
            'El boton con la carita sirve para aceptar un perfil. Es igual que deslizar la tarjeta hacia la derecha. Si ambos se aceptan, se genera un match y podran chatear.',
        cardPosition: 'top',
        arrowDirection: 'down',
    },
    {
        screen: 'Amigos Palomeros',
        icon: faReply,
        iconColor: '#ffd700',
        title: 'Deshacer swipe',
        description:
            'El boton dorado del centro permite deshacer tu ultimo swipe si te equivocaste. Esta funcion es exclusiva para usuarios con suscripcion premium.',
        cardPosition: 'top',
        arrowDirection: 'down',
    },
    {
        screen: 'Amigos de Butaca',
        icon: faComment,
        title: 'Amigos de Butaca',
        description:
            'En esta pestana encontraras la lista de personas con las que hiciste match. Puedes abrir una conversacion y chatear sobre peliculas, series y recomendaciones.',
        cardPosition: 'bottom',
        arrowDirection: null,
    },
    {
        screen: 'Perfil',
        icon: faCamera,
        title: 'Tu foto de perfil',
        description:
            'Para cambiar tu foto de perfil, toca directamente sobre tu imagen en la parte superior de esta pantalla. Se abrira la galeria de tu telefono para seleccionar una nueva foto.',
        cardPosition: 'bottom',
        arrowDirection: 'up',
    },
    {
        screen: 'Perfil',
        icon: faPen,
        title: 'Editar perfil',
        description:
            'Desde la opcion "Editar Perfil" puedes modificar tu nombre, edad y biografia. Esta informacion es visible para otros usuarios en las tarjetas.',
        cardPosition: 'bottom',
        arrowDirection: null,
    },
    {
        screen: 'Perfil',
        icon: faFilm,
        title: 'Preferencias de peliculas',
        description:
            'Dentro de "Preferencias de Peliculas" encontraras cuatro secciones que te permiten personalizar tu perfil cinematografico. Estas preferencias determinan la compatibilidad con otros usuarios.',
        cardPosition: 'bottom',
        arrowDirection: null,
    },
    {
        screen: 'Perfil',
        icon: faMusic,
        title: 'Seccion: Generos favoritos',
        description:
            'En la primera pestana de preferencias puedes seleccionar tus generos favoritos de peliculas: accion, comedia, drama, ciencia ficcion, terror, entre otros. Toca cada genero para activarlo o desactivarlo.',
        cardPosition: 'bottom',
        arrowDirection: null,
    },
    {
        screen: 'Perfil',
        icon: faVideo,
        title: 'Seccion: Directores favoritos',
        description:
            'En la segunda pestana puedes buscar y agregar tus directores de cine favoritos. Busca por nombre y agrega los que mas te gusten. Aparecen con su foto de perfil.',
        cardPosition: 'bottom',
        arrowDirection: null,
    },
    {
        screen: 'Perfil',
        icon: faFilm,
        title: 'Seccion: Peliculas vistas',
        description:
            'En la tercera pestana puedes buscar y agregar peliculas que has visto. El sistema usa esta informacion para encontrar personas con gustos similares y calcular la compatibilidad.',
        cardPosition: 'bottom',
        arrowDirection: null,
    },
    {
        screen: 'Perfil',
        icon: faLocationDot,
        title: 'Seccion: Radio de busqueda',
        description:
            'En la cuarta pestana configuras hasta que distancia quieres buscar otros usuarios. Puedes usar el GPS para actualizar tu ubicacion y ajustar el radio con el deslizador.',
        cardPosition: 'bottom',
        arrowDirection: null,
    },
    {
        screen: 'Amigos Palomeros',
        icon: faCheck,
        iconColor: '#2ECC71',
        title: 'Listo para comenzar',
        description:
            'Ya conoces todas las funciones de CineMatch. Desliza las tarjetas o usa los botones para encontrar personas con tus mismos gustos cinematograficos. Mucha suerte.',
        cardPosition: 'center',
        arrowDirection: null,
    },
];

const OnboardingTutorial = ({ visible, onFinish, navigation }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    // Animar la entrada de cada card al cambiar de paso
    useEffect(() => {
        if (!visible) return;
        fadeAnim.setValue(0);
        slideAnim.setValue(30);
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 350,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 50,
                useNativeDriver: true,
            }),
        ]).start();
    }, [currentStep, visible]);

    // Navegar a la pantalla correspondiente al paso actual
    useEffect(() => {
        if (!visible || !navigation) return;
        const step = STEPS[currentStep];
        if (step && step.screen) {
            try {
                navigation.navigate(step.screen);
            } catch (e) {
                // Silencioso si la navegacion falla
            }
        }
    }, [currentStep, visible, navigation]);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleFinish();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = async () => {
        // Volver a la pantalla principal al saltar
        if (navigation) {
            try { navigation.navigate('Amigos Palomeros'); } catch (e) { }
        }
        await tutorialService.markCompleted();
        setCurrentStep(0);
        onFinish();
    };

    const handleFinish = async () => {
        await tutorialService.markCompleted();
        setCurrentStep(0);
        onFinish();
    };

    const step = STEPS[currentStep];
    const isLast = currentStep === STEPS.length - 1;
    const isFirst = currentStep === 0;

    // Posicionar la card segun cardPosition
    const getCardStyle = () => {
        if (step.cardPosition === 'top') {
            return { top: Platform.OS === 'ios' ? 60 : 40 };
        }
        if (step.cardPosition === 'center') {
            return { top: SH * 0.25 };
        }
        // bottom
        return { bottom: Platform.OS === 'ios' ? 120 : 100 };
    };

    // Icono de flecha direccional
    const getArrowIcon = () => {
        switch (step.arrowDirection) {
            case 'up': return faArrowUp;
            case 'down': return faArrowDown;
            case 'left': return faArrowLeft;
            case 'right': return faArrowRight;
            default: return null;
        }
    };

    const arrowIcon = getArrowIcon();

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleSkip}>
            <View style={styles.overlay}>
                {/* Overlay oscuro semi-transparente (toque avanza al siguiente paso) */}
                <TouchableOpacity
                    style={styles.overlayTouch}
                    activeOpacity={1}
                    onPress={handleNext}
                />

                {/* Card explicativa */}
                <Animated.View
                    style={[
                        styles.card,
                        getCardStyle(),
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Icono del paso */}
                    <View style={[styles.iconCircle, { backgroundColor: step.iconColor || colors.primary }]}>
                        <FontAwesomeIcon
                            icon={step.icon}
                            size={28}
                            color={step.iconColor ? '#fff' : colors.textDark}
                        />
                    </View>

                    {/* Titulo */}
                    <Text style={styles.cardTitle}>{step.title}</Text>

                    {/* Descripcion */}
                    <Text style={styles.cardDesc}>{step.description}</Text>

                    {/* Flecha direccional (indica donde mirar) */}
                    {arrowIcon && (
                        <View style={styles.arrowContainer}>
                            <FontAwesomeIcon icon={arrowIcon} size={20} color={colors.primary} />
                        </View>
                    )}

                    {/* Pie: contador + botones */}
                    <View style={styles.cardFooter}>
                        <Text style={styles.stepCounter}>
                            {currentStep + 1} / {STEPS.length}
                        </Text>
                        <View style={styles.cardButtons}>
                            {!isFirst && (
                                <TouchableOpacity onPress={handlePrev} style={styles.prevBtn}>
                                    <Text style={styles.prevText}>Anterior</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
                                <Text style={styles.skipText}>Saltar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
                                <Text style={styles.nextText}>{isLast ? 'Comenzar' : 'Siguiente'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
    },
    overlayTouch: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
    },
    card: {
        position: 'absolute',
        left: 20,
        right: 20,
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 24,
        borderWidth: 2,
        borderColor: colors.primary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
        alignItems: 'center',
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: colors.primary,
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: 0.3,
    },
    cardDesc: {
        fontSize: 15,
        color: colors.text,
        textAlign: 'center',
        lineHeight: 23,
        fontWeight: '500',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    arrowContainer: {
        marginBottom: 12,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    cardFooter: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    stepCounter: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '700',
    },
    cardButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    prevBtn: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    prevText: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: '600',
    },
    skipBtn: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    skipText: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: '600',
    },
    nextBtn: {
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 10,
        backgroundColor: colors.primary,
    },
    nextText: {
        color: colors.textDark,
        fontSize: 13,
        fontWeight: '800',
    },
});

export default OnboardingTutorial;
