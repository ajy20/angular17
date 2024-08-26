import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { memoize } from '../../../shared/memoize/memoize.decorator';

@Component({
  selector: 'csps-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(private httpClient: HttpClient) { }

  response!: any;

  counter: number = 0;

  ids: string[] = [
    '52bf9b4b-b5fa-4e25-969c-03fd589a5a69',
    'd27d550c-1348-4895-9fb8-0f3cd01bd674',
    'cb4f9df5-3d7b-46c2-95e9-e1cb236f8f96'
  ];


  test(): void {
    this.response = null;
    this.getData(this.ids[this.counter++ % 3]).subscribe(x => {
      this.response = x;
    })
  }


  @memoize({ extractUniqueId: (args) => args?.[0], clearCacheTimeout: 5000 })
  getData(id: string): Observable<any> {
    const url = environment.baseUrl + 'factories/' + id;
    return this.httpClient.get(url).pipe(take(1));
  }
}
