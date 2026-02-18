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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { subscriptionService } from '../services/subscriptionService';
import colors from '../constants/colors';

const SubscriptionScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [plans, setPlans] = useState(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    setLoading(true);
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
    } catch (error) {
      console.error('Error loading subscription:', error);
      Alert.alert('Error', 'No se pudo cargar la información de suscripciones');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    Alert.alert(
      '💳 Actualizar a Premium',
      '¿Deseas actualizar a Premium por $70/mes?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setUpgrading(true);
            try {
              const response = await subscriptionService.upgradeToPremium(30);
              if (response.success) {
                Alert.alert(
                  '🎉 ¡Bienvenido a Premium!',
                  response.message,
                  [{ text: 'OK', onPress: loadSubscriptionData }]
                );
              }
            } catch (error) {
              console.error('Error upgrading:', error);
              Alert.alert('Error', 'No se pudo procesar el pago');
            } finally {
              setUpgrading(false);
            }
          }
        }
      ]
    );
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
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Suscripción Premium</Text>
          <Text style={styles.headerSubtitle}>Desbloquea beneficios exclusivos</Text>
        </View>
      </LinearGradient>

      <LinearGradient colors={[colors.secondary, colors.secondaryLight]} style={styles.contentGradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Plan Actual */}
        <View style={styles.currentPlanCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planTitle}>
              {isPremium ? '⭐ Premium' : '🎬 Plan Gratis'}
            </Text>
            {isPremium && currentPlan?.status === 'active' && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>ACTIVO</Text>
              </View>
            )}
          </View>

          {isPremium && currentPlan?.expires_at && (
            <Text style={styles.expiryText}>
              Expira el {formatDate(currentPlan.expires_at)}
            </Text>
          )}

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Tus beneficios actuales:</Text>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🌍</Text>
              <Text style={styles.benefitText}>
                Radio de búsqueda: hasta 50 km
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>❤️</Text>
              <Text style={styles.benefitText}>
                Palomitas diarias: {benefits.daily_likes_limit === 'unlimited' ? 'Ilimitadas' : benefits.daily_likes_limit}
              </Text>
            </View>
            {benefits.can_see_likes && (
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>💫</Text>
                <Text style={styles.benefitText}>Ver quién quiere palomitas contigo</Text>
              </View>
            )}
            {benefits.can_undo_swipes && (
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>⏮️</Text>
                <Text style={styles.benefitText}>Deshacer Amigos Palomeros rechazados</Text>
              </View>
            )}
            {benefits.has_advanced_filters && (
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>🎬</Text>
                <Text style={styles.benefitText}>Filtros avanzados</Text>
              </View>
            )}
            {benefits.is_featured && (
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>🌟</Text>
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
              <Text style={styles.premiumTitle}>⭐ Actualiza a Premium</Text>
              
            </View>
            <Text style={styles.premiumPrice}>$9.99/mes</Text>
            <Text style={styles.premiumSubtitle}>Desbloquea todas las funciones:</Text>

            <View style={styles.featuresList}>
              {plans.premium.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureCheck}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.upgradeButton, upgrading && styles.disabledButton]}
              onPress={handleUpgrade}
              disabled={upgrading}
            >
              {upgrading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.upgradeButtonText}>🚀 Actualizar Ahora</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Info adicional */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Información</Text>
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
  expiryText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 15,
    fontWeight: '600',
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
