/**
 * Deep Linking Configuration
 * 
 * Archivo: src/navigation/linking.ts
 * Lugar: CineMatchApp/src/navigation/
 * 
 * Permite que los links del email abran directamente la pantalla de reset
 * Ejemplo: cinematch://reset-password/xxxtoken123
 * o: https://cinematch.com/reset-password/xxxtoken123
 */

const linking = {
  prefixes: ['cinematch://', 'https://cinematch.com', 'http://localhost:3000'],
  config: {
    screens: {
      // Rutas principales
      Login: 'login',
      Register: 'register',
      
      // Recuperación de contraseña
      ForgotPassword: 'forgot-password',
      ResetPassword: {
        path: 'reset-password/:token',
        parse: {
          token: (token) => token,
        },
      },

      // Otras rutas de la app
      Home: 'home',
      Profile: 'profile/:userId',
      Chat: 'chat/:conversationId',
      
      // Fallback
      NotFound: '*',
    },
  },
};

export default linking;

/**
 * Configuración en app.json (React Native Expo)
 * 
 * {
 *   "expo": {
 *     "name": "CineMatch",
 *     "scheme": "cinematch",
 *     "web": {
 *       "bundleUrl": "https://cinematch.com"
 *     },
 *     "android": {
 *       "intentFilters": [
 *         {
 *           "action": "VIEW",
 *           "autoVerify": true,
 *           "data": [
 *             {
 *               "scheme": "https",
 *               "host": "cinematch.com",
 *               "pathPrefix": "/reset-password"
 *             },
 *             {
 *               "scheme": "cinematch",
 *               "host": "reset-password"
 *             }
 *           ],
 *           "category": ["BROWSABLE", "DEFAULT"]
 *         }
 *       ]
 *     },
 *     "ios": {
 *       "bundleIdentifier": "com.cinematch.app",
 *       "associatedDomains": [
 *         "applinks:cinematch.com"
 *       ]
 *     }
 *   }
 * }
 */

/**
 * Uso en Navigation Stack
 * 
 * import { NavigationContainer } from '@react-navigation/native';
 * import { createNativeStackNavigator } from '@react-navigation/native-stack';
 * import linking from './linking';
 * 
 * import LoginScreen from '@/screens/LoginScreen';
 * import RegisterScreen from '@/screens/RegisterScreen';
 * import ForgotPasswordScreen from '@/screens/ForgotPasswordScreen';
 * import ResetPasswordScreen from '@/screens/ResetPasswordScreen';
 * import HomeScreen from '@/screens/HomeScreen';
 * 
 * const Stack = createNativeStackNavigator();
 * 
 * export default function Navigation() {
 *   return (
 *     <NavigationContainer linking={linking} fallback={<LoadingScreen />}>
 *       <Stack.Navigator
 *         screenOptions={{
 *           headerShown: false,
 *         }}
 *       >
 *         <Stack.Screen name="Login" component={LoginScreen} />
 *         <Stack.Screen name="Register" component={RegisterScreen} />
 *         <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
 *         <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
 *         <Stack.Screen name="Home" component={HomeScreen} />
 *       </Stack.Navigator>
 *     </NavigationContainer>
 *   );
 * }
 */

/**
 * Testing Deep Links
 * 
 * En Xcode (iOS):
 * xcrun simctl openurl booted "cinematch://reset-password/abc123token"
 * 
 * En emulador Android (adb):
 * adb shell am start -W -a android.intent.action.VIEW -d "cinematch://reset-password/abc123token" com.cinematch.app
 * 
 * En navegador (web):
 * https://cinematch.com/reset-password/abc123token
 * 
 * Testing con cURL desde Laravel (debug):
 * Simula el link que recibe el usuario
 */
