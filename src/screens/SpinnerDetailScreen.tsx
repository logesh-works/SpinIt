import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Easing,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../constants';
// @ts-ignore
import Sound from 'react-native-sound';

const bottleImage = require('../assets/bottle-of-soda-icon-6460806-512.png');

// Enable playback in silence mode (iOS)
Sound.setCategory('Playback');

interface SpinOption {
  id: string;
  name: string;
}

interface SpinnerDetailProps {
  spinner: {
    id: string;
    title: string;
    icon: string;
    color: string;
  };
  options: SpinOption[];
  onBack: () => void;
  onUpdateOptions: (options: SpinOption[]) => void;
}

export const SpinnerDetailScreen: React.FC<SpinnerDetailProps> = ({
  spinner,
  options: initialOptions,
  onBack,
  onUpdateOptions,
}) => {
  const insets = useSafeAreaInsets();
  const [options, setOptions] = useState<SpinOption[]>(initialOptions);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [optionName, setOptionName] = useState('');
  const [editingOption, setEditingOption] = useState<SpinOption | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SpinOption | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const rotationValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const spinSound = useRef<Sound | null>(null);
  
  // Animation values for result text pop-up
  const resultScale = useRef(new Animated.Value(0)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const resultRotate = useRef(new Animated.Value(0)).current;

  // Initialize sound
  useEffect(() => {
    spinSound.current = new Sound('spinning_jar_cap_100156.mp3', Sound.MAIN_BUNDLE, (error: Error) => {
      if (error) {
        console.log('Failed to load sound', error);
        return;
      }
    });

    return () => {
      if (spinSound.current) {
        spinSound.current.release();
      }
    };
  }, []);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true; // Prevent default behavior
    });

    return () => backHandler.remove();
  }, [onBack]);

  const handleAddOption = () => {
    // Check if maximum limit reached
    if (options.length >= 15) {
      Alert.alert(
        'Maximum Limit Reached', 
        'You can add a maximum of 15 options per spinner.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setEditingOption(null);
    setOptionName('');
    setIsModalVisible(true);
  };

  const handleEditOption = (option: SpinOption) => {
    setEditingOption(option);
    setOptionName(option.name);
    setIsModalVisible(true);
  };

  const handleSaveOption = () => {
    if (!optionName.trim()) {
      Alert.alert('Missing Name', 'Please enter an option name');
      return;
    }

    if (editingOption) {
      const updatedOptions = options.map(opt =>
        opt.id === editingOption.id
          ? { ...opt, name: optionName.trim() }
          : opt
      );
      setOptions(updatedOptions);
      onUpdateOptions(updatedOptions);
    } else {
      const newOption: SpinOption = {
        id: Date.now().toString(),
        name: optionName.trim(),
      };
      const updatedOptions = [...options, newOption];
      setOptions(updatedOptions);
      onUpdateOptions(updatedOptions);
    }

    setIsModalVisible(false);
    setOptionName('');
    setEditingOption(null);
  };

  const handleDeleteOption = (id: string) => {
    Alert.alert('Delete Option', 'Are you sure you want to delete this option?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updatedOptions = options.filter(opt => opt.id !== id);
          setOptions(updatedOptions);
          onUpdateOptions(updatedOptions);
          setIsModalVisible(false);
          setEditingOption(null);
        },
      },
    ]);
  };

  const handleSpin = () => {
    if (options.length === 0) {
      Alert.alert('No Options', 'Please add at least one option to spin');
      return;
    }

    // Clear previous result first
    setShowResult(false);
    setSelectedOption(null);
    
    // Small delay to ensure state clears
    setTimeout(() => {
      setIsSpinning(true);

      // Play spinning sound
      if (spinSound.current) {
        spinSound.current.stop(() => {
          spinSound.current?.play((success: boolean) => {
            if (!success) {
              console.log('Sound playback failed');
            }
          });
        });
      }

      // Truly random option selection
      const randomIndex = Math.floor(Math.random() * options.length);
      const selected = options[randomIndex];
      
      // Calculate the exact angle where the selected option is positioned
      // Options are positioned starting at 0° (top) going clockwise
      const anglePerOption = 360 / options.length;
      const optionAngle = randomIndex * anglePerOption;
      
      // Bottle needs to point at the option
      // Bottle tip points upward by default (0°), so we rotate to match the option's angle
      // Add 90° because bottle neck points right when at 90°, and options start at top (0°)
      const targetAngle = optionAngle + 90;
      
      // Add multiple full spins for effect (6 full rotations for 10 seconds)
      const fullSpins = 16;
      const totalRotation = (fullSpins * 360) + targetAngle;

      // Reset to 0 and animate to total rotation
      rotationValue.setValue(0);
      
      Animated.timing(rotationValue, {
        toValue: totalRotation,
        duration: 10580, // 10 seconds to match sound duration
        easing: Easing.out(Easing.ease), // Smooth ease-in-out animation
        useNativeDriver: true,
      }).start(() => {
        setIsSpinning(false);
        setSelectedOption(selected);
        setShowResult(true);
        
        // Reset animation values
        resultScale.setValue(0);
        resultOpacity.setValue(0);
        resultRotate.setValue(-15);
        
        // Spectacular pop-up animation sequence
        Animated.parallel([
          // Scale: Pop in with bounce
          Animated.spring(resultScale, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
          }),
          // Opacity: Fade in quickly
          Animated.timing(resultOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          // Rotation: Slight wiggle effect
          Animated.sequence([
            Animated.timing(resultRotate, {
              toValue: 15,
              duration: 200,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
            Animated.timing(resultRotate, {
              toValue: -10,
              duration: 200,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
            Animated.timing(resultRotate, {
              toValue: 5,
              duration: 200,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
            Animated.timing(resultRotate, {
              toValue: 0,
              duration: 200,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          // After pop-in, add continuous pulse
          Animated.loop(
            Animated.sequence([
              Animated.timing(pulseValue, {
                toValue: 1.1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(pulseValue, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
            { iterations: 3 }
          ).start();
        });
      });
    }, 100);
  };

  // Create rotation transform
  const rotation = rotationValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const getOptionPosition = (index: number, total: number) => {
    const angle = (index * 360) / total;
    
    // Dynamic radius based on number of options
    // More options = larger circle to prevent overlap
    let radius = 120;
    if (total > 8) {
      radius = 140;
    }
    if (total > 12) {
      radius = 160;
    }
    
    const x = radius * Math.cos((angle * Math.PI) / 180);
    const y = radius * Math.sin((angle * Math.PI) / 180);
    return { x, y, angle };
  };

  // Dynamic option size based on number of options
  const getOptionSize = () => {
    const total = options.length;
    if (total <= 6) return { width: 90, height: 90, fontSize: FontSize.md };
    if (total <= 10) return { width: 75, height: 75, fontSize: FontSize.sm };
    if (total <= 15) return { width: 60, height: 60, fontSize: FontSize.xs };
    return { width: 50, height: 50, fontSize: FontSize.xs };
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backIcon}> <Image source={require("../assets/back-button.png")} style={styles.icon} /></Text>
        </TouchableOpacity>
        <Text style={styles.title}>{spinner.title}</Text>
        <TouchableOpacity 
          style={styles.addButtonHeader} 
          onPress={handleAddOption}
          activeOpacity={0.7}>
          <Text style={styles.addButtonHeaderText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Spinning Wheel Area */}
      <View style={styles.wheelContainer}>
        {options.length === 0 ? (
          <View style={styles.emptyWheel}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>Tap + button above to add options!</Text>
          </View>
        ) : (
          <>
          <View style={styles.wheel}>
            {/* Center bottle image - rotates to point at winner */}
            <Animated.View
              style={[
                styles.centerIcon,
                {
                  transform: [{ rotate: rotation }],
                },
              ]}>
              <Image source={bottleImage} style={styles.bottleImage} resizeMode="contain" />
            </Animated.View>

            {/* Options in circle */}
            {options.map((option, index) => {
              const { x, y } = getOptionPosition(index, options.length);
              const optionSize = getOptionSize();
              const isSelected = selectedOption?.id === option.id && showResult;
              const bgColor = isSelected ? '#6C63FF' : '#FFFFFF';
              
              return (
                <Animated.View
                  key={option.id}
                  style={[
                    styles.optionCircle,
                    { 
                      backgroundColor: bgColor,
                      width: optionSize.width,
                      height: optionSize.height,
                      borderRadius: optionSize.width / 2,
                    },
                    {
                      transform: [
                        { translateX: x },
                        { translateY: y },
                        { scale: isSelected ? pulseValue : 1 },
                      ],
                    },
                  ]}>
                  <TouchableOpacity
                    onPress={() => handleEditOption(option)}
                    style={styles.optionTouchable}
                    disabled={isSpinning}>
                    <Text style={[
                      styles.optionText, 
                      { fontSize: optionSize.fontSize },
                      isSelected && styles.selectedOptionText
                    ]}>
                      {option.name}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
          </>
        )}
      </View>

      {/* Result Display - Above buttons with pop-up animation */}
      {showResult && selectedOption && (
        <Animated.View 
          style={[
            styles.resultContainer,
            {
              opacity: resultOpacity,
              transform: [
                { scale: Animated.multiply(resultScale, pulseValue) },
                { 
                  rotate: resultRotate.interpolate({
                    inputRange: [-15, 15],
                    outputRange: ['-15deg', '15deg'],
                  })
                },
              ],
            },
          ]}>
          <Text style={styles.resultText}>{selectedOption.name}</Text>
        </Animated.View>
      )}

      {/* Single Smart Spin Button */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={[styles.button, styles.spinButton]}
          onPress={() => handleSpin()}
          disabled={isSpinning}>
          <Text style={styles.spinIcon}>{showResult ? '↻' : <Image source={require("../assets/bottle-of-soda-icon-6460806-512.png")} style={styles.btn_icon} />}</Text>
          <Text style={styles.spinText}>{showResult ? 'Spin Again' : 'Spin It'}</Text>
        </TouchableOpacity>
      </View>

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
                <View style={styles.handleBar} />
                <Text style={styles.modalTitle}>
                  {editingOption ? 'Edit Option' : 'Add New Option'}
                </Text>

                <Text style={styles.label}>Option Name</Text>
                <TextInput
                  style={styles.input}
                  placeholderTextColor="#999"
                  value={optionName}
                  onChangeText={setOptionName}
                  autoFocus
                />

                <View style={styles.modalButtons}>
                  {editingOption ? (
                    <>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.deleteButton]}
                        onPress={() => handleDeleteOption(editingOption.id)}>
                        <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.modalButton,
                          styles.saveButton,
                          !optionName.trim() && styles.disabledButton,
                        ]}
                        onPress={handleSaveOption}
                        disabled={!optionName.trim()}>
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={() => {
                          setIsModalVisible(false);
                          setOptionName('');
                        }}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.modalButton,
                          styles.addButton,
                          !optionName.trim() && styles.disabledButton,
                        ]}
                        onPress={handleSaveOption}
                        disabled={!optionName.trim()}>
                        <Text style={styles.addButtonText}>Add</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backIcon: {
    fontSize: 24,
    color: '#2C3E50',
  },
  title: {
    width:'70%',
    textAlign:"center",
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#2C3E50',
  },
  addButtonHeader: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8ed13ff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addButtonHeaderText: {
    fontSize: 32,
    color: '#000000ff',
    fontWeight: FontWeight.bold,
    marginTop: -2,
  },
  wheelContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyWheel: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  wheel: {
    width: 400,
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerIcon: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  bottleImage: {
    width: 140,
    height: 140,
  },
  optionCircle: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  optionTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xs,
  },
  optionText: {
    fontSize: FontSize.md,
    color: '#2C3E50',
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
  resultContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  resultLabel: {
    fontSize: FontSize.xl,
    color: '#6C63FF',
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  resultText: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: '#2C3E50',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  spinButton: {
    backgroundColor: '#6C63FF',
    flex: 1
  },
  spinIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  spinText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#FFFFFF',
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
  addButton: {
    backgroundColor: '#0D7C7C',
  },
  addButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#FFFFFF',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#0D7C7C',
  },
  saveButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#FFFFFF',
  },
  icon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  btn_icon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
    tintColor:"#ffffff",
    transform: [{ rotate: "30deg" }],
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#B0BEC5',
  },
});
