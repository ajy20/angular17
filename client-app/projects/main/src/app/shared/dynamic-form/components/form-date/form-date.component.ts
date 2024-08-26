import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'csps-form-date',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-date.component.html',
  styleUrls: ['./form-date.component.css']
})
export class FormDateComponent implements Field {

  config!: FieldConfig;
  group!:FormGroup;

}