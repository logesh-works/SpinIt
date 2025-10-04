import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  SPINNERS: '@spinit_spinners',
  SPINNER_OPTIONS: '@spinit_spinner_options',
};

export interface Spinner {
  id: string;
  title: string;
  icon: string;
  optionsCount: number;
  color: string;
}

export interface SpinOption {
  id: string;
  name: string;
}

// Save all spinners
export const saveSpinners = async (spinners: Spinner[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SPINNERS, JSON.stringify(spinners));
  } catch (error) {
    console.error('Error saving spinners:', error);
    throw error;
  }
};

// Get all spinners
export const getSpinners = async (): Promise<Spinner[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SPINNERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting spinners:', error);
    return [];
  }
};

// Save options for all spinners
export const saveSpinnerOptions = async (options: Record<string, SpinOption[]>): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SPINNER_OPTIONS, JSON.stringify(options));
  } catch (error) {
    console.error('Error saving spinner options:', error);
    throw error;
  }
};

// Get options for all spinners
export const getSpinnerOptions = async (): Promise<Record<string, SpinOption[]>> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SPINNER_OPTIONS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting spinner options:', error);
    return {};
  }
};

// Clear all data (useful for debugging or reset)
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEYS.SPINNERS, STORAGE_KEYS.SPINNER_OPTIONS]);
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};
