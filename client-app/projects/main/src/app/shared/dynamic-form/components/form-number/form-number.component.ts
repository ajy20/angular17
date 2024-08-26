import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Field } from '../../models/field.interface';
import { FieldConfig } from '../../models/field-config.interface';
import { CommonModule } from '@angular/common';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, map, Observable } from 'rxjs';

@Component({
  selector: 'form-number',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbTypeaheadModule],
  templateUrl: './form-number.component.html',
  styleUrls: ['./form-number.component.css']
})
export class FormNumberComponent implements Field, OnInit {

  config!: FieldConfig;
  group!:FormGroup;

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
