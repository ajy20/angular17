import { Component, ViewContainerRef } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'csps-form-static-area',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-static-area.component.html',
  styleUrls: ['./form-static-area.component.css']
})
export class FormStaticAreaComponent implements Field {
  config!: FieldConfig;
  group!: FormGroup;
}
