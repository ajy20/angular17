import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectListItemComponent } from '../multi-select-item/multi-select-item.component';

@Component({
  selector: 'multi-select-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MultiSelectListItemComponent],
  templateUrl: './multi-select-list.component.html',
  styleUrls: ['./multi-select-list.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectListComponent),
      multi: true
    }
  ],
})
export class MultiSelectListComponent implements ControlValueAccessor {
  private onChange!: (m: any) => void;
  private onTouched!: (m: any) => void;

  @Input() options!: { key: any, value: string }[];
  @Input() placeholder!: string;

  groups: { options: { key: any, value: string, selected: boolean }[] }[] = [];

  get value() {
    return this.groups.map(g => g.options.filter(o => o.selected).map(o => o.key));
  }

  writeValue(v: any): void {
    if (v)
      this.groups = v.map((x: any) => ({
        options: this.options.map(o => ({
          ...o,
          selected: !!x?.includes(o.key)
        }))
      }))

    if (this.onChange)
      this.onChange(this.value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  addGroup(): void {
    this.writeValue([...this.value, []])
  }

  updateValue() {
    if (this.onChange)
      this.onChange(this.value);
  }
}
