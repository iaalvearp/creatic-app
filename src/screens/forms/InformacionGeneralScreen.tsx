import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DropDownPicker from 'react-native-dropdown-picker';
import { InformacionGeneralScreenProps } from '../../navigation/types';
import { formService } from '../../services/formService';
import BotonPrincipal from '../../components/common/BotonPrincipal';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/typography';
import { DropdownItem } from '../../types/database';
import { saveFormSection } from '../../services/formDataService';

const InformacionGeneralScreen = ({
  route,
  navigation,
}: InformacionGeneralScreenProps) => {
  const { equipoId } = route.params;

  // --- Estados para controlar los Dropdowns ---
  const [provinciaOpen, setProvinciaOpen] = useState(false);
  const [unidadOpen, setUnidadOpen] = useState(false);
  const [agenciaOpen, setAgenciaOpen] = useState(false);

  // --- Estados para guardar los valores del formulario ---
  const [mantenimientoNo, setMantenimientoNo] = useState('');
  const [cliente, setCliente] = useState('');
  const [provinciaValue, setProvinciaValue] = useState<number | null>(null);
  const [unidadValue, setUnidadValue] = useState<number | null>(null);
  const [agenciaValue, setAgenciaValue] = useState<number | null>(null);

  // --- Estados para las listas de opciones de los Dropdowns ---
  const [provincias, setProvincias] = useState<DropdownItem[]>([]);
  const [unidades, setUnidades] = useState<DropdownItem[]>([]);
  const [agencias, setAgencias] = useState<DropdownItem[]>([]);

  // useEffect para cargar los datos una sola vez cuando la pantalla se monta
  useEffect(() => {
    const data = formService.getInformacionGeneralData(equipoId);
    if (data) {
      setCliente(data.datosPrecargados.cliente || '');
      setProvinciaValue(data.datosPrecargados.provincia);
      setUnidadValue(data.datosPrecargados.unidadNegocio);
      setAgenciaValue(data.datosPrecargados.agencia);

      setProvincias(data.listasDeOpciones.provincias);
      setUnidades(data.listasDeOpciones.unidadesNegocio);
      setAgencias(data.listasDeOpciones.agencias);
    }
  }, [equipoId]);

  const handleSaveAndContinue = async () => {
    const formData = {
      mantenimientoNo,
      cliente,
      provinciaId: provinciaValue,
      unidadNegocioId: unidadValue,
      agenciaId: agenciaValue,
    };
    await saveFormSection(equipoId, 'informacionGeneral', formData);
    console.log(
      'Datos de Información General guardados para la tarea:',
      equipoId,
    );
    navigation.navigate('InformacionEquipo', { equipoId });
  };

  // Función para añadir la opción "Añadir nuevo..."
  const getItemsConOpcionDeAnadir = (items: DropdownItem[]) => [
    { label: 'Añadir nueva opción...', value: 'add_new' },
    ...items,
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} nestedScrollEnabled={true}>
        <Text style={styles.label}>Mantenimiento No.</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={mantenimientoNo}
          onChangeText={setMantenimientoNo}
        />

        <Text style={styles.label}>Cliente</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={cliente}
          editable={false} // Hacemos que el campo no sea editable
        />

        <Text style={styles.label}>Provincia</Text>
        <DropDownPicker
          open={provinciaOpen}
          value={provinciaValue}
          items={provincias}
          setOpen={setProvinciaOpen}
          setValue={setProvinciaValue}
          setItems={setProvincias}
          style={styles.dropdown}
          placeholder="Selecciona una provincia"
          zIndex={3000}
        />

        <Text style={styles.label}>Unidad de Negocio</Text>
        <DropDownPicker
          open={unidadOpen}
          value={unidadValue}
          items={getItemsConOpcionDeAnadir(unidades)}
          setOpen={setUnidadOpen}
          setValue={setUnidadValue}
          setItems={setUnidades}
          style={styles.dropdown}
          placeholder="Selecciona una unidad"
          searchable={true}
          searchPlaceholder="Buscar..."
          onSelectItem={item => {
            if (item.value === 'add_new') {
              console.log('Abrir modal para añadir nueva Unidad de Negocio');
              // Aquí iría la lógica para mostrar un modal de creación
            }
          }}
          zIndex={2000}
        />

        <Text style={styles.label}>Agencia</Text>
        <DropDownPicker
          open={agenciaOpen}
          value={agenciaValue}
          items={getItemsConOpcionDeAnadir(agencias)}
          setOpen={setAgenciaOpen}
          setValue={setAgenciaValue}
          setItems={setAgencias}
          style={styles.dropdown}
          placeholder="Selecciona una agencia"
          searchable={true}
          searchPlaceholder="Buscar..."
          onSelectItem={item => {
            if (item.value === 'add_new') {
              console.log('Abrir modal para añadir nueva Agencia');
            }
          }}
          zIndex={1000}
        />

        <View style={styles.buttonContainer}>
          <BotonPrincipal
            title="Guardar y Continuar"
            onPress={handleSaveAndContinue}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  label: {
    fontFamily: FONTS.VersosVariableTest,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    fontFamily: FONTS.BricolageGrotesqueRegular,
    color: COLORS.textPrimary,
  },
  dropdown: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  buttonContainer: {
    marginTop: 40, // Espacio extra para el último dropdown
    marginBottom: 40,
    zIndex: -1, // Evita que los dropdowns se superpongan al botón
  },
  disabledInput: {
    backgroundColor: '#E0E0E0',
    color: '#757575',
  },
});

export default InformacionGeneralScreen;
