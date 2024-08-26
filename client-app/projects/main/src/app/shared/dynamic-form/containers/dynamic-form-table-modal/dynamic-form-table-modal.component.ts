import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { ModalConfig } from '../../models/modal-config.interface';
import { DynamicFormTableComponent } from '../dynamic-form-table/dynamic-form-table.component';

@Component({
  selector: 'csps-dynamic-form-table-modal',
  standalone: true,
  imports: [CommonModule, DynamicFormTableComponent],
  templateUrl: './dynamic-form-table-modal.component.html',
  styleUrl: './dynamic-form-table-modal.component.scss'
})
export class DynamicFormTableModalComponent implements AfterViewInit, OnInit, OnChanges {
  @ViewChild(DynamicFormTableComponent) form!: DynamicFormTableComponent;

  @Input()
  config!: ModalConfig;

  @Output()
  submitted: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  dismissed: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    this.config.fields.forEach(x => x.labelSize = 0)
  }

  ngOnChanges() {
    this.config.fields.forEach(x => x.labelSize = 0)
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

  submitForm(event: any) {
    this.submitted.emit(this.form.value);
  }

  dismissForm(method: any) {
    this.dismissed.emit(method);
  }
}
