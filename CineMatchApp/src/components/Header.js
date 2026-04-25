import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import shadows from '../constants/shadows';

const Header = ({
  title,
  subtitle,
  onBackPress,
  rightAction,
  rightActionIcon,
  onRightActionPress,
  backgroundColor = colors.surface,
  showBorder = false,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }, showBorder && styles.withBorder]}>
      <View style={styles.content}>
        {/* Left Section - Back Button */}
        <TouchableOpacity
          style={styles.leftAction}
          onPress={onBackPress}
          disabled={!onBackPress}
          activeOpacity={0.7}
        >
          {onBackPress ? (
            <Ionicons name="chevron-back" size={28} color={colors.primary} />
          ) : (
            <View style={styles.placeholder} />
          )}
        </TouchableOpacity>

        {/* Center Section - Title */}
        <View style={styles.centerSection}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Section - Action Button */}
        <TouchableOpacity
          style={styles.rightAction}
          onPress={onRightActionPress}
          disabled={!onRightActionPress}
          activeOpacity={0.7}
        >
          {rightActionIcon ? (
            <Ionicons
              name={rightActionIcon}
              size={24}
              color={colors.primary}
            />
          ) : rightAction ? (
            <Text style={styles.rightActionText}>{rightAction}</Text>
          ) : (
            <View style={styles.placeholder} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  withBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  leftAction: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  title: {
    ...typography.h4,
    color: colors.text,
  },
  subtitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightAction: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightActionText: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
  placeholder: {
    width: 24,
    height: 24,
  },
});

export default Header;
