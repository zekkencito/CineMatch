import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import shadows from '../constants/shadows';

const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  shadow = 'sm',
  style,
  testID,
}) => {
  const getVariantStyle = () => {
    const variants = {
      default: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      },
      elevated: {
        backgroundColor: colors.surfaceElevated,
        borderWidth: 0,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.primary,
      },
      gradient: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.15)',
      },
    };
    return variants[variant];
  };

  const getPaddingStyle = () => {
    const paddings = {
      xs: spacing.sm,
      sm: spacing.md,
      md: spacing.lg,
      lg: spacing.xl,
    };
    return paddings[padding];
  };

  const shadowStyle = shadows[shadow] || shadows.sm;

  return (
    <View
      style={[
        styles.card,
        getVariantStyle(),
        { padding: getPaddingStyle(), ...shadowStyle },
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: colors.radius.lg,
    overflow: 'hidden',
  },
});

export default Card;
