import { ComponentFactoryResolver, ComponentRef, Directive, Input, OnChanges, OnInit, Type, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '../models/field-config.interface';
import { Field } from '../models/field.interface';
import { FormInputComponent } from './form-input/form-input.component';
import { FormNumberComponent } from './form-number/form-number.component';
import { FormMultiSelectComponent } from './form-multi-select/form-multi-select.component';
import { FormMultiSelectListComponent } from './form-multi-select-list/form-multi-select-list.component';
import { FormSelectComponent } from './form-select/form-select.component';
import { FormCheckboxComponent } from './form-checkbox/form-checkbox.component';
import { FormCheckboxListComponent } from './form-checkbox-list/form-checkbox-list.component';
import { FormPasswordComponent } from './form-password/form-password.component';
import { FormFileComponent } from './form-file/form-file.component';
import { FormStaticComponent } from './form-static/form-static.component';
import { FormStaticAreaComponent } from './form-static-area/form-static-area.component';
import { FormDateComponent } from './form-date/form-date.component';
import { FormDateTimeComponent } from './form-date-time/form-date-time.component';
import { FormAreaComponent } from './form-area/form-area.component';
import { FormButtonComponent } from './form-button/form-button.component';
import { FormImagePreviewComponent } from './form-image-preview/form-image-preview.component';


const components: { [type: string]: Type<Field> } = {
  input: FormInputComponent,
  password: FormPasswordComponent,
  number: FormNumberComponent,
  select: FormSelectComponent,
  multiSelect: FormMultiSelectComponent,
  multiSelectList: FormMultiSelectListComponent,
  checkbox: FormCheckboxComponent,
  checkboxList: FormCheckboxListComponent,
  file: FormFileComponent,
  static: FormStaticComponent,
  area: FormAreaComponent,
  staticArea: FormStaticAreaComponent,
  date: FormDateComponent,
  datetime: FormDateTimeComponent,
  button: FormButtonComponent,
  image: FormImagePreviewComponent
}

@Directive({
  selector: '[dynamicField]',
  standalone: true
})
export class DynamicFieldDirective implements Field, OnInit, OnChanges {
  @Input() config!: FieldConfig;

  @Input() group!: FormGroup;

  component!: ComponentRef<Field>;

  constructor(private resolver: ComponentFactoryResolver, private container: ViewContainerRef) { }

  ngOnInit() {
    if (!components[this.config.type]) {
      const supportedTypes = Object.keys(components).join(', ');
      throw new Error(`Trying to use an unsupported type (${this.config.type}). Supported types: ${supportedTypes}`);
    }
    const component = this.resolver.resolveComponentFactory<Field>(components[this.config.type]);
    this.component = this.container.createComponent(component);
    this.component.instance.config = this.config;
    this.component.instance.group = this.group;
  }

  ngOnChanges() {
    this.config.labelSize = this.config.labelSize != undefined ? this.config.labelSize : 2;

    if (this.component) {
      this.component.instance.config = this.config;
      this.component.instance.group = this.group;
    }
  }
}
