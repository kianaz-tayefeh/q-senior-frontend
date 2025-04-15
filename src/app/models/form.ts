import { InputComponentsEnum } from '../constants/form';

export interface FormInput {
  name: string;
  label: string;
  component: InputComponentsEnum;
  columns?: number;
  debounced?: boolean;
  props?: Record<string, any>;
}
