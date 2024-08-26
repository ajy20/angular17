import { ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';
import { ModalConfig } from './modal-config.interface';

export interface FieldConfig {
  name: string,
  type: 'button' | 'input' | 'number' | 'select' | 'multiSelect' | 'multiSelectList' | 'checkbox' | 'checkboxList' | 'file' | 'static' | 'staticArea' | 'date' | 'area' | 'datetime' | 'image' | 'password',
  label?: string,
  placeholder?: string,
  value?: any,
  disabled?: boolean,
  options?: { key: any, value: string }[],
  sortOptions?: 'asc' | 'desc' | 'none',
  validation?: ValidatorFn[],
  prepend?: any,
  prependConfig?: ModalConfig,
  append?: any,
  appendConfig?: ModalConfig,
  labelSize?: number,
  typeAhead?: (text$: Observable<string>) => Observable<any>,
  formatter?: (x: any) => string,
  // Indicates when the value change event is emitted. Should be 'change' for all controls, except those where user needs to key in value, in which case blur should be used
  updateOn?: 'change' | 'blur',
  checkboxes?: FieldConfig[],  // What is that ?
}
