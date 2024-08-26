import { Component, ViewContainerRef } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'csps-form-checkbox-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-checkbox-list.component.html',
  styleUrls: ['./form-checkbox-list.component.css']
})
export class FormCheckboxListComponent implements Field {

  constructor() { }
  config!: FieldConfig;
  group!: FormGroup;
}
