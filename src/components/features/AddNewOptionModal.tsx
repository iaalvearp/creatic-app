import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/typography';
import BotonPrincipal from '../common/BotonPrincipal';

interface Props {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (newValue: string) => void;
}

const AddNewOptionModal = ({ visible, title, onClose, onSubmit }: Props) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim());
      setText(''); // Limpiamos el input
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            style={styles.input}
            placeholder="Escribe el nuevo nombre"
            value={text}
            onChangeText={setText}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <BotonPrincipal title="Guardar" onPress={handleSubmit} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
  },
  title: {
    fontFamily: FONTS.VersosVariableTest,
    fontSize: 20,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 10,
    padding: 15,
  },
  cancelButtonText: {
    fontFamily: FONTS.VersosVariableTest,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

export default AddNewOptionModal;
