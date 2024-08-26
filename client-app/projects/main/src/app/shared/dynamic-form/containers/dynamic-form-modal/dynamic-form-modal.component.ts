import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { ModalConfig } from '../../models/modal-config.interface';
import { DynamicFormComponent } from '../dynamic-form/dynamic-form.component';

@Component({
  selector: 'csps-dynamic-form-modal',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent],
  templateUrl: './dynamic-form-modal.component.html',
  styleUrl: './dynamic-form-modal.component.scss'
})
export class DynamicFormModalComponent implements AfterViewInit, OnInit, OnChanges {
  @ViewChild(DynamicFormComponent) form!: DynamicFormComponent;

  @Input()
  config!: ModalConfig;

  @Output()
  submitted: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  dismissed: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit() {
    if (this.config.labelSize != null) // Need to catch null or undefined, hence using != and not !==
      this.config.fields.forEach(x => x.labelSize = this.config.labelSize)
  }

  ngOnChanges() {
    if (this.config.labelSize != null) // Need to catch null or undefined, hence using != and not !==
      this.config.fields.forEach(x => x.labelSize = this.config.labelSize)
  }

  ngAfterViewInit() {
    let previousValid = this.form.valid;
    this.form.changes.subscribe(() => {
      if (this.form.valid !== previousValid) {
        previousValid = this.form.valid;
        this.form.setDisabled('submit', !previousValid);
      }
    });
  }

  submitForm(method: any) {
    this.submitted.emit(this.form.value);
  }

  dismissForm(method: any) {
    this.dismissed.emit(method);
  }
}
