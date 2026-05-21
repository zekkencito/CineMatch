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
            'Esta es la pantalla principal. Aquí aparecen las tarjetas de otros usuarios. Puedes deslizar cada tarjeta hacia la derecha para aceptar o hacia la izquierda para rechazar.',
        cardPosition: 'top',
        arrowDirection: 'down',
    },
    {
        screen: 'Amigos Palomeros',
        icon: faXmark,
        iconColor: colors.primary,
        title: 'Botón de rechazar',
        description:
            'El botón con la X sirve para rechazar un perfil. Es igual que deslizar la tarjeta hacia la izquierda. El otro usuario no será notificado.',
        cardPosition: 'top',
        arrowDirection: 'down',
    },
    {
        screen: 'Amigos Palomeros',
        icon: faFaceSmile,
        iconColor: '#2ECC71',
        title: 'Botón de aceptar',
        description:
            'El botón con la carita sirve para aceptar un perfil. Es igual que deslizar la tarjeta hacia la derecha. Si ambos se aceptan, se genera un match y podrán chatear.',
        cardPosition: 'top',
        arrowDirection: 'down',
    },
    {
        screen: 'Amigos Palomeros',
        icon: faReply,
        iconColor: '#ffd700',
        title: 'Deshacer swipe',
        description:
            'El botón dorado del centro permite deshacer tu último swipe si te equivocaste. Esta función es exclusiva para usuarios con suscripción premium.',
        cardPosition: 'top',
        arrowDirection: 'down',
    },
    {
        screen: 'Amigos de Butaca',
        icon: faComment,
        title: 'Amigos de Butaca',
        description:
            'En esta pestaña encontrarás la lista de personas con las que hiciste match. Puedes abrir una conversación y chatear sobre películas, series y recomendaciones.',
        cardPosition: 'bottom',
        arrowDirection: null,
    },
    {
        screen: 'Perfil',
        icon: faCamera,
        title: 'Tu foto de perfil',
        description:
            'Para cambiar tu foto de perfil, toca directamente sobre tu imagen en la parte superior de esta pantalla. Se abrirá la galería de tu teléfono para seleccionar una nueva foto.',
        cardPosition: 'bottom',
        arrowDirection: 'up',
    },
    {
        screen: 'Perfil',
        icon: faPen,
        title: 'Editar perfil',
        description:
            'Desde la opción "Editar Perfil" puedes modificar tu nombre, edad y biografía. Esta información es visible para otros usuarios en las tarjetas.',
        cardPosition: 'bottom',
        arrowDirection: null,
    },
    {
        screen: 'Perfil',
        icon: faFilm,
        title: 'Preferencias de películas',
        description:
            'Dentro de "Preferencias de Películas" encontrarás cuatro secciones que te permiten personalizar tu perfil cinematográfico. Estas preferencias determinan la compatibilidad con otros usuarios.',
        cardPosition: 'bottom',
        arrowDirection: null,
    },
    {
        navigate: 'Preferencias',
        preferencesTab: 'genres',
        icon: faMusic,
        title: 'Sección: Géneros favoritos',
        description:
            'En esta pestaña puedes seleccionar tus géneros favoritos de películas: acción, comedia, drama, ciencia ficción, terror, entre otros. Toca cada género para activarlo o desactivarlo.',
        cardPosition: 'bottom',
        arrowDirection: 'up',
    },
    {
        navigate: 'Preferencias',
        preferencesTab: 'directors',
        icon: faVideo,
        title: 'Sección: Directores favoritos',
        description:
            'En esta pestaña puedes buscar y agregar tus directores de cine favoritos. Busca por nombre y agrega los que más te gusten. Aparecen con su foto de perfil.',
        cardPosition: 'bottom',
        arrowDirection: 'up',
    },
    {
        navigate: 'Preferencias',
        preferencesTab: 'movies',
        icon: faFilm,
        title: 'Sección: Películas vistas',
        description:
            'En esta pestaña puedes buscar y agregar películas que has visto. El sistema usa esta información para encontrar personas con gustos similares y calcular la compatibilidad.',
        cardPosition: 'bottom',
        arrowDirection: 'up',
    },
    {
        navigate: 'Preferencias',
        preferencesTab: 'radius',
        icon: faLocationDot,
        title: 'Sección: Radio de búsqueda',
        description:
            'En esta pestaña configuras hasta qué distancia quieres buscar otros usuarios. Puedes usar el GPS para actualizar tu ubicación y ajustar el radio con el deslizador.',
        cardPosition: 'bottom',
        arrowDirection: 'up',
    },
    {
        screen: 'Amigos Palomeros',
        icon: faCheck,
        iconColor: '#2ECC71',
        title: 'Listo para comenzar',
        description:
            'Ya conoces todas las funciones de CineMatch. Desliza las tarjetas o usa los botones para encontrar personas con tus mismos gustos cinematográficos. Mucha suerte.',
        cardPosition: 'center',
        arrowDirection: null,
    },
];

const OnboardingTutorial = ({ visible, onFinish, navigateToTab, navigateToScreen }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const goToInitialPreferences = () => {
        if (navigateToScreen) {
            navigateToScreen('Preferencias', {
                isInitialSetup: true,
                tutorialTab: 'genres',
            });
        }
    };

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
        if (!visible) return;
        const step = STEPS[currentStep];
        const prevStep = currentStep > 0 ? STEPS[currentStep - 1] : null;

        // Si venimos de una pantalla del Stack y volvemos a un tab, hacer goBack primero
        const wasOnStackScreen = prevStep && prevStep.navigate;
        const goingToTab = step.screen && !step.navigate;

        if (wasOnStackScreen && goingToTab && navigateToScreen) {
            navigateToScreen('goBack');
            // Pequeño delay para que el goBack termine antes de navegar al tab
            setTimeout(() => {
                if (navigateToTab) navigateToTab(step.screen);
            }, 100);
        } else if (step.navigate && navigateToScreen) {
            // Navegar a una pantalla del Stack (ej: Preferencias) con params
            navigateToScreen(step.navigate, step.preferencesTab ? { tutorialTab: step.preferencesTab } : {});
        } else if (step.screen && navigateToTab) {
            // Navegar a un tab (ej: Amigos Palomeros, Perfil)
            navigateToTab(step.screen);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, visible]);

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
        // Si estamos en una pantalla del Stack, volver atras primero
        const step = STEPS[currentStep];
        if (step.navigate && navigateToScreen) {
            try { navigateToScreen('goBack'); } catch (e) { }
        }
        // Luego llevar al usuario a la configuración inicial de preferencias
        setTimeout(() => {
            goToInitialPreferences();
        }, step.navigate ? 100 : 0);
        await tutorialService.markCompleted();
        setCurrentStep(0);
        onFinish();
    };

    const handleFinish = async () => {
        // Si estamos en una pantalla del Stack, volver atras
        const step = STEPS[currentStep];
        if (step.navigate && navigateToScreen) {
            try { navigateToScreen('goBack'); } catch (e) { }
        }
        await tutorialService.markCompleted();
        setCurrentStep(0);
        goToInitialPreferences();
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    card: {
        position: 'absolute',
        left: 20,
        right: 20,
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: 28,
        borderWidth: 2.5,
        borderColor: colors.primary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 14,
        elevation: 13,
        alignItems: 'center',
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
        backgroundColor: 'rgba(255,215,0,0.15)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.primary,
        textAlign: 'center',
        marginBottom: 14,
        letterSpacing: 0.4,
    },
    cardDesc: {
        fontSize: 15,
        color: colors.text,
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: '500',
        marginBottom: 18,
        paddingHorizontal: 6,
    },
    arrowContainer: {
        marginBottom: 14,
        padding: 10,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        borderWidth: 1.5,
        borderColor: colors.primary,
    },
    cardFooter: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,215,0,0.15)',
    },
    stepCounter: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '800',
    },
    cardButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    prevBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
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
