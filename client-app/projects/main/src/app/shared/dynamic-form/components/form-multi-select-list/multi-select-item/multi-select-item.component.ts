import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Host, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'multi-select-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './multi-select-item.component.html',
  styleUrls: ['./multi-select-item.component.css']
})

export class MultiSelectListItemComponent implements OnInit {
  @Input() placeholder!: string;
  @Input() options!: { key: any, value: string, selected: boolean }[];
  @Input() disabled!: boolean;
  @Output() valueUpdated: EventEmitter<string[]> = new EventEmitter<string[]>();
  model: any;

  showDropDown: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.writeValue(this.value);
    });
  }

  get value() {
    return this.options.filter(o => o.selected).map(o => o.key);
  }

  writeValue(val: any): void {
    const valueArray = val instanceof Array ? val : [val];
    const textArray = valueArray.map(v => this.options.find(o => o.key === v)?.value);
    this.model = textArray.length <= 2 ? textArray.join(', ') : textArray.slice(0, 2).join(', ') + ' (+' + (textArray.length - 2) + ')';

    this.valueUpdated.emit(this.value);
  }

  addOrRemove(option: { key: any, value: string, selected: boolean }) {
    setTimeout(() => {
      this.writeValue(this.value);
    });
  }
}
