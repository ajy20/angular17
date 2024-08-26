import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(value: any, args?: any): any {
    if (!args) {
      return value;
    }

    if (!value)
      return value;

    // Convert value to string in case this is a number
    const stringValue = '' + value;

    // Match in a case insensitive maneer
    const re = new RegExp(args, 'gi');
    const match = stringValue.match(re);

    // If there's no match, just return the original value.
    if (!match) {
      return stringValue;
    }

    const v = stringValue.replace(re, "<mark>" + match[0] + "</mark>")
    return this.sanitizer.bypassSecurityTrustHtml(v);
  }

}
