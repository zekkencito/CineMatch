import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes, faCheck, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CustomAlert = ({
  visible,
  title,
  message,
  type = 'info', // 'success', 'error', 'warning', 'info'
  buttons = [{ text: 'OK', onPress: () => {} }],
  onClose,
}) => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return faCheck;
      case 'error':
        return faExclamationTriangle;
      case 'warning':
        return faExclamationTriangle;
      default:
        return faInfoCircle;
    }
  };

  const getIconColor = () => {
    // Usar siempre el amarillo de la app
    return '#FFD700';
  };

  const getGradientColors = () => {
    // Usar siempre el esquema negro y amarillo de la app
    return ['#0a0a0a', '#1a1a1a', '#0f0f0f'];
  };

  const handleButtonPress = (button) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      button.onPress();
      onClose?.();
    });
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => handleButtonPress(buttons[0] || { onPress: () => {} })}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={getGradientColors()}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <FontAwesomeIcon 
                  icon={getIcon()} 
                  size={24} 
                  color={getIconColor()} 
                />
              </View>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => handleButtonPress(buttons[0] || { onPress: () => {} })}
              >
                <FontAwesomeIcon icon={faTimes} size={16} color="#FFD700" />
              </TouchableOpacity>
            </View>

            {/* Message */}
            <View style={styles.content}>
              <Text style={styles.message}>{message}</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    button.style === 'cancel' ? styles.cancelButton : styles.primaryButton,
                  ]}
                  onPress={() => handleButtonPress(button)}
                >
                  <Text style={[
                    styles.buttonText,
                    button.style === 'cancel' ? styles.cancelButtonText : styles.primaryButtonText,
                  ]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 400,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  gradient: {
    borderRadius: 20,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  content: {
    marginBottom: 24,
  },
  message: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButtonText: {
    color: '#0a0a0a',
  },
  cancelButtonText: {
    color: '#0a0a0a',
  },
});

export default CustomAlert;
