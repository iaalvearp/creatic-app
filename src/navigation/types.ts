import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TareaEnriquecida } from '../types/database';

// 1. Define el "contrato" completo para tu Stack de Formularios
export type FormStackNavigatorParamList = {
  FormMenu: { tarea: TareaEnriquecida };
  InformacionGeneral: { tareaId: number };
  InformacionEquipo: { tareaId: number };
  ActividadesMantenimiento: { tareaId: number };
  TareasDiagnostico: { tareaId: number };
  ReporteFotografico: { tareaId: number };
  Firmas: { tareaId: number };
};

// 2. Crea tipos específicos para las props de CADA pantalla
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
