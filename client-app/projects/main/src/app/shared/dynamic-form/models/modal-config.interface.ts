import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FieldConfig } from './field-config.interface';
import { Button } from './button.interface';

export interface ModalConfig {
  headerText?: string,
  submitText?: string,
  closeText?: string,
  hideCloseButton?: boolean,
  size?: NgbModalOptions['size'],
  backdrop?: NgbModalOptions['backdrop'],
  windowClass?: NgbModalOptions['windowClass'],
  fields: FieldConfig[],
  extraButtons?: Button[],
  labelSize?: number,
  hidePasteArea?: boolean,
  hideAddRowOption?: boolean,
  hideDeleteOption?: boolean,
  presetRows?: [],
  onSubmit?: (e: any) => void,
  onDismiss?: (e: any) => void
}
