import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: [],
  });

  const showAlert = useCallback((config) => {
    return new Promise((resolve) => {
      setAlertConfig({
        visible: true,
        title: config.title || 'Alerta',
        message: config.message || '',
        type: config.type || 'info',
        buttons: config.buttons || [
          {
            text: config.buttonText || 'OK',
            onPress: () => resolve(),
          }
        ],
        resolve,
      });
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
    if (alertConfig.resolve) {
      alertConfig.resolve();
    }
  }, [alertConfig.resolve]);

  // Métodos de conveniencia
  const showSuccess = useCallback((title, message, buttonText = 'OK') => {
    return showAlert({
      title,
      message,
      type: 'success',
      buttonText,
    });
  }, [showAlert]);

  const showError = useCallback((title, message, buttonText = 'OK') => {
    return showAlert({
      title,
      message,
      type: 'error',
      buttonText,
    });
  }, [showAlert]);

  const showWarning = useCallback((title, message, buttonText = 'OK') => {
    return showAlert({
      title,
      message,
      type: 'warning',
      buttonText,
    });
  }, [showAlert]);

  const showInfo = useCallback((title, message, buttonText = 'OK') => {
    return showAlert({
      title,
      message,
      type: 'info',
      buttonText,
    });
  }, [showAlert]);

  const showConfirm = useCallback((title, message, confirmText = 'Confirmar', cancelText = 'Cancelar') => {
    return new Promise((resolve) => {
      setAlertConfig({
        visible: true,
        title,
        message,
        type: 'warning',
        buttons: [
          {
            text: cancelText,
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: confirmText,
            style: 'default',
            onPress: () => resolve(true),
          }
        ],
        resolve,
      });
    });
  }, []);

  return {
    alertConfig,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
  };
};

export default useCustomAlert;
