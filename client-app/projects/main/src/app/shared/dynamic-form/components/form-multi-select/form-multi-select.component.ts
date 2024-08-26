import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import { CommonModule } from '@angular/common';
import { MultiSelectComponent } from './multi-select/multi-select.component';

@Component({
  selector: 'form-multi-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MultiSelectComponent],
  templateUrl: './form-multi-select.component.html',
  styleUrls: ['./form-multi-select.component.css']
})
export class FormMultiSelectComponent implements Field, OnInit {
  config!: FieldConfig;
  group!: FormGroup;
  options!: { key: any, value: string, selected: boolean }[];

  ngOnInit() {
    // Retrieve the value
    const selectedOptions = this.group?.get(this.config.name)?.value || [];

    if (this.config.options)
      this.options = this.config.options.map(o => ({ ...o, selected: selectedOptions.includes(o.key) }));
    else
      this.options = [];
  }

}

