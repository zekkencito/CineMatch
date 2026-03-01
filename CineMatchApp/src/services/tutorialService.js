// Servicio para gestionar el estado del tutorial de onboarding.
// Utiliza AsyncStorage para persistir si el usuario ya completo el tutorial.
import AsyncStorage from '@react-native-async-storage/async-storage';

const TUTORIAL_KEY = '@cinematch_tutorial_completed';

export const tutorialService = {
    // Verifica si el tutorial ya fue completado por el usuario actual
    isCompleted: async () => {
        try {
            const value = await AsyncStorage.getItem(TUTORIAL_KEY);
            return value === 'true';
        } catch {
            return false;
        }
    },

    // Marca el tutorial como completado
    markCompleted: async () => {
        try {
            await AsyncStorage.setItem(TUTORIAL_KEY, 'true');
        } catch (error) {
            console.error('Error guardando estado del tutorial:', error);
        }
    },

    // Reinicia el estado del tutorial (util para pruebas)
    reset: async () => {
        try {
            await AsyncStorage.removeItem(TUTORIAL_KEY);
        } catch (error) {
            console.error('Error reiniciando tutorial:', error);
        }
    },
};
