import type {
  NativeStackScreenProps,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { TareaIndividualEnriquecida } from '../types/database';

// Contrato para el Navegador de Stack Principal
export type RootStackNavigatorParamList = {
  Login: undefined;
  App: undefined;
  Formularios: NavigatorScreenParams<FormStackNavigatorParamList>;
};

// Contrato para el Navegador de Stack de Formularios
export type FormStackNavigatorParamList = {
  FormMenu: { tarea: TareaIndividualEnriquecida };
  InformacionGeneral: { equipoId: string };
  InformacionEquipo: { equipoId: string };
  ActividadesMantenimiento: { equipoId: string };
  TareasDiagnostico: { equipoId: string };
  ReporteFotografico: { equipoId: string };
  Firmas: { equipoId: string };
};

// Tipo de ayuda para la prop de navegación del Stack Principal
export type RootStackNavigationProp =
  NativeStackNavigationProp<RootStackNavigatorParamList>;

// --- 👇 Tipos de Props para CADA Pantalla del Formulario (ESTO ES LO QUE FALTABA) ---

export type FormMenuScreenProps = NativeStackScreenProps<
  FormStackNavigatorParamList,
  'FormMenu'
>;

export type InformacionGeneralScreenProps = NativeStackScreenProps<
  FormStackNavigatorParamList,
  'InformacionGeneral'
>;

export type InformacionEquipoScreenProps = NativeStackScreenProps<
  FormStackNavigatorParamList,
  'InformacionEquipo'
>;

export type ActividadesMantenimientoScreenProps = NativeStackScreenProps<
  FormStackNavigatorParamList,
  'ActividadesMantenimiento'
>;

export type TareasDiagnosticoScreenProps = NativeStackScreenProps<
  FormStackNavigatorParamList,
  'TareasDiagnostico'
>;

export type ReporteFotograficoScreenProps = NativeStackScreenProps<
  FormStackNavigatorParamList,
  'ReporteFotografico'
>;

export type FirmasScreenProps = NativeStackScreenProps<
  FormStackNavigatorParamList,
  'Firmas'
>;
