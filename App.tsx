import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
// 👇 CAMBIA ESTA LÍNEA
import { SafeAreaView } from 'react-native-safe-area-context';

function App() {
  // ... el resto de tu código no cambia
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>¡Hola! 👋</Text>
        <Text style={styles.subtitle}>Estamos en vivo 🤓.</Text>
      </View>
    </SafeAreaView>
  );
}

// ... tus estilos no cambian
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
  },
});

export default App;
