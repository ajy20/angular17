import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DynamicFormModalComponent } from '../containers/dynamic-form-modal/dynamic-form-modal.component';
import { DynamicFormNotificationModalComponent } from '../containers/dynamic-form-notification-modal/dynamic-form-notification-modal.component';
import { DynamicFormTableModalComponent } from '../containers/dynamic-form-table-modal/dynamic-form-table-modal.component';
import { ModalConfig } from '../models/modal-config.interface';
import { NotificationConfig } from '../models/notification-config.interface';

@Injectable({
  providedIn: 'root'
})
export class DynamicFormService {

  constructor(private modalService: NgbModal) { }

  popDynamicFormModal(config: ModalConfig) {
    config.size = config.size || 'lg'; // Default to large modal
    config.backdrop = config.backdrop || 'static'; // Default to static background
    config.windowClass = config.windowClass || '';

    const modalRef = this.modalService.open(DynamicFormModalComponent, { size: config.size, backdrop: config.backdrop, windowClass: config.windowClass });
    modalRef.componentInstance.config = config;
    modalRef.componentInstance.submitted.subscribe(($e: any) => {
      modalRef.close();
      if (config.onSubmit)
        config.onSubmit($e);
    })
    modalRef.componentInstance.dismissed.subscribe(($e: any) => {
      modalRef.close();
      if (config.onDismiss)
        config.onDismiss($e);
    })
  }

  popDynamicFormTableModal(config: ModalConfig) {
    config.size = config.size || 'lg'; // Default to large modal
    config.backdrop = config.backdrop || 'static'; // Default to static background
    config.windowClass = config.windowClass || '';

    const modalRef = this.modalService.open(DynamicFormTableModalComponent, { size: config.size, backdrop: config.backdrop, windowClass: config.windowClass });
    modalRef.componentInstance.config = config;
    modalRef.componentInstance.submitted.subscribe(($e: any) => {
      modalRef.close();
      if (config.onSubmit)
        config.onSubmit($e);
    })
    modalRef.componentInstance.dismissed.subscribe(($e: any) => {
      modalRef.close();
      if (config.onDismiss)
        config.onDismiss($e);
    })
  }

  popNotification(config: NotificationConfig) {
    config.size = config.size || 'lg'; // Default to large modal
    config.backdrop = config.backdrop || 'static'; // Default to static background
    config.windowClass = config.windowClass || '';

    const modalRef = this.modalService.open(DynamicFormNotificationModalComponent, { size: config.size, backdrop: config.backdrop, windowClass: config.windowClass });
    modalRef.componentInstance.config = config;
    modalRef.componentInstance.submitted.subscribe(($e: any) => {
      modalRef.close();
      if (config.onSubmit)
        config.onSubmit($e);
    })
    modalRef.componentInstance.dismissed.subscribe(($e: any) => {
      modalRef.close();
      if (config.onDismiss)
        config.onDismiss($e);
    })
  }

  popModal(component: any, config: any) {
    config.size = config.size || 'lg'; // Default to large modal
    config.backdrop = config.backdrop || 'static'; // Default to static background
    config.windowClass = config.windowClass || '';

    const modalRef = this.modalService.open(component, { size: config.size, backdrop: config.backdrop, windowClass: config.windowClass });
    modalRef.componentInstance.config = config;
    modalRef.componentInstance.submitted.subscribe(($e: any) => {
      modalRef.close();
      if (config.onSubmit)
        config.onSubmit($e);
    })
    modalRef.componentInstance.dismissed.subscribe(($e: any) => {
      modalRef.close();
      if (config.onDismiss)
        config.onDismiss($e);
    })
  }
}
