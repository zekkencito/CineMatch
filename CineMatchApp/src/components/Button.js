import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import shadows from '../constants/shadows';

const Button = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  ...props
}) => {
  const getStyles = () => {
    const baseStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: colors.radius.md,
      gap: spacing.sm,
    };

    const variantStyles = {
      primary: {
        backgroundColor: colors.primary,
        ...shadows.md,
      },
      secondary: {
        backgroundColor: colors.secondaryLight,
        borderWidth: 1.5,
        borderColor: colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
      },
      danger: {
        backgroundColor: colors.error,
        ...shadows.sm,
      },
      success: {
        backgroundColor: colors.success,
        ...shadows.sm,
      },
    };

    const sizeStyles = {
      sm: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
      },
      md: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
      },
      lg: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...sizeStyles[size],
    };
  };

  const getTextStyles = () => {
    const textColor = {
      primary: colors.textDark,
      secondary: colors.primary,
      ghost: colors.text,
      danger: colors.text,
      success: colors.textDark,
    };

    return {
      color: textColor[variant],
      ...typography.bodyStrong,
    };
  };

  const containerStyle = [
    getStyles(),
    fullWidth && { width: '100%' },
    disabled && { opacity: 0.6 },
    style,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.textDark : colors.primary}
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={20}
              color={variant === 'primary' ? colors.textDark : colors.primary}
            />
          )}
          <Text style={getTextStyles()}>{label}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={20}
              color={variant === 'primary' ? colors.textDark : colors.primary}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
