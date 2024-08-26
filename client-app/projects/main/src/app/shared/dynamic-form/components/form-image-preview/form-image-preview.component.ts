import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'form-image-preview',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-image-preview.component.html',
  styleUrls: ['./form-image-preview.component.css']
})
export class FormImagePreviewComponent implements Field, OnInit {

  config!: FieldConfig;
  group!: FormGroup;

  ngOnInit() { }

}
