import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { SplashScreen } from './src/screens/SplashScreen';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {showSplash ? (
        <SplashScreen onAnimationComplete={handleSplashComplete} />
      ) : (
        <HomeScreen />
      )}
    </SafeAreaProvider>
  );
}

export default App;
