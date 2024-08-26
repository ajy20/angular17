import { Component, ViewContainerRef } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'form-static',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 'form-static.component.html',
  styleUrls: ['form-static.component.css']
})
export class FormStaticComponent implements Field {
  config!: FieldConfig;
  group!: FormGroup;
}