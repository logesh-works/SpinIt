import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../constants';
import { SpinnerDetailScreen } from './SpinnerDetailScreen';
import { saveSpinners, getSpinners, saveSpinnerOptions, getSpinnerOptions } from '../utils/storage';

const { width } = Dimensions.get('window');
const CARD_MARGIN = Spacing.md;
const GRID_PADDING = Spacing.lg;
const cardWidth = (width - (GRID_PADDING * 2) - CARD_MARGIN) / 2;

interface Spinner {
  id: string;
  title: string;
  icon: string;
  optionsCount: number;
  color: string;
}

interface SpinOption {
  id: string;
  name: string;
}

export const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const [spinners, setSpinners] = useState<Spinner[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newSpinnerTitle, setNewSpinnerTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🎯');
  const [editingSpinner, setEditingSpinner] = useState<Spinner | null>(null);
  const [selectedSpinner, setSelectedSpinner] = useState<Spinner | null>(null);
  const [spinnerOptions, setSpinnerOptions] = useState<Record<string, SpinOption[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedSpinners = await getSpinners();
        const loadedOptions = await getSpinnerOptions();
        setSpinners(loadedSpinners);
        setSpinnerOptions(loadedOptions);
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load your spinners');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Save spinners whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveSpinners(spinners).catch(error => {
        console.error('Error saving spinners:', error);
      });
    }
  }, [spinners, isLoading]);

  // Save spinner options whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveSpinnerOptions(spinnerOptions).catch(error => {
        console.error('Error saving options:', error);
      });
    }
  }, [spinnerOptions, isLoading]);

  const handleOpenModal = () => {
    setEditingSpinner(null);
    setNewSpinnerTitle('');
    setSelectedIcon('🎯');
    setIsModalVisible(true);
  };

  const handleEditSpinner = (spinner: Spinner) => {
    setEditingSpinner(spinner);
    setNewSpinnerTitle(spinner.title);
    setSelectedIcon(spinner.icon);
    setIsModalVisible(true);
  };

  const isValidEmoji = (text: string): boolean => {
    // Check if the text contains at least one emoji
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
    return emojiRegex.test(text) && text.trim().length > 0;
  };

  const handleSaveSpinner = () => {
    if (!newSpinnerTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a spinner title');
      return;
    }

    if (!isValidEmoji(selectedIcon)) {
      Alert.alert('Missing Emoji', 'Please select an emoji for your spinner');
      return;
    }

    if (editingSpinner) {
      // Update existing spinner
      setSpinners(
        spinners.map(s =>
          s.id === editingSpinner.id
            ? { ...s, title: newSpinnerTitle.trim(), icon: selectedIcon }
            : s
        )
      );
    } else {
      const newSpinner: Spinner = {
        id: Date.now().toString(),
        title: newSpinnerTitle.trim(),
        icon: selectedIcon,
        optionsCount: 0,
        color: '#B8DCD9',
      };
      setSpinners([...spinners, newSpinner]);
    }
    setNewSpinnerTitle('');
    setSelectedIcon('🎯');
    setEditingSpinner(null);
    setIsModalVisible(false);
  };

  const handleDeleteSpinner = (id: string) => {
    Alert.alert(
      'Delete Spinner',
      'Are you sure you want to delete this spinner?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSpinners(spinners.filter(s => s.id !== id));
            // Also delete options for this spinner
            const newOptions = { ...spinnerOptions };
            delete newOptions[id];
            setSpinnerOptions(newOptions);
            setIsModalVisible(false);
            setEditingSpinner(null);
          },
        },
      ]
    );
  };

  const handleCardPress = (spinner: Spinner) => {
    setSelectedSpinner(spinner);
  };

  const handleUpdateOptions = (spinnerId: string, options: SpinOption[]) => {
    setSpinnerOptions(prev => ({
      ...prev,
      [spinnerId]: options,
    }));
    // Update options count in spinner
    setSpinners(prev =>
      prev.map(s =>
        s.id === spinnerId ? { ...s, optionsCount: options.length } : s
      )
    );
  };

  // Show spinner detail screen if a spinner is selected
  if (selectedSpinner) {
    return (
      <SpinnerDetailScreen
        spinner={selectedSpinner}
        options={spinnerOptions[selectedSpinner.id] || []}
        onBack={() => setSelectedSpinner(null)}
        onUpdateOptions={(options) => handleUpdateOptions(selectedSpinner.id, options)}
      />
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: insets.top }]}>
        <Text style={styles.loadingIcon}>🎯</Text>
        <Text style={styles.loadingText}>Loading your spinners...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Spinners</Text>
      </View>

      {/* Spinners Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.gridContainer,
          spinners.length === 0 && styles.emptyContainer,
        ]}
        showsVerticalScrollIndicator={false}>
        {spinners.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>No Spinners Yet</Text>
            <Text style={styles.emptyText}>
              Tap the + button below to create your first spinner!
            </Text>
          </View>
        ) : (
          spinners.map((spinner, index) => (
            <TouchableOpacity 
              key={spinner.id} 
              style={[
                styles.card,
                (index + 1) % 2 === 0 && styles.cardEven,
              ]}
              onPress={() => handleCardPress(spinner)}
              activeOpacity={0.7}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleEditSpinner(spinner);
                }}
                activeOpacity={0.7}>
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
              <View style={styles.cardContent}>
                <View
                  style={[styles.iconContainer, { backgroundColor: spinner.color }]}>
                  <Text style={styles.icon}>{spinner.icon}</Text>
                </View>
                <Text style={styles.cardTitle}>{spinner.title}</Text>
                <Text style={styles.optionsCount}>
                  {spinner.optionsCount} options
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        activeOpacity={0.8}
        onPress={handleOpenModal}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}>
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setIsModalVisible(false)}>
            <Pressable style={styles.bottomSheet} onPress={e => e.stopPropagation()}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Handle Bar */}
                <View style={styles.handleBar} />

                {/* Modal Title */}
                <Text style={styles.modalTitle}>
                  {editingSpinner ? 'Edit Spinner' : 'Create New Spinner'}
                </Text>

                {/* Title Input */}
                <Text style={styles.label}>Spinner Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter spinner name..."
                  placeholderTextColor="#999"
                  value={newSpinnerTitle}
                  onChangeText={setNewSpinnerTitle}
                  autoFocus
                  returnKeyType="next"
                />

                {/* Icon/Emoji Input */}
                <Text style={styles.label}>Choose an Emoji</Text>
                <View style={styles.emojiInputContainer}>
                  <TextInput
                    style={styles.emojiInput}
                    placeholder="Tap to add emoji..."
                    placeholderTextColor="#999"
                    value={selectedIcon}
                    onChangeText={text => {
                      // Only take the first emoji/character
                      const emoji = text.slice(0, 2); // Allow for emoji with modifiers
                      setSelectedIcon(emoji);
                    }}
                    maxLength={2}
                    keyboardType="default"
                  />
                  <Text style={styles.emojiPreview}>{selectedIcon || '🎯'}</Text>
                </View>
                <Text style={styles.emojiHint}>
                  Tap the input and use your emoji keyboard 😊
                </Text>

                {/* Buttons */}
                <View style={styles.modalButtons}>
              {editingSpinner ? (
                <>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={() => handleDeleteSpinner(editingSpinner.id)}>
                    <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.createButton,
                      styles.saveButton,
                      (!newSpinnerTitle.trim() || !isValidEmoji(selectedIcon)) && 
                        styles.createButtonDisabled,
                    ]}
                    onPress={handleSaveSpinner}
                    disabled={!newSpinnerTitle.trim() || !isValidEmoji(selectedIcon)}>
                    <Text style={styles.createButtonText}>Save</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setIsModalVisible(false);
                      setNewSpinnerTitle('');
                      setSelectedIcon('🎯');
                    }}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.createButton,
                      (!newSpinnerTitle.trim() || !isValidEmoji(selectedIcon)) && 
                        styles.createButtonDisabled,
                    ]}
                    onPress={handleSaveSpinner}
                    disabled={!newSpinnerTitle.trim() || !isValidEmoji(selectedIcon)}>
                    <Text style={styles.createButtonText}>Create</Text>
                  </TouchableOpacity>
                </>
              )}
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  loadingText: {
    fontSize: FontSize.lg,
    color: '#7F8C8D',
    fontWeight: FontWeight.medium,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: '#2C3E50',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: GRID_PADDING,
    paddingBottom: 100,
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: '#2C3E50',
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    marginBottom: CARD_MARGIN,
    marginRight: CARD_MARGIN,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  cardEven: {
    marginRight: 0,
  },
  editButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  editIcon: {
    fontSize: 16,
  },
  cardContent: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  icon: {
    fontSize: 40,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  optionsCount: {
    fontSize: FontSize.sm,
    color: '#7F8C8D',
  },
  addButton: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0D7C7C',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButtonText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
    marginTop: -2,
  },
  keyboardAvoid: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    maxHeight: '85%',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: '#2C3E50',
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#2C3E50',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  emojiInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  emojiInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: '#2C3E50',
  },
  emojiPreview: {
    fontSize: 40,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  emojiHint: {
    fontSize: FontSize.sm,
    color: '#7F8C8D',
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#7F8C8D',
  },
  createButton: {
    backgroundColor: '#0D7C7C',
  },
  saveButton: {
    flex: 2,
  },
  createButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  createButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#FFFFFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#FFFFFF',
  },
});
