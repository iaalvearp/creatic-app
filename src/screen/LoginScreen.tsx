import React, { useState } from 'react';
// 👇 CAMBIO EN ESTAS LÍNEAS
import { View, Text, TextInput, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BotonPrincipal from '../components/common/BotonPrincipal';
import { authService } from '../service/authService';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';
import { FONTS } from '../theme/typography';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { iniciarSesion } = useAuth();

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, ingresa tu correo y contraseña.');
      return;
    }

    const usuario = authService.login(email, password);

    if (usuario) {
      iniciarSesion(usuario);
    } else {
      Alert.alert('Error', 'Las credenciales son incorrectas.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Espacio para el logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/main-logo.png')}
            style={styles.logoImage}
          />
        </View>

        {/* Formulario */}
        <Text style={styles.label}>Usuario</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu correo electrónico"
          placeholderTextColor={COLORS.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu contraseña"
          placeholderTextColor={COLORS.textSecondary}
          secureTextEntry // Oculta la contraseña
          value={password}
          onChangeText={setPassword}
        />

        <View style={styles.buttonContainer}>
          <BotonPrincipal title="Iniciar Sesión" onPress={handleLogin} />
        </View>
      </View>
    </SafeAreaView>
  );
};

// El resto del código (styles) permanece exactamente igual.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    aspectRatio: 16 / 9,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: '80%', // Ocupa el 80% del ancho de su contenedor
    height: '80%', // Ocupa el 80% del alto de su contenedor
    resizeMode: 'contain', // Asegura que la imagen se escale correctamente sin deformarse
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.BricolageGrotesqueRegular,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    fontFamily: FONTS.VersosVariableTest,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default LoginScreen;
