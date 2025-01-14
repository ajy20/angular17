import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shorten',
  standalone: true
})
export class ShortenPipe implements PipeTransform {

  transform(value: string, length?: number): string {
    return (value.length > (length || Infinity)) ? value.slice(0, length) + '.' : value;
  }

}
