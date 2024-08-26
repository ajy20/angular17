import { HttpClient } from '@angular/common/http';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { map, Observable, of } from 'rxjs';

@Pipe({
  name: 'secure',
  standalone: true
})
export class SecurePipe implements PipeTransform {

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) { }

  transform(url: string): Observable<SafeUrl | null> {
    if (!url) return of(null);
    return this.http
      .get(url, { responseType: 'blob' })
      .pipe(map(val => this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(val))));
  }
}
