import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faComment, 
  faStar, 
  faFilm, 
  faThumbsUp, 
  faThumbsDown, 
  faReply, 
  faTrash, 
  faChevronDown, 
  faChevronUp, 
  faTimes, 
  faCheck, 
  faExclamationTriangle, 
  faInfoCircle,
  faFilter,
  faCalendarAlt,
  faTheaterMasks,
  faSearch,
  faXmark,
  faFaceSmile,
  faUser,
  faCamera,
  faPen,
  faMusic,
  faVideo,
  faLocationDot,
  faArrowDown,
  faArrowUp,
  faArrowLeft,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';

// Add FontAwesome icons to the library
library.add(
  faComment, 
  faStar, 
  faFilm, 
  faThumbsUp, 
  faThumbsDown, 
  faReply, 
  faTrash, 
  faChevronDown, 
  faChevronUp, 
  faTimes, 
  faCheck, 
  faExclamationTriangle, 
  faInfoCircle,
  faFilter,
  faCalendarAlt,
  faTheaterMasks,
  faSearch,
  faXmark,
  faFaceSmile,
  faUser,
  faCamera,
  faPen,
  faMusic,
  faVideo,
  faLocationDot,
  faArrowDown,
  faArrowUp,
  faArrowLeft,
  faArrowRight
);

const RootContent = () => {
  const { resolvedTheme } = useTheme();

  return (
    <AuthProvider>
      <AppNavigator />
      <StatusBar style={resolvedTheme === 'light' ? 'dark' : 'light'} />
    </AuthProvider>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <RootContent />
        </ThemeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
