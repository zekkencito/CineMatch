/**
 * Servicio de Autenticación - Métodos de Recuperación de Contraseña
 * 
 * Archivo: src/services/authService.js
 * Lugar: CineMatchApp/src/services/
 */

import api from './api'; // Tu configuración de axios/fetch

/**
 * Solicitar recuperación de contraseña
 * Envía email de reset a la dirección proporcionada
 * 
 * @param {string} email - Email del usuario
 * @returns {Promise} Response del servidor
 * @throws {Error} Si hay error en la solicitud
 * 
 * Ejemplo:
 * try {
 *   const response = await requestPasswordReset('user@email.com');
 *   console.log(response.data.message);
 * } catch (error) {
 *   console.error(error);
 * }
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/password-reset-request', {
      email: email.trim().toLowerCase(),
    });

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Error al procesar la solicitud. Intenta más tarde.'
    );
  }
};

/**
 * Verificar que el token de reset es válido
 * 
 * @param {string} token - Token de recuperación
 * @returns {Promise} { success: boolean, email: string }
 * @throws {Error} Si token es inválido o expirado
 * 
 * Ejemplo:
 * try {
 *   const { email } = await verifyPasswordResetToken(token);
 *   console.log('Token válido para:', email);
 * } catch (error) {
 *   console.error('Token inválido:', error.message);
 * }
 */
export const verifyPasswordResetToken = async (token) => {
  try {
    const response = await api.get('/password-reset-verify', {
      params: { token },
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Token inválido o expirado'
    );
  }
};

/**
 * Cambiar contraseña usando token de reset
 * 
 * @param {string} token - Token de recuperación
 * @param {string} password - Nueva contraseña
 * @param {string} passwordConfirmation - Confirmación de contraseña
 * @returns {Promise} { success: boolean, message: string }
 * @throws {Error} Si hay validación o error en la solicitud
 * 
 * Ejemplo:
 * try {
 *   const response = await resetPassword(token, 'newpass123', 'newpass123');
 *   console.log('Contraseña actualizada:', response.message);
 * } catch (error) {
 *   console.error('Error:', error.message);
 * }
 */
export const resetPassword = async (token, password, passwordConfirmation) => {
  // Validaciones básicas
  if (!token || !password) {
    throw new Error('Token y contraseña son requeridos');
  }

  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }

  if (password !== passwordConfirmation) {
    throw new Error('Las contraseñas no coinciden');
  }

  try {
    const response = await api.post('/password-reset', {
      token,
      password,
      password_confirmation: passwordConfirmation,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Error al cambiar la contraseña'
    );
  }
};

/**
 * Hook para usar en componentes React
 * Exportar esto para usar en la aplicación
 * 
 * Ejemplo de uso:
 * 
 * import { usePasswordReset } from '@/services/authService';
 * 
 * function ForgotPasswordScreen() {
 *   const { requestReset, verify, reset, loading, error, success } = usePasswordReset();
 *   
 *   const handleSubmit = async (email) => {
 *     try {
 *       await requestReset(email);
 *       // Mostrar mensaje de éxito
 *     } catch (err) {
 *       // Mostrar error
 *     }
 *   };
 * }
 */
export const usePasswordReset = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(false);

  return {
    requestReset: async (email) => {
      setLoading(true);
      setError(null);
      setSuccess(false);
      try {
        const result = await requestPasswordReset(email);
        setSuccess(true);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },

    verify: async (token) => {
      setLoading(true);
      setError(null);
      try {
        return await verifyPasswordResetToken(token);
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },

    reset: async (token, password, passwordConfirmation) => {
      setLoading(true);
      setError(null);
      setSuccess(false);
      try {
        const result = await resetPassword(token, password, passwordConfirmation);
        setSuccess(true);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },

    loading,
    error,
    success,
  };
};
