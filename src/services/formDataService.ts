import AsyncStorage from '@react-native-async-storage/async-storage';

const FORM_DATA_KEY_PREFIX = '@FormData:';

// Guarda los datos de una sección específica de un formulario para una tarea
export const saveFormSection = async (
  taskId: number,
  sectionName: string,
  data: object,
) => {
  try {
    const key = `${FORM_DATA_KEY_PREFIX}${taskId}`;
    // Primero, obtenemos los datos que ya existen para esa tarea
    const existingData = await getFormData(taskId);
    // Luego, fusionamos los datos nuevos con los existentes
    const newData = {
      ...existingData,
      [sectionName]: data,
    };
    await AsyncStorage.setItem(key, JSON.stringify(newData));
  } catch (e) {
    console.error('Error guardando los datos del formulario', e);
  }
};

// Obtiene todos los datos guardados para una tarea específica
export const getFormData = async (taskId: number) => {
  try {
    const key = `${FORM_DATA_KEY_PREFIX}${taskId}`;
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch (e) {
    console.error('Error obteniendo los datos del formulario', e);
    return {};
  }
};
