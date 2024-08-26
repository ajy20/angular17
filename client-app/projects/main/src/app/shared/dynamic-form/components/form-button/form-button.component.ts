import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'form-button',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 'form-button.component.html',
  styleUrls: ['form-button.component.css'],
})
export class FormButtonComponent implements Field {
  config!: FieldConfig;
  group!: FormGroup;
}