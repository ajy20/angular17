import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import { CommonModule } from '@angular/common';
import { MultiSelectListComponent } from './multi-select-list/multi-select-list.component';

@Component({
  selector: 'form-multi-select-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MultiSelectListComponent],
  templateUrl: './form-multi-select-list.component.html',
  styleUrls: ['./form-multi-select-list.component.css']
})
export class FormMultiSelectListComponent implements Field {
  config!: FieldConfig;
  group!: FormGroup; 
}

