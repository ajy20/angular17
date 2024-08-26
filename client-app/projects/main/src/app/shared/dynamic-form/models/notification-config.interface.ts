import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Button } from './button.interface';


export interface NotificationConfig {
  headerText?: string,
  submitText?: string,
  closeText?: string,
  hideCloseButton?: boolean,
  size?: NgbModalOptions['size'],
  backdrop?: NgbModalOptions['backdrop']
  windowClass?: NgbModalOptions['windowClass']
  notifications: string[],
  extraButtons?: Button[],
  onSubmit?: (e: any) => void,
  onDismiss?: (e: any) => void
}
