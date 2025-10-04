import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../constants';
import { Colors } from '../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.button];

    // Variant styles
    if (variant === 'primary') {
      baseStyle.push(styles.primaryButton);
    } else if (variant === 'secondary') {
      baseStyle.push(styles.secondaryButton);
    } else if (variant === 'outline') {
      baseStyle.push(styles.outlineButton);
    }

    // Size styles
    if (size === 'small') {
      baseStyle.push(styles.smallButton);
    } else if (size === 'large') {
      baseStyle.push(styles.largeButton);
    }

    // State styles
    if (disabled) {
      baseStyle.push(styles.disabledButton);
    }

    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.buttonText];

    if (variant === 'primary') {
      baseStyle.push(styles.primaryText);
    } else if (variant === 'secondary') {
      baseStyle.push(styles.secondaryText);
    } else if (variant === 'outline') {
      baseStyle.push(styles.outlineText);
    }

    if (size === 'small') {
      baseStyle.push(styles.smallText);
    } else if (size === 'large') {
      baseStyle.push(styles.largeText);
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? colors.primary : colors.white}
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors: typeof Colors) =>
  StyleSheet.create({
    button: {
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    secondaryButton: {
      backgroundColor: colors.secondary,
    },
    outlineButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    smallButton: {
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
    },
    largeButton: {
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.xl,
    },
    disabledButton: {
      opacity: 0.5,
    },
    fullWidth: {
      width: '100%',
    },
    buttonText: {
      fontSize: FontSize.md,
      fontWeight: FontWeight.semibold,
    },
    primaryText: {
      color: colors.white,
    },
    secondaryText: {
      color: colors.white,
    },
    outlineText: {
      color: colors.primary,
    },
    smallText: {
      fontSize: FontSize.sm,
    },
    largeText: {
      fontSize: FontSize.lg,
    },
  });
