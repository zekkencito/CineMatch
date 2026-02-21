import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from '../config/api';

// Configurar cómo se comportan las notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const notificationService = {
    async registerForPushNotificationsAsync() {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                // El usuario denegó los permisos de notificación
                return null;
            }

            // Asegúrate de que tu app tiene un projectId configurado en app.json (automático en Expo)
            token = (await Notifications.getExpoPushTokenAsync()).data;

            // Enviar el token a tu backend
            try {
                await api.post('/push-token', { token });
            } catch (error) {
                console.error('Error enviando push token al servidor:', error);
            }

        } else {
            console.log('Debes usar un dispositivo físico para las notificaciones Push');
        }

        return token;
    }
};
