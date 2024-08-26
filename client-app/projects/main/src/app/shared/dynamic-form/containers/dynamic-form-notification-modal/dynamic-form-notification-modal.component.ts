import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NotificationConfig } from '../../models/notification-config.interface';

@Component({
  selector: 'csps-dynamic-form-notification-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dynamic-form-notification-modal.component.html',
  styleUrl: './dynamic-form-notification-modal.component.scss'
})
export class DynamicFormNotificationModalComponent implements OnInit {
  @Input()
  config!: NotificationConfig;

  @Output()
  submitted: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  dismissed: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  submitForm(method: any) {
    this.submitted.emit(method);
  }

  dismissForm(method: any) {
    this.dismissed.emit(method);
  }
}
