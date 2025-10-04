import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated, 
  Dimensions,
  Easing,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { FontSize, FontWeight } from '../constants';
import { Colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onAnimationComplete,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const flipValue = useRef(new Animated.Value(0)).current;
  const translateYValue = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.2,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.parallel([
        Animated.timing(flipValue, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.8,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(translateYValue, {
          toValue: 150,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(textScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]).start();
    }, 3200);

    setTimeout(() => {
      onAnimationComplete();
    }, 4500);
  }, [
    spinValue,
    scaleValue,
    flipValue,
    translateYValue,
    textOpacity,
    textScale,
    onAnimationComplete,
  ]);

  const rotation = Animated.add(
    spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 2880],
    }),
    flipValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 180],
    }),
  ).interpolate({
    inputRange: [0, 3060],
    outputRange: ['0deg', '3060deg'],
  });

  return (
    <View style={styles.container}>
      {/* Animated Bottle */}
      <Animated.View
        style={[
          styles.bottleContainer,
          {
            transform: [
              { rotate: rotation },
              { scale: scaleValue },
              { translateY: translateYValue },
            ],
          },
        ]}>
        <Image
          source={require('../assets/bottle-of-soda-icon-6460806-512.png')}
          style={styles.bottleImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Animated App Name */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
            transform: [{ scale: textScale }],
          },
        ]}>
        <Text style={styles.appName}>Spin It</Text>
      </Animated.View>
    </View>
  );
};

const createStyles = (colors: typeof Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fcba03",
      alignItems: 'center',
      justifyContent: 'center',
    },
    bottleContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    bottleImage: {
      width: width * 0.7,
      height: width * 0.7,
      tintColor: "#ebe7e7",
    },
    textContainer: {
      position: 'absolute',
      bottom: height * 0.4,
      alignItems: 'center',
    },
    appName: {
      fontSize: FontSize.huge,
      fontWeight: FontWeight.bold,
      color: "#0000",
      letterSpacing: 2,
      textAlign: 'center',
    }
  });
