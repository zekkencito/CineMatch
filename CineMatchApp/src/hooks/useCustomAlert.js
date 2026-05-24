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

    const normalizeButtons = useCallback((buttonOrButtons, fallbackText = 'OK') => {
      if (Array.isArray(buttonOrButtons) && buttonOrButtons.length > 0) {
        return buttonOrButtons.map((button) => ({
          text: typeof button?.text === 'string' ? button.text : fallbackText,
          style: button?.style,
          onPress: typeof button?.onPress === 'function' ? button.onPress : () => {},
        }));
      }

      return [
        {
          text: typeof buttonOrButtons === 'string' ? buttonOrButtons : fallbackText,
          onPress: () => {},
        },
      ];
    }, []);

  const showAlert = useCallback((config) => {
    return new Promise((resolve) => {
      setAlertConfig({
        visible: true,
        title: config.title || 'Alerta',
        message: config.message || '',
        type: config.type || 'info',
        buttons: normalizeButtons(config.buttons || [
          {
            text: config.buttonText || 'OK',
            onPress: () => resolve(),
          }
        ], config.buttonText || 'OK'),
        resolve,
      });
    });
  }, [normalizeButtons]);

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
      buttons: normalizeButtons(buttonText),
    });
  }, [showAlert, normalizeButtons]);

  const showError = useCallback((title, message, buttonText = 'OK') => {
    return showAlert({
      title,
      message,
      type: 'error',
      buttons: normalizeButtons(buttonText),
    });
  }, [showAlert, normalizeButtons]);

  const showWarning = useCallback((title, message, buttonText = 'OK') => {
    return showAlert({
      title,
      message,
      type: 'warning',
      buttons: normalizeButtons(buttonText),
    });
  }, [showAlert, normalizeButtons]);

  const showInfo = useCallback((title, message, buttonText = 'OK') => {
    return showAlert({
      title,
      message,
      type: 'info',
      buttons: normalizeButtons(buttonText),
    });
  }, [showAlert, normalizeButtons]);

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
