import { useColorScheme } from 'react-native';
import { Colors, DarkColors } from '../constants/colors';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    colors: isDark ? DarkColors : Colors,
    isDark,
  };
};
