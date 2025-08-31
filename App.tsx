import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Nota: Ya no necesitamos el SafeAreaProvider aquí porque
// NavigationContainer y las pantallas individuales lo gestionan.

const App = () => {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
};

export default App;
