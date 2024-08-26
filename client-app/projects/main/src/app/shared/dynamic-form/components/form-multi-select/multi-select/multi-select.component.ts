import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'multi-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true
    }
  ],
})
export class MultiSelectComponent implements ControlValueAccessor {
  @Input() options!: { key: any, value: string, selected: boolean }[];
  @Input() placeholder!: string;
  @Output() disabled: EventEmitter<boolean> = new EventEmitter<boolean>();

  private onChange!: (m: any) => void;
  private onTouched!: (m: any) => void;

  model: any;

  showDropDown: boolean = false;

  selectAllCheckbox: boolean = false;

  isDisabled!: boolean;
  filteredOptions: { key: any, value: string, selected: boolean }[] = [];
  filterValue: string = '';

  get value() {
    return this.options.filter(o => o.selected).map(o => o.key);
  }

  writeValue(val: any): void {
    const valueArray = val instanceof Array ? val : [val];
    const textArray = valueArray.map(v => this.options.find(o => o.key === v)?.value);

    this.model = textArray.length <= 2 ? textArray.join(', ') : textArray.slice(0, 2).join(', ') + ' (+' + (textArray.length - 2) + ')';

    if (this.onChange)
      this.onChange(this.value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.disabled.emit(isDisabled);
  }

  toggleSelectAll() {
    this.options.forEach((option) => (option.selected = this.selectAllCheckbox));
    this.writeValue(this.value);
  }

  addOrRemove(option: { key: any, value: string, selected: boolean }) {
    this.writeValue(this.value);
    this.updateSelectAllCheckbox();
  }

  private updateSelectAllCheckbox() {
    this.selectAllCheckbox = this.options.every((option) => option.selected);
  }

  filterOptions(filterValue: string) {
    this.filterValue = filterValue;
    this.filteredOptions = this.options.filter(option => option.value.toLowerCase().includes(filterValue.toLowerCase()));
  }

  clearFilterInput() {
    this.filterValue = '';
    this.filteredOptions = this.options;
  }

  toggleDropDown() {
    this.showDropDown = !this.showDropDown;
    if (this.showDropDown)
      this.filteredOptions = this.options;
  }
}
