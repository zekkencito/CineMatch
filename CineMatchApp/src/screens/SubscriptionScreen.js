import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  RefreshControl,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { subscriptionService } from '../services/subscriptionService';
import { paymentService } from '../services/paymentService';
import paymentConfig from '../config/paymentConfig';
import colors from '../constants/colors';
import preferenceService from '../services/preferenceService';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faStar,
  faFilm,
  faGlobeAmericas,
  faHeart,
  faEye,
  faUndo,
  faFilter,
  faInfoCircle,
  faRocket,
  faCheck,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';

const SubscriptionScreen = ({ navigation }) => {
  const { refetchUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [plans, setPlans] = useState(null);

  useEffect(() => {
    loadSubscriptionData();

    // Escuchar deep links de retorno de PayPal
    const handleDeepLink = (event) => {
      const url = event.url;
      console.log('Deep link received:', url);

      // cinematch://payment/return?orderId=XXX&status=success
      if (url && url.includes('payment/return')) {
        const urlObj = new URL(url);
        const orderId = urlObj.searchParams.get('orderId');
        const status = urlObj.searchParams.get('status');

        console.log('Payment return - OrderID:', orderId, 'Status:', status);

        if (status === 'success' && orderId) {
          // El pago se completó exitosamente, recargar datos del usuario
          console.log('Payment successful, reloading user data...');

          // Recargar datos del usuario desde el servidor
          refetchUser()
            .then(() => {
              console.log('User data reloaded successfully');
              // Mostrar mensaje de éxito
              Alert.alert(
                '🎉 ¡Premium activado!',
                '¡Felicidades! Ahora eres usuario Premium y tienes acceso a todas las funciones exclusivas.',
                [{
                  text: 'OK', onPress: () => {
                    loadSubscriptionData();
                    // Vuelve a la pantalla principal para que toda la app se refresque y sepa que es premium
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'MainTabs' }],
                    });
                  }
                }]
              );
            })
            .catch((error) => {
              console.error('Error reloading user data:', error);
              Alert.alert(
                'Atención',
                'El pago se completó correctamente, pero hubo un problema al actualizar tus datos de inmediato. Por favor, cierra y vuelve a abrir la app.',
                [{ text: 'OK' }]
              );
            });
        } else if (status === 'cancelled') {
          Alert.alert('Pago cancelado', 'Has cancelado el pago. Puedes intentarlo nuevamente.');
        }
      }
    };

    // Listener para URLs mientras la app está abierta
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Verificar si la app se abrió desde un deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const loadSubscriptionData = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [planResponse, plansResponse] = await Promise.all([
        subscriptionService.getCurrentPlan(),
        subscriptionService.getPlans(),
      ]);

      if (planResponse.success) {
        setCurrentPlan(planResponse.subscription);
      }

      if (plansResponse.success) {
        setPlans(plansResponse.plans);
      }

      // Asegurar que forzamos la recarga del usuario completo para que toda la app sepa
      // Si el swipe o carga detectó que es premium, el Context Auth se actualizará
      try {
        await refetchUser();
      } catch (err) {
        console.log('Error silenciado al refrescar contexto de usuario', err);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      if (!isRefreshing) {
        Alert.alert('Error', 'No se pudo cargar la información de suscripciones');
      }
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const [pendingOrder, setPendingOrder] = useState(null);

  const handleUpgrade = async () => {
    Alert.alert(
      '💳 Actualizar a Premium',
      '¿Deseas actualizar a Premium por $9.99/mes?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setUpgrading(true);
            try {
              // Crear orden en el servidor
              const createResp = await paymentService.createPayPalOrder(30);
              if (!createResp.success) throw new Error(createResp.message || 'No se pudo crear la orden');

              // Guardar orderId
              setPendingOrder({ orderID: createResp.orderID, amount: createResp.amount, mock: createResp.mock });

              // Si es mock (desarrollo), activar directamente
              if (createResp.mock) {
                Alert.alert(
                  '🧪 Modo desarrollo',
                  'Estás en modo de prueba (PayPal no configurado). ¿Quieres simular un pago exitoso?',
                  [
                    { text: 'Cancelar', style: 'cancel', onPress: () => setPendingOrder(null) },
                    { text: 'Simular pago', onPress: () => handleVerifyPayment() }
                  ]
                );
              } else {
                // Abrir URL de aprobación en navegador
                await paymentService.openApprovalUrl(createResp.approveUrl);

                // Mostrar instrucción para verificar al volver
                Alert.alert(
                  'Pago en progreso',
                  'Se abrió PayPal en el navegador. Completa el pago y vuelve a la app, luego pulsa "Verificar pago" para activar tu suscripción.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              console.error('Error initiating PayPal flow:', error);
              Alert.alert('Error', (error.message || error)?.toString() || 'No se pudo iniciar el pago');
            } finally {
              setUpgrading(false);
            }
          }
        }
      ]
    );
  };

  const handleVerifyPaymentAuto = async (orderID) => {
    setUpgrading(true);
    try {
      const response = await subscriptionService.upgradeToPremium(30, { orderID });
      if (response.success) {
        // Recargar datos de usuario desde servidor para actualizar estado Premium
        try {
          await refetchUser();
        } catch (e) {
          console.warn('Could not refetch user after upgrade:', e);
        }
        Alert.alert('🎉 ¡Premium activado!', response.message, [{
          text: 'OK', onPress: () => {
            setPendingOrder(null);
            loadSubscriptionData();
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
          }
        }]);
      } else {
        Alert.alert('No verificado', response.message || 'El pago no fue verificado.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      Alert.alert('Error', err.message || 'No se pudo verificar el pago.');
    } finally {
      setUpgrading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!pendingOrder?.orderID) {
      Alert.alert('Sin orden', 'No hay una orden pendiente para verificar. Por favor inicia el pago primero.');
      return;
    }

    await handleVerifyPaymentAuto(pendingOrder.orderID);
  };

  const handleCancel = async () => {
    Alert.alert(
      '😢 Cancelar Suscripción',
      '¿Estás seguro de que deseas cancelar? Mantendrás tus beneficios hasta que expire.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await subscriptionService.cancelSubscription();
              if (response.success) {
                try {
                  // Al cancelar, restablecer el radio al valor por defecto (7 km)
                  await preferenceService.updateLocation({ searchRadius: 7 });
                } catch (e) {
                  console.warn('No se pudo restablecer radio en el servidor:', e);
                }
                Alert.alert('Cancelado', response.message, [
                  { text: 'OK', onPress: loadSubscriptionData }
                ]);
              }
            } catch (error) {
              console.error('Error cancelling:', error);
              Alert.alert('Error', 'No se pudo cancelar la suscripción');
            }
          }
        }
      ]
    );
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDaysRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[colors.secondary, colors.secondaryLight]} style={styles.loadingGradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const isPremium = currentPlan?.is_premium;
  const benefits = currentPlan?.benefits || {};

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[colors.secondary, colors.secondaryLight]} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesomeIcon icon={faArrowLeft} size={18} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.backButtonText}>Volver</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Suscripción Premium</Text>
          <Text style={styles.headerSubtitle}>Desbloquea beneficios exclusivos</Text>
        </View>
      </LinearGradient>

      <LinearGradient colors={[colors.secondary, colors.secondaryLight]} style={styles.contentGradient}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadSubscriptionData(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
              title="Actualizando..."
              titleColor={colors.textSecondary}
            />
          }
        >
          {/* Plan Actual */}
          <View style={styles.currentPlanCard}>
            <View style={styles.planHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesomeIcon icon={isPremium ? faStar : faFilm} size={20} color={isPremium ? '#ffd700' : colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.planTitle}>{isPremium ? 'Premium' : 'Plan Gratis'}</Text>
              </View>
              {isPremium && currentPlan?.status === 'active' && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>ACTIVO</Text>
                </View>
              )}
            </View>

            {isPremium && currentPlan?.expires_at && (
              <View style={styles.expiryContainer}>
                <View style={styles.daysRemainingBox}>
                  <Text style={styles.daysRemainingNumber}>{calculateDaysRemaining(currentPlan.expires_at)}</Text>
                  <Text style={styles.daysRemainingLabel}>días restantes</Text>
                </View>
                <Text style={styles.expiryText}>
                  Expira el {formatDate(currentPlan.expires_at)}
                </Text>
              </View>
            )}

            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Tus beneficios actuales:</Text>
              <View style={styles.benefitItem}>
                <FontAwesomeIcon icon={faGlobeAmericas} size={20} color={colors.primary} style={styles.benefitIcon} />
                <Text style={styles.benefitText}>
                  Radio de búsqueda: hasta 50 km
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <FontAwesomeIcon icon={faHeart} size={20} color={colors.primary} style={styles.benefitIcon} />
                <Text style={styles.benefitText}>
                  Palomitas diarias: {benefits.daily_likes_limit === 'unlimited' ? 'Ilimitadas' : benefits.daily_likes_limit}
                </Text>
              </View>
              {benefits.can_see_likes && (
                <View style={styles.benefitItem}>
                  <FontAwesomeIcon icon={faEye} size={20} color={colors.primary} style={styles.benefitIcon} />
                  <Text style={styles.benefitText}>Ver quién quiere palomitas contigo</Text>
                </View>
              )}
              {benefits.can_undo_swipes && (
                <View style={styles.benefitItem}>
                  <FontAwesomeIcon icon={faUndo} size={20} color={colors.primary} style={styles.benefitIcon} />
                  <Text style={styles.benefitText}>Deshacer Amigos Palomeros rechazados</Text>
                </View>
              )}
              {benefits.has_advanced_filters && (
                <View style={styles.benefitItem}>
                  <FontAwesomeIcon icon={faFilter} size={20} color={colors.primary} style={styles.benefitIcon} />
                  <Text style={styles.benefitText}>Filtros avanzados</Text>
                </View>
              )}
              {benefits.is_featured && (
                <View style={styles.benefitItem}>
                  <FontAwesomeIcon icon={faStar} size={20} color={colors.primary} style={styles.benefitIcon} />
                  <Text style={styles.benefitText}>Perfil destacado</Text>
                </View>
              )}
            </View>

            {isPremium && currentPlan?.status === 'active' && (
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancelar Suscripción</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Plan Premium (si no es premium) */}
          {!isPremium && plans?.premium && (
            <View style={styles.premiumCard}>
              <View style={styles.premiumHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <FontAwesomeIcon icon={faStar} size={20} color={'#ffd700'} style={{ marginRight: 8 }} />
                  <Text style={styles.premiumTitle}>Actualiza a Premium</Text>
                </View>

              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                <FontAwesomeIcon icon={faFilm} size={16} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.premiumPrice}>$9.99/mes</Text>
              </View>
              <Text style={styles.premiumSubtitle}>Desbloquea todas las funciones:</Text>

              <View style={styles.featuresList}>
                {plans.premium.features.map((feature, index) => {
                  const t = String(feature || '');
                  const lower = t.toLowerCase();

                  // Decide icon for descriptive purpose (replace emoji)
                  const getDescriptorIcon = () => {
                    if (lower.includes('radio') || lower.includes('distancia') || lower.includes('km')) return faGlobeAmericas;
                    if (lower.includes('ilimit') || (lower.includes('likes') && lower.includes('ilimit'))) return faHeart;
                    if (lower.includes('ver qui') || lower.includes('ver quién') || lower.includes('ver likes')) return faEye;
                    if (lower.includes('deshacer') || lower.includes('undo')) return faUndo;
                    if (lower.includes('filtro') || lower.includes('filtros')) return faFilter;
                    if (lower.includes('destac') || lower.includes('perfil destacado')) return faStar;
                    return null;
                  };

                  // Remove leading emoji/symbols from the feature text
                  let cleaned = t;
                  while (cleaned.length > 0 && !/[0-9A-Za-zÁÉÍÓÚáéíóúÑñÜü]/.test(cleaned.charAt(0))) {
                    cleaned = cleaned.substring(1);
                  }
                  cleaned = cleaned.trim();

                  const descriptorIcon = getDescriptorIcon();

                  return (
                    <View key={index} style={styles.featureItem}>
                      <FontAwesomeIcon icon={faCheck} size={18} color={'#4caf50'} style={{ marginRight: 10 }} />
                      {descriptorIcon && (
                        <FontAwesomeIcon icon={descriptorIcon} size={16} color={colors.primary} style={{ marginRight: 8 }} />
                      )}
                      <Text style={styles.featureText}>{cleaned}</Text>
                    </View>
                  );
                })}
              </View>

              {pendingOrder ? (
                <View style={{ marginTop: 10 }}>
                  <Text style={{ textAlign: 'center', color: colors.textSecondary, marginBottom: 15, fontSize: 13 }}>
                    Si ya completaste el pago en PayPal, presiona el botón de abajo para activarlo.
                  </Text>
                  <TouchableOpacity
                    style={[styles.upgradeButton, { backgroundColor: '#4caf50', marginBottom: 12 }, upgrading && styles.disabledButton]}
                    onPress={handleVerifyPayment}
                    disabled={upgrading}
                  >
                    {upgrading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesomeIcon icon={faCheck} size={24} color={'#fff'} style={{ marginRight: 8 }} />
                        <Text style={styles.upgradeButtonText}>Verificar Pago Realizado</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.cancelButton, { marginTop: 0 }]}
                    onPress={() => setPendingOrder(null)}
                    disabled={upgrading}
                  >
                    <Text style={styles.cancelButtonText}>Cambiar método / Cancelar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.upgradeButton, upgrading && styles.disabledButton]}
                  onPress={handleUpgrade}
                  disabled={upgrading}
                >
                  {upgrading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <FontAwesomeIcon icon={faRocket} size={30} color={'#fff'} style={{ marginRight: 8 }} />
                      <Text style={styles.upgradeButtonText}>Actualizar Ahora</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Info adicional */}
          <View style={styles.infoCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesomeIcon icon={faInfoCircle} size={18} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.infoTitle}>Información</Text>
            </View>
            <Text style={styles.infoText}>
              • Cancela en cualquier momento{'\n'}
              • Sin cargos ocultos{'\n'}
              • Activación inmediata{'\n'}
              • Soporte 24/7
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    padding: 20,
    paddingTop: 0,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 6,
    marginTop: 40,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  contentGradient: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
    marginTop: 10,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  currentPlanCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.5,
  },
  activeBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: colors.textDark,
    fontSize: 12,
    fontWeight: '800',
  },
  expiryContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  daysRemainingBox: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  daysRemainingNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textDark,
    textAlign: 'center',
    letterSpacing: 1,
  },
  daysRemainingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  expiryText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  benefitsContainer: {
    marginVertical: 15,
  },
  benefitsTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  benefitText: {
    color: colors.text,
    fontSize: 15,
    flex: 1,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 15,
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ff6b6b',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  cancelButtonText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '700',
  },
  premiumCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ffd700',
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  premiumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffd700',
    letterSpacing: 0.5,
  },
  premiumPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 5,
  },
  premiumSubtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: 15,
    fontWeight: '600',
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureCheck: {
    color: '#4caf50',
    fontSize: 20,
    marginRight: 10,
    fontWeight: 'bold',
  },
  featureText: {
    color: colors.text,
    fontSize: 15,
    flex: 1,
    fontWeight: '500',
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  upgradeButtonText: {
    color: colors.textDark,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
});

export default SubscriptionScreen;
