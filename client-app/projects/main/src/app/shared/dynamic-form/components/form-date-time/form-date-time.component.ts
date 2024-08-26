import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'csps-form-date-time',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-date-time.component.html',
  styleUrls: ['./form-date-time.component.css']
})
export class FormDateTimeComponent implements Field  {
  config!: FieldConfig;
  group!:FormGroup;

}
