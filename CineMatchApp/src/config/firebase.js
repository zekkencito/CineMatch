/**
 * 🔥 Firebase Configuration
 * Usamos Firestore SOLO como capa de señales en tiempo real.
 * Los mensajes reales se guardan en MySQL via Laravel.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyDgBhXr8-Dh-a7uZRKov_atu3V4kRCFFTo',
    authDomain: 'cinematch-5899f.firebaseapp.com',
    projectId: 'cinematch-5899f',
    storageBucket: 'cinematch-5899f.firebasestorage.app',
    messagingSenderId: '815909950118',
    appId: '1:815909950118:android:c027c0fb4fbfbf1852da67',
};

// Evitar inicializar dos veces (hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export default app;
