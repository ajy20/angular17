import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, forwardRef, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'image-preview',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './image-preview.component.html',
  styleUrls: ['./image-preview.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImagePreviewComponent),
      multi: true
    }
  ],
})
export class ImagePreviewComponent implements ControlValueAccessor {
  @Output() disabled: EventEmitter<boolean> = new EventEmitter<boolean>();

  private onChange!: (m: any) => void;
  private onTouched!: (m: any) => void;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) { }

  src!: Observable<any>;
  url!: string;

  get value() {
    return this.url;
  }

  writeValue(val: string): void {

    if (!val) this.src = of(null);
    this.src = this.http
      .get(val, { responseType: 'blob' })
      .pipe(map(val => this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(val))));

    this.url = val;
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
    this.disabled.emit(isDisabled);
  }

}