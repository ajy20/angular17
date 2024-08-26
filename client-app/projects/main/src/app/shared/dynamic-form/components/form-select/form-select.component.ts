import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'form-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 'form-select.component.html',
  styleUrls: ['form-select.component.css']
})
export class FormSelectComponent implements Field, OnInit {
  config!: FieldConfig;
  group!: FormGroup;
  options!: { key: any, value: string }[];

  ngOnInit() {
    const sorter = {
      asc: (a: { value: string }, b: { value: string }) => { return a.value === b.value ? 0 : (a.value > b.value ? 1 : -1) },
      desc: (a: { value: string }, b: { value: string }) => { return a.value === b.value ? 0 : (a.value < b.value ? 1 : -1) },
      none: undefined
    }

    this.config.sortOptions = this.config.sortOptions || 'none';

    if (this.config.options)
      this.options = this.config.options.sort(sorter[this.config.sortOptions]);
    else
      this.options = [];
  }

}
