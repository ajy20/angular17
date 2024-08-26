import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, map, Observable } from 'rxjs';
import { FieldConfig } from '../../models/field-config.interface';
import { Field } from '../../models/field.interface';

@Component({
  selector: 'csps-form-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbTypeaheadModule],
  templateUrl: './form-input.component.html',
  styleUrl: './form-input.component.scss'
})
export class FormInputComponent implements Field, OnInit {
  config!: FieldConfig;
  group!: FormGroup;

  formatter!: (x: any) => any;
  typeAhead!: (text$: Observable<string>) => Observable<any>;


  ngOnInit(): void {
    this.formatter = this.config.formatter ?? this.defaultFormatter;
    this.typeAhead = this.config.typeAhead ?? this.defaultTypeAhead;
  }


  defaultTypeAhead = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(2000),
      distinctUntilChanged(),
      map(term => [])
    );

  defaultFormatter = (x: any) => x;
}
