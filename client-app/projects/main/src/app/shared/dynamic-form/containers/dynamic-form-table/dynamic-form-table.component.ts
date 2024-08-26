import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faExclamationTriangle, faPlus, faTimes, faTrash, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { NgbTooltip, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DynamicFieldDirective } from '../../components/dynamic-field.directive';
import { FieldConfig } from '../../models/field-config.interface';

@Component({
  exportAs: 'dynamicFormTable',
  selector: 'csps-dynamic-form-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, NgbTooltipModule, DynamicFieldDirective],
  templateUrl: './dynamic-form-table.component.html',
  styleUrl: './dynamic-form-table.component.scss'
})
export class DynamicFormTableComponent implements OnInit {
  @Input()
  config: FieldConfig[] = [];

  @Input()
  hidePasteArea: boolean | undefined;

  @Input()
  hideAddRowOption: boolean | undefined;

  @Input()
  hideDeleteOption: boolean | undefined;

  @Input()
  presetRows: any = [];

  @Output()
  submit: EventEmitter<any> = new EventEmitter<any>();

  // Icons
  faTrash: IconDefinition = faTrash;
  faTimes: IconDefinition = faTimes;
  faPlus: IconDefinition = faPlus;
  faExclamationTriangle: IconDefinition = faExclamationTriangle;


  form!: FormGroup;

  pastedText: string = '';

  get controls() { return this.config.filter(({ type }) => type !== 'button'); }
  get changes() { return this.form.valueChanges; }
  get valid() { return this.form.valid; }
  get value() { return this.form.getRawValue(); }

  get rows() {
    return this.form.get('rows') as FormArray;
  }

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.form = this.createGroup();

    // Check if presetRows are provided to pre-populate table rows with existing data
    if (this.presetRows?.length)
      this.presetDynamicFormTable(this.presetRows);
  }

  createGroup() {
    // Extract default values
    const defaultValues = this.config.reduce((acc, x) => { acc[x.name] = x.value; return acc; }, {} as { [key: string]: any });

    const group = this.fb.group({
      rows: this.fb.array([this.createRowControls(defaultValues)])
    });
    return group;
  }

  createRowControls(rowValues: any) {
    const row = this.fb.group({});
    this.controls.forEach((control, i) => row.addControl(control.name, this.createControl(control, rowValues[control.name])));
    return row;
  }

  createControl(config: FieldConfig, rowValue: any) {
    config.value = rowValue;
    const { disabled, validation, value } = config;
    return this.fb.control({ disabled, value }, validation);
  }

  addRow() {
    this.rows.push(this.createRowControls({}));
  }

  deleteRow(index: number) {
    this.rows.removeAt(index);
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.submit.emit(this.value);
  }

  setDisabled(name: string, disable: boolean) {
    if (this.form.controls[name]) {
      const method = disable ? 'disable' : 'enable';
      this.form.controls[name][method]();
      this.cdr.detectChanges();
      return;
    }

    this.config = this.config.map((item) => {
      if (item.name === name) {
        item.disabled = disable;
      }
      this.cdr.detectChanges();
      return item;
    });
  }

  setValue(name: string, value: any) {
    this.form.controls[name].setValue(value, { emitEvent: true });
    this.cdr.detectChanges();
  }

  getErrors(row: FormArray) {
    let errors: string[] = [];
    Object.keys(row.controls).forEach(x => {
      const abstractControl = row.get(x);
      if (abstractControl instanceof FormControl) {
        const ctrl = abstractControl as FormControl;
        if (!ctrl.valid && ctrl.errors) {
          errors.push(...Object.keys(ctrl.errors).map(y => (ctrl.errors || {})[y]));
        }
      }
    });

    return errors;
  }

  toggleErrorTooltip(tooltip: NgbTooltip, row: FormArray) {
    if (tooltip.isOpen())
      tooltip.close()
    else
      tooltip.open({ errors: this.getErrors(row) })
  }

  processPaste(e: ClipboardEvent) {
    // Retrieve the pasted data
    const pasted = e["clipboardData"] == null ? '' : e["clipboardData"].getData('text');  // TODO Cedric test for cross browser compatibility

    // Retrieve rows by splitting on line feeds
    let pastedRows = pasted.split('\r\n');

    // Remove last entry if empty
    if (pastedRows[pastedRows.length - 1] === '') pastedRows.splice(pastedRows.length - 1, 1);

    // Clear empty rows from form
    this.clearEmptyRows();

    // Loop through each rows and create objects
    pastedRows.forEach(r => {
      let row: { [key: string]: any } = {};
      // Retrieve values by splitting on columns
      const vals = r.split('\t');
      // Loop through fields
      this.config.forEach((f, i) => {
        // if lookup field
        if (f.type === 'select' && f.options) {
          const opt = f.options.find(x => x.value === vals[i]);
          row[f.name] = (opt || { key: null }).key;
        }
        // if date
        else if (f.type === 'date') {
          row[f.name] = this.checkDateFormat(vals[i]) ? new Date(vals[i]) : null;
        }
        // if checkbox
        else if (f.type === 'checkbox') {
          switch (vals[i].toString().toLowerCase()) {
            case "true":
            case "1":
            case "on":
            case "yes":
              row[f.name] = true;
              break;
            default:
              row[f.name] = false;
              break;
          }
        }
        else {
          row[f.name] = vals[i];
        }
      });

      this.rows.push(this.createRowControls(row));
    });

    setTimeout(() => this.pastedText = "", 0)
  }

  clearEmptyRows() {
    const rawValues = this.rows.getRawValue();

    for (var i = rawValues.length - 1; i >= 0; i--) {
      if (Object.values(rawValues[i]).every(x => (x == null || x === '')))
        this.deleteRow(i);
      else
        return;
    }
  }

  checkDateFormat(dateString: string) {
    const dateRegEx = new RegExp("^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$");
    return dateRegEx.exec(dateString) !== null;
  }

  presetDynamicFormTable(rows: any) {
    // Remove first empty rows
    this.clearEmptyRows();

    // Add rows with data into table
    rows.forEach((row: any) => {
      this.rows.push(this.createRowControls(row));
    });
  }
}
